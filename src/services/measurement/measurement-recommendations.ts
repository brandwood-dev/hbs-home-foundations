import { MEASUREMENT_MAX_PRODUCT_RECOMMENDATIONS } from "@/domain/measurement/measurement.constants";
import type {
  BlindMeasurementResult,
  CurtainMeasurementResult,
  MeasurementProductRecommendation,
  MeasurementRecommendationContext,
  MeasurementRules,
  MeasurementResult,
} from "@/domain/measurement/measurement.types";
import { isBlindResult } from "@/domain/measurement/measurement.types";
import type { Product, ProductVariant } from "@/domain/product/product.types";
import { formatCm } from "@/services/measurement/curtain-measurement";

/**
 * Quantité nécessaire selon l'unité de vente réelle du produit.
 * On ne devine jamais l'unité à partir du nom : on lit `sellingMode` et `packQuantity`.
 */
export function calculateRequiredQuantity(
  product: Product,
  variant: ProductVariant,
  panelCount: number,
): number {
  const perUnit =
    variant.packQuantity && variant.packQuantity > 0
      ? variant.packQuantity
      : product.sellingMode === "pair"
        ? 2
        : 1;
  return Math.max(1, Math.ceil(panelCount / perUnit));
}

export function sellingUnitLabel(product: Product, variant: ProductVariant): string {
  const perUnit =
    variant.packQuantity && variant.packQuantity > 0
      ? variant.packQuantity
      : product.sellingMode === "pair"
        ? 2
        : 1;
  if (perUnit > 1) return `Lot de ${perUnit} pans`;
  if (product.sellingMode === "pack") return "Pack complet";
  return "Vendu au pan";
}

function availabilityRank(variant: ProductVariant): number {
  switch (variant.availability) {
    case "in_stock":
      return 0;
    case "low_stock":
      return 1;
    case "made_to_order":
      return 2;
    default:
      return 3;
  }
}

function curtainCandidates(
  result: CurtainMeasurementResult,
  context: MeasurementRecommendationContext,
  products: Product[],
  rules: MeasurementRules,
): MeasurementProductRecommendation[] {
  const targetWidth = result.recommendedWidthPerPanelCm;
  const targetHeight = result.recommendedFinishedHeightCm;
  const tolerance = rules.curtain.recommendationWidthToleranceCm;
  const heightTolerance = rules.curtain.recommendationHeightToleranceCm;

  const out: MeasurementProductRecommendation[] = [];

  for (const product of products) {
    if (product.category !== context.projectType) continue;

    let best: MeasurementProductRecommendation | null = null;

    for (const variant of product.variants) {
      if (variant.availability === "out_of_stock") continue;
      // La largeur d'un pan doit couvrir la largeur nécessaire (tolérance basse limitée).
      const widthDifferenceCm = variant.widthCm - targetWidth;
      if (widthDifferenceCm < -tolerance) continue;

      const heightDifferenceCm = variant.heightCm - targetHeight;
      if (heightDifferenceCm < -heightTolerance) continue;

      if (context.preferredHeader && variant.curtainHeader) {
        if (variant.curtainHeader !== context.preferredHeader) continue;
      }
      if (context.supportType === "rail" && variant.curtainHeader === "oeillets") continue;

      const reasons: string[] = [];
      const level: MeasurementProductRecommendation["recommendationLevel"] =
        Math.abs(widthDifferenceCm) <= 2 && Math.abs(heightDifferenceCm) <= 2
          ? "exact"
          : Math.abs(heightDifferenceCm) <= heightTolerance
            ? "compatible"
            : "approximate";

      reasons.push(
        `Largeur du pan ${formatCm(variant.widthCm)} pour ${formatCm(targetWidth)} nécessaires.`,
      );
      reasons.push(
        heightDifferenceCm >= 0
          ? `Hauteur ${formatCm(variant.heightCm)}, soit ${formatCm(heightDifferenceCm)} de marge à ajuster.`
          : `Hauteur ${formatCm(variant.heightCm)}, légèrement plus courte que la hauteur visée.`,
      );
      if (variant.curtainHeader) reasons.push("Finition de tête compatible avec votre support.");

      const candidate: MeasurementProductRecommendation = {
        product,
        variant,
        requiredQuantity: calculateRequiredQuantity(product, variant, context.panelCount ?? 2),
        recommendationLevel: level,
        widthDifferenceCm,
        heightDifferenceCm,
        reasons,
      };

      if (
        !best ||
        Math.abs(candidate.heightDifferenceCm) < Math.abs(best.heightDifferenceCm) ||
        (Math.abs(candidate.heightDifferenceCm) === Math.abs(best.heightDifferenceCm) &&
          candidate.widthDifferenceCm < best.widthDifferenceCm)
      ) {
        best = candidate;
      }
    }

    if (best) out.push(best);
  }

  return out.sort(
    (a, b) =>
      levelRank(a.recommendationLevel) - levelRank(b.recommendationLevel) ||
      Math.abs(a.heightDifferenceCm) - Math.abs(b.heightDifferenceCm) ||
      availabilityRank(a.variant) - availabilityRank(b.variant) ||
      a.variant.price.amountMinor - b.variant.price.amountMinor ||
      b.product.recommendationScore - a.product.recommendationScore,
  );
}

function levelRank(level: MeasurementProductRecommendation["recommendationLevel"]): number {
  return level === "exact" ? 0 : level === "compatible" ? 1 : 2;
}

function blindCandidates(
  result: BlindMeasurementResult,
  context: MeasurementRecommendationContext,
  products: Product[],
  rules: MeasurementRules,
): MeasurementProductRecommendation[] {
  const inside = result.mountingPosition === "dans_encadrement";
  const targetWidth = result.recommendedProductWidthCm;
  const targetHeight = result.recommendedProductHeightCm;
  const widthTolerance = rules.blind.recommendationWidthToleranceCm;
  const heightTolerance = rules.blind.recommendationHeightToleranceCm;

  const out: MeasurementProductRecommendation[] = [];

  for (const product of products) {
    if (product.category !== "stores") continue;
    if (context.preferredBlindType && product.blindType !== context.preferredBlindType) continue;

    let best: MeasurementProductRecommendation | null = null;

    for (const variant of product.variants) {
      if (variant.availability === "out_of_stock") continue;
      if (
        context.preferredMountingType &&
        variant.blindMountingType &&
        variant.blindMountingType !== context.preferredMountingType
      ) {
        continue;
      }

      const widthDifferenceCm = variant.widthCm - targetWidth;
      const heightDifferenceCm = variant.heightCm - targetHeight;

      if (inside) {
        // Jamais plus large que l'espace disponible (au-delà de la tolérance).
        if (widthDifferenceCm > widthTolerance) continue;
        if (widthDifferenceCm < -10) continue;
        if (heightDifferenceCm < -heightTolerance) continue;
      } else {
        if (widthDifferenceCm < -widthTolerance) continue;
        if (heightDifferenceCm < -heightTolerance) continue;
      }

      const level: MeasurementProductRecommendation["recommendationLevel"] =
        Math.abs(widthDifferenceCm) <= 1
          ? "exact"
          : Math.abs(widthDifferenceCm) <= widthTolerance + 3
            ? "compatible"
            : "approximate";

      const reasons = [
        inside
          ? `Largeur ${formatCm(variant.widthCm)} pour ${formatCm(targetWidth)} disponibles dans l'encadrement.`
          : `Largeur ${formatCm(variant.widthCm)} couvrant les ${formatCm(targetWidth)} recommandés.`,
        `Hauteur ${formatCm(variant.heightCm)} pour ${formatCm(targetHeight)} recommandés.`,
      ];
      if (variant.blindMountingType) reasons.push("Mode de pose compatible avec votre choix.");

      const candidate: MeasurementProductRecommendation = {
        product,
        variant,
        requiredQuantity: 1,
        recommendationLevel: level,
        widthDifferenceCm,
        heightDifferenceCm,
        reasons,
      };

      if (!best || Math.abs(candidate.widthDifferenceCm) < Math.abs(best.widthDifferenceCm)) {
        best = candidate;
      }
    }

    if (best) out.push(best);
  }

  return out.sort(
    (a, b) =>
      levelRank(a.recommendationLevel) - levelRank(b.recommendationLevel) ||
      Math.abs(a.widthDifferenceCm) - Math.abs(b.widthDifferenceCm) ||
      availabilityRank(a.variant) - availabilityRank(b.variant) ||
      a.variant.price.amountMinor - b.variant.price.amountMinor,
  );
}

export function findMeasurementProductRecommendations(
  result: MeasurementResult,
  context: MeasurementRecommendationContext,
  products: Product[],
  rules: MeasurementRules,
): MeasurementProductRecommendation[] {
  const hits = isBlindResult(result)
    ? blindCandidates(result, context, products, rules)
    : curtainCandidates(result, context, products, rules);
  return hits.slice(0, MEASUREMENT_MAX_PRODUCT_RECOMMENDATIONS);
}
