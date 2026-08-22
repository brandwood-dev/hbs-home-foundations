import type { Product } from "@/domain/product/product.types";
import type { ResolvedFavorites } from "@/domain/favorites/favorites.types";
import { FavoritesError } from "@/domain/favorites/favorites.errors";
import { HbsApiClient, HbsApiError } from "@/api/client";
import type { FavoritesRepository } from "@/repositories/interfaces/FavoritesRepository";
import { readFavorites, writeFavorites } from "@/repositories/local/favorites-storage";
import {
  FAVORITES_SYNC_STORAGE_KEY,
  FAVORITES_UPDATED_EVENT,
} from "@/domain/favorites/favorites.constants";

interface ApiFavoriteItem {
  productId: string;
  addedAt: string;
  product: Product;
  isAvailable: boolean;
}

interface ApiFavoritesResponse {
  items: ApiFavoriteItem[];
  removedProductIds: string[];
  count: number;
}

function mapFavorites(response: ApiFavoritesResponse): ResolvedFavorites {
  return {
    items: response.items.map((item) => ({
      productId: item.productId,
      addedAt: item.addedAt,
      product: item.product,
      isAvailable: item.isAvailable,
    })),
    removedProductIds: response.removedProductIds,
    count: response.count,
  };
}

function notifyFavoritesUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT));
  try {
    window.localStorage.setItem(FAVORITES_SYNC_STORAGE_KEY, String(Date.now()));
  } catch {
    // Cross-tab notification is best-effort and must not break a successful API mutation.
  }
}

function mapError(error: unknown): never {
  if (error instanceof HbsApiError) {
    if (error.status === 404) {
      throw new FavoritesError("product_not_found", "Produit introuvable");
    }
    if (error.status === 409) {
      throw new FavoritesError("limit_reached", "Limite de favoris atteinte");
    }
  }
  throw error;
}

/**
 * Server-backed guest favorites. A one-time, best-effort migration imports
 * existing local favorites only after every API write succeeds.
 */
export class ApiFavoritesRepository implements FavoritesRepository {
  private migrationComplete = false;
  private migrationPromise: Promise<boolean> | null = null;

  constructor(private readonly apiClient: HbsApiClient = new HbsApiClient()) {}

  private async migrateLocalFavorites(): Promise<boolean> {
    if (this.migrationComplete) return false;
    if (!this.migrationPromise) {
      this.migrationPromise = this.runLocalMigration();
    }
    try {
      return await this.migrationPromise;
    } finally {
      this.migrationPromise = null;
    }
  }

  private async runLocalMigration(): Promise<boolean> {
    const localItems = readFavorites().items;
    if (localItems.length === 0) {
      this.migrationComplete = true;
      return false;
    }

    let imported = false;
    for (const item of localItems) {
      try {
        await this.apiClient.post<ApiFavoritesResponse>("/api/v1/favorites/items", {
          productId: item.productId,
        });
        imported = true;
      } catch (error) {
        // A product removed from the published catalog is safe to drop during
        // migration. Network/server failures keep local data for a retry.
        if (!(error instanceof HbsApiError) || error.status !== 404) {
          throw error;
        }
      }
    }

    try {
      writeFavorites([]);
    } catch {
      // Server data is authoritative after a successful import; localStorage
      // can be unavailable in private browsing and must not break the API.
    }
    this.migrationComplete = true;
    return imported;
  }

  async get(): Promise<ResolvedFavorites> {
    const localItems = readFavorites().items;
    try {
      const response = await this.apiClient.get<ApiFavoritesResponse>("/api/v1/favorites");
      const imported = await this.migrateLocalFavorites();
      if (!imported && localItems.length === 0) return mapFavorites(response);
      return mapFavorites(await this.apiClient.get<ApiFavoritesResponse>("/api/v1/favorites"));
    } catch (error) {
      return mapError(error);
    }
  }

  async listIds(): Promise<string[]> {
    const favorites = await this.get();
    return favorites.items.map((item) => item.productId);
  }

  async add(productId: string): Promise<ResolvedFavorites> {
    try {
      await this.migrateLocalFavorites();
      const favorites = mapFavorites(
        await this.apiClient.post<ApiFavoritesResponse>("/api/v1/favorites/items", { productId }),
      );
      notifyFavoritesUpdated();
      return favorites;
    } catch (error) {
      return mapError(error);
    }
  }

  async remove(productId: string): Promise<ResolvedFavorites> {
    try {
      await this.migrateLocalFavorites();
      const favorites = mapFavorites(
        await this.apiClient.delete<ApiFavoritesResponse>(
          `/api/v1/favorites/items/${encodeURIComponent(productId)}`,
        ),
      );
      notifyFavoritesUpdated();
      return favorites;
    } catch (error) {
      return mapError(error);
    }
  }

  async toggle(productId: string): Promise<{
    favorites: ResolvedFavorites;
    isFavorite: boolean;
  }> {
    const current = await this.get();
    const isFavorite = current.items.some((item) => item.productId === productId);
    const favorites = isFavorite ? await this.remove(productId) : await this.add(productId);
    return { favorites, isFavorite: !isFavorite };
  }

  async clear(): Promise<ResolvedFavorites> {
    try {
      await this.migrateLocalFavorites();
      const favorites = mapFavorites(
        await this.apiClient.delete<ApiFavoritesResponse>("/api/v1/favorites"),
      );
      try {
        writeFavorites([]);
      } catch {
        /* localStorage is only a migration source in API mode */
      }
      notifyFavoritesUpdated();
      return favorites;
    } catch (error) {
      return mapError(error);
    }
  }
}
