import type { Product } from "@/domain/product/product.types";
import { getCatalogGroup } from "@/fixtures/catalog-pages.fixture";

export interface ProductTaxonomyPath {
  rootSlug: string;
  subcategorySlug?: string;
}

/**
 * Extract the published catalogue taxonomy from a product's canonical URL.
 *
 * Product responses use the API taxonomy (for example
 * `/rideaux-voilages/velours/...`) while older fixture/cart records may not
 * have a canonical path yet. Keep the family route as a safe fallback for
 * those records.
 */
export function getProductTaxonomyPath(
  product: Pick<Product, "category" | "canonicalPath">,
): ProductTaxonomyPath {
  const segments = product.canonicalPath?.trim().split("/").filter(Boolean) ?? [];
  const isCatalogPath = segments.length >= 2 && segments[0] !== "produit";

  if (isCatalogPath) {
    return {
      rootSlug: segments[0]!,
      ...(segments.length >= 3 ? { subcategorySlug: segments[1]! } : {}),
    };
  }

  const fallbackRootSlug = getCatalogGroup(product.category).path.split("/").filter(Boolean)[0];
  return { rootSlug: fallbackRootSlug ?? product.category };
}
