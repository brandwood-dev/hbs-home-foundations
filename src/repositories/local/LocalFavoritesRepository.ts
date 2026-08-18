import { FAVORITES_MAX_ITEMS } from "@/domain/favorites/favorites.constants";
import { FavoritesError } from "@/domain/favorites/favorites.errors";
import type { ResolvedFavorites } from "@/domain/favorites/favorites.types";
import type { FavoritesRepository } from "@/repositories/interfaces/FavoritesRepository";
import type { ProductRepository } from "@/repositories/interfaces/ProductRepository";
import { readFavorites, writeFavorites } from "@/repositories/local/favorites-storage";
import { resolveFavorites } from "@/services/favorites/favorites-resolver";

/**
 * Favoris persistés localement puis résolus contre le catalogue.
 * Même contrat que la future ApiFavoritesRepository (compte client).
 */
export class LocalFavoritesRepository implements FavoritesRepository {
  constructor(private readonly products: ProductRepository) {}

  private async resolve(): Promise<ResolvedFavorites> {
    const persisted = readFavorites();
    if (persisted.items.length === 0) return { items: [], removedProductIds: [], count: 0 };

    const found = await this.products.getByIds(persisted.items.map((item) => item.productId));
    const resolved = resolveFavorites(persisted.items, found);

    // Nettoyage silencieux des produits retirés du catalogue.
    if (resolved.removedProductIds.length > 0) {
      try {
        writeFavorites(
          persisted.items.filter((item) => !resolved.removedProductIds.includes(item.productId)),
        );
      } catch {
        /* le stockage peut être indisponible : la lecture reste valide */
      }
    }
    return resolved;
  }

  async get(): Promise<ResolvedFavorites> {
    return this.resolve();
  }

  async listIds(): Promise<string[]> {
    return readFavorites().items.map((item) => item.productId);
  }

  async add(productId: string): Promise<ResolvedFavorites> {
    const product = await this.products.getById(productId);
    if (!product) throw new FavoritesError("product_not_found", "Produit introuvable");

    const current = readFavorites().items;
    if (current.some((item) => item.productId === productId)) return this.resolve();
    if (current.length >= FAVORITES_MAX_ITEMS) {
      throw new FavoritesError("limit_reached", "Limite de favoris atteinte");
    }

    writeFavorites([{ productId, addedAt: new Date().toISOString() }, ...current]);
    return this.resolve();
  }

  async remove(productId: string): Promise<ResolvedFavorites> {
    const current = readFavorites().items;
    writeFavorites(current.filter((item) => item.productId !== productId));
    return this.resolve();
  }

  async toggle(productId: string) {
    const isFavorite = readFavorites().items.some((item) => item.productId === productId);
    const favorites = isFavorite ? await this.remove(productId) : await this.add(productId);
    return { favorites, isFavorite: !isFavorite };
  }

  async clear(): Promise<ResolvedFavorites> {
    writeFavorites([]);
    return { items: [], removedProductIds: [], count: 0 };
  }
}
