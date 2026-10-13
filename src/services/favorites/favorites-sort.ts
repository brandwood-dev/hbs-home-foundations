import type { ResolvedFavoriteItem } from "@/domain/favorites/favorites.types";
import type { Product } from "@/domain/product/product.types";
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

  const comparators: Record<
    FavoritesSort,
    (a: ResolvedFavoriteItem, b: ResolvedFavoriteItem) => number
  > = {
    recent: (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime() || byName(a, b),
    price_asc: (a, b) => price(a) - price(b) || byName(a, b),
    price_desc: (a, b) => price(b) - price(a) || byName(a, b),
    name_asc: byName,
  };

  return [...items].sort(comparators[sort] ?? comparators.recent);
}

/**
 * Returns the taxonomy key used by the favorites filters.
 *
 * Prefer the current canonical path so an Admin taxonomy rename or a newly
 * created root category remains groupable without a frontend rebuild.
 */
export function favoriteCategoryKey(product: Pick<Product, "category" | "canonicalPath">): string {
  const canonicalRoot = product.canonicalPath
    ?.split("/")
    .map((segment) => segment.trim())
    .find((segment) => segment.length > 0 && segment !== "produit");
  if (canonicalRoot && canonicalRoot !== "produit") return canonicalRoot;

  const rawCategory = typeof product.category === "string" ? product.category.trim() : "";
  if (rawCategory && !/^(undefined|null)$/i.test(rawCategory)) return rawCategory;
  return "autres";
}

/** Compte les favoris par catégorie (fonction pure). */
export function countFavoritesByCategory(items: ResolvedFavoriteItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const category = favoriteCategoryKey(item.product);
    counts[category] = (counts[category] ?? 0) + 1;
  }
  return counts;
}

export function filterFavoritesByCategory(
  items: ResolvedFavoriteItem[],
  category: string | undefined,
): ResolvedFavoriteItem[] {
  return category
    ? items.filter((item) => favoriteCategoryKey(item.product) === category)
    : [...items];
}

/** Human-readable fallback for a dynamic or legacy category slug. */
export function fallbackFavoriteCategoryLabel(category: string): string {
  const normalized = category.trim().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  if (!normalized || /^(undefined|null|autres)$/i.test(normalized)) {
    return "Autres produits";
  }
  return normalized.replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("fr"));
}
