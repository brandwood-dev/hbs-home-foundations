import type { CatalogSort, Product } from "@/domain/product/product.types";
import { getDiscountPercentage, getProductStartingPrice } from "@/lib/money/money";

/** Stable sort: ties fall back to the original catalogue order. */
export function sortProducts(products: Product[], sort: CatalogSort): Product[] {
  const indexed = products.map((product, index) => ({ product, index }));

  const compare: Record<CatalogSort, (a: Product, b: Product) => number> = {
    recommended: (a, b) => b.recommendationScore - a.recommendationScore,
    newest: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    best_sellers: (a, b) =>
      Number(b.isBestSeller) - Number(a.isBestSeller) ||
      b.recommendationScore - a.recommendationScore,
    price_asc: (a, b) =>
      getProductStartingPrice(a).amountMinor - getProductStartingPrice(b).amountMinor,
    price_desc: (a, b) =>
      getProductStartingPrice(b).amountMinor - getProductStartingPrice(a).amountMinor,
    discount: (a, b) => getDiscountPercentage(b) - getDiscountPercentage(a),
  };

  const comparator = compare[sort];
  indexed.sort((a, b) => comparator(a.product, b.product) || a.index - b.index);
  return indexed.map((entry) => entry.product);
}
