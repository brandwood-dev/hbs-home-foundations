import { z } from "zod";
import {
  FAVORITES_MAX_ITEMS,
  FAVORITES_STORAGE_KEY,
  FAVORITES_UPDATED_EVENT,
  FAVORITES_VERSION,
} from "@/domain/favorites/favorites.constants";
import { FavoritesError } from "@/domain/favorites/favorites.errors";
import type { PersistedFavoriteItem, PersistedFavorites } from "@/domain/favorites/favorites.types";

const favoriteItemSchema = z.object({
  productId: z.string().min(1),
  addedAt: z.string().min(1),
});

export const persistedFavoritesSchema = z.object({
  version: z.literal(FAVORITES_VERSION),
  items: z.array(favoriteItemSchema),
});

export function createEmptyFavorites(): PersistedFavorites {
  return { version: FAVORITES_VERSION, items: [] };
}

/** Déduplique par produit, les ajouts les plus récents en tête. */
export function normalizeFavoriteItems(items: PersistedFavoriteItem[]): PersistedFavoriteItem[] {
  const seen = new Set<string>();
  const sorted = [...items].sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
  );
  const result: PersistedFavoriteItem[] = [];
  for (const item of sorted) {
    if (seen.has(item.productId)) continue;
    seen.add(item.productId);
    result.push(item);
    if (result.length >= FAVORITES_MAX_ITEMS) break;
  }
  return result;
}

export function parseFavorites(raw: string | null): PersistedFavorites {
  if (!raw) return createEmptyFavorites();
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return createEmptyFavorites();
  }
  const parsed = persistedFavoritesSchema.safeParse(migrate(json));
  if (!parsed.success) return createEmptyFavorites();
  return { version: FAVORITES_VERSION, items: normalizeFavoriteItems(parsed.data.items) };
}

import { migrateFavorites as migrate } from "@/repositories/local/favorites-migrations";

function getStorage(): Storage {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new FavoritesError("storage_unavailable", "localStorage indisponible");
  }
  return window.localStorage;
}

export function readFavorites(): PersistedFavorites {
  try {
    return parseFavorites(getStorage().getItem(FAVORITES_STORAGE_KEY));
  } catch {
    return createEmptyFavorites();
  }
}

export function writeFavorites(items: PersistedFavoriteItem[]): PersistedFavorites {
  const payload: PersistedFavorites = {
    version: FAVORITES_VERSION,
    items: normalizeFavoriteItems(items),
  };
  try {
    getStorage().setItem(FAVORITES_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT));
  } catch (error) {
    if (error instanceof FavoritesError) throw error;
    throw new FavoritesError("storage_write_failed", "Écriture des favoris impossible");
  }
  return payload;
}
