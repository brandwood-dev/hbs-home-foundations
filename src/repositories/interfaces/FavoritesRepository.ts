import type { ResolvedFavorites } from "@/domain/favorites/favorites.types";

export interface FavoritesRepository {
  /** Favoris résolus contre le catalogue — futur `GET /api/v1/favorites`. */
  get(): Promise<ResolvedFavorites>;
  /** Identifiants bruts, sans résolution catalogue (pour le compteur). */
  listIds(): Promise<string[]>;
  add(productId: string): Promise<ResolvedFavorites>;
  remove(productId: string): Promise<ResolvedFavorites>;
  toggle(productId: string): Promise<{ favorites: ResolvedFavorites; isFavorite: boolean }>;
  clear(): Promise<ResolvedFavorites>;
}
