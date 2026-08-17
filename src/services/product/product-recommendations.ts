import type { Product } from "@/domain/product/product.types";
import { getProductStartingPrice } from "@/lib/money/money";

/**
 * Score de proximité entre deux produits.
 * Même matière > même opacité > même mode de vente > gamme de prix proche.
 */
function similarityScore(base: Product, candidate: Product): number {
  let score = 0;
  if (candidate.material === base.material) score += 40;
  if (candidate.opacityLevel === base.opacityLevel) score += 25;
  if (candidate.sellingMode === base.sellingMode) score += 15;
  if (candidate.isThermal === base.isThermal) score += 5;

  const basePrice = getProductStartingPrice(base).amountMinor;
  const price = getProductStartingPrice(candidate).amountMinor;
  const gap = Math.abs(price - basePrice) / Math.max(basePrice, 1);
  score += Math.max(0, 15 - gap * 30);

  return score + candidate.recommendationScore / 100;
}

export function getRelatedProducts(base: Product, all: Product[], limit = 4): Product[] {
  return all
    .filter((product) => product.id !== base.id)
    .map((product) => ({ product, score: similarityScore(base, product) }))
    .sort((a, b) => b.score - a.score || a.product.id.localeCompare(b.product.id))
    .slice(0, limit)
    .map((entry) => entry.product);
}
