import type { ResolvedFavoriteItem } from "@/domain/favorites/favorites.types";
import type { ProductCategory } from "@/domain/product/product.types";
import { getProductStartingPrice } from "@/lib/money/money";

export type FavoritesSort = "recent" | "price_asc" | "price_desc" | "name_asc";

export const FAVORITES_SORT_LABELS: Record<FavoritesSort, string> = {
  recent: "Ajoutés récemment",
  price_asc: "Prix croissant",
  price_desc: "Prix décroissant",
  name_asc: "Nom A–Z",
};

/** Tri stable des favoris (fonction pure). */
export function sortFavorites(
  items: ResolvedFavoriteItem[],
  sort: FavoritesSort,
): ResolvedFavoriteItem[] {
  const byName = (a: ResolvedFavoriteItem, b: ResolvedFavoriteItem) =>
    a.product.name.localeCompare(b.product.name, "fr");
  const price = (item: ResolvedFavoriteItem) => getProductStartingPrice(item.product).amountMinor;

  const comparators: Record<FavoritesSort, (a: ResolvedFavoriteItem, b: ResolvedFavoriteItem) => number> =
    {
      recent: (a, b) =>
        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime() || byName(a, b),
      price_asc: (a, b) => price(a) - price(b) || byName(a, b),
      price_desc: (a, b) => price(b) - price(a) || byName(a, b),
      name_asc: byName,
    };

  return [...items].sort(comparators[sort] ?? comparators.recent);
}

/** Compte les favoris par catégorie (fonction pure). */
export function countFavoritesByCategory(
  items: ResolvedFavoriteItem[],
): Partial<Record<ProductCategory, number>> {
  const counts: Partial<Record<ProductCategory, number>> = {};
  for (const item of items) {
    counts[item.product.category] = (counts[item.product.category] ?? 0) + 1;
  }
  return counts;
}

export function filterFavoritesByCategory(
  items: ResolvedFavoriteItem[],
  category: ProductCategory | undefined,
): ResolvedFavoriteItem[] {
  return category ? items.filter((item) => item.product.category === category) : items;
}
