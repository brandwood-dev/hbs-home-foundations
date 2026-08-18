import type {
  PersistedFavoriteItem,
  ResolvedFavoriteItem,
  ResolvedFavorites,
} from "@/domain/favorites/favorites.types";
import type { Product } from "@/domain/product/product.types";

/** Un produit est jugé disponible si au moins une variante est commandable. */
export function isProductAvailable(product: Product): boolean {
  return product.variants.some((variant) => variant.availability !== "out_of_stock");
}

/**
 * Réconcilie les favoris persistés avec le catalogue courant.
 * Les produits disparus sont retournés séparément pour être nettoyés.
 */
export function resolveFavorites(
  persisted: PersistedFavoriteItem[],
  products: Product[],
): ResolvedFavorites {
  const byId = new Map(products.map((product) => [product.id, product]));
  const items: ResolvedFavoriteItem[] = [];
  const removedProductIds: string[] = [];

  for (const entry of persisted) {
    const product = byId.get(entry.productId);
    if (!product) {
      removedProductIds.push(entry.productId);
      continue;
    }
    items.push({
      productId: entry.productId,
      addedAt: entry.addedAt,
      product,
      isAvailable: isProductAvailable(product),
    });
  }

  items.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  return { items, removedProductIds, count: items.length };
}
