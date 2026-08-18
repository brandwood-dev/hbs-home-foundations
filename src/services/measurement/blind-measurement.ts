import { MEASUREMENT_DEVIATION_THRESHOLD_CM } from "@/domain/measurement/measurement.constants";
import type {
  BlindMeasurementInput,
  BlindMeasurementResult,
  MeasurementRules,
} from "@/domain/measurement/measurement.types";
import { formatCm } from "@/services/measurement/curtain-measurement";

/** Écart entre la plus petite et la plus grande mesure. */
export function measurementDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
}

export function hasSignificantDeviation(
  values: number[],
  threshold = MEASUREMENT_DEVIATION_THRESHOLD_CM,
): boolean {
  return measurementDeviation(values) > threshold;
}

export function calculateBlindMeasurements(
  input: BlindMeasurementInput,
  rules: MeasurementRules,
): BlindMeasurementResult {
  const widths = input.widthMeasurementsCm;
  const heights = input.heightMeasurementsCm;
  const inside = input.mountingPosition === "dans_encadrement";

  const openingWidthCm = inside ? Math.min(...widths) : Math.max(...widths);
  const openingHeightCm = inside ? Math.min(...heights) : Math.max(...heights);

  const notes: string[] = [];
  const warnings: string[] = [];

  let recommendedProductWidthCm: number;
  let recommendedProductHeightCm: number;

  if (inside) {
    recommendedProductWidthCm = Math.max(0, openingWidthCm - rules.blind.insideRecessClearanceCm);
    recommendedProductHeightCm = Math.max(0, openingHeightCm);
    notes.push(
      `Pose dans l'encadrement : on retient la plus petite largeur mesurée (${formatCm(openingWidthCm)}).`,
    );
    notes.push(
      `Jeu de pose de ${formatCm(rules.blind.insideRecessClearanceCm)} retiré : largeur produit ${formatCm(recommendedProductWidthCm)}.`,
    );
    notes.push(
      `Hauteur retenue : la plus petite des trois mesures, soit ${formatCm(recommendedProductHeightCm)}.`,
    );
  } else {
    recommendedProductWidthCm = Math.max(0, openingWidthCm + rules.blind.outsideOverlapSideCm * 2);
    recommendedProductHeightCm = Math.max(
      0,
      openingHeightCm + rules.blind.outsideOverlapTopCm + rules.blind.outsideOverlapBottomCm,
    );
    notes.push(
      `Pose hors encadrement : on retient la plus grande largeur mesurée (${formatCm(openingWidthCm)}).`,
    );
    notes.push(
      `Recouvrement latéral de ${formatCm(rules.blind.outsideOverlapSideCm)} de chaque côté : largeur produit ${formatCm(recommendedProductWidthCm)}.`,
    );
    notes.push(
      `Recouvrement haut ${formatCm(rules.blind.outsideOverlapTopCm)} et bas ${formatCm(rules.blind.outsideOverlapBottomCm)} : hauteur produit ${formatCm(recommendedProductHeightCm)}.`,
    );
  }

  if (hasSignificantDeviation(widths)) {
    warnings.push(
      `Vos trois largeurs diffèrent de ${formatCm(measurementDeviation(widths))}. L'ouverture n'est pas parfaitement d'équerre : vérifiez la pose ou envisagez du sur-mesure.`,
    );
  }
  if (hasSignificantDeviation(heights)) {
    warnings.push(
      `Vos trois hauteurs diffèrent de ${formatCm(measurementDeviation(heights))}. Contrôlez le point d'arrivée souhaité avant de commander.`,
    );
  }

  const outOfRange =
    recommendedProductWidthCm > rules.limits.maxWidthCm ||
    recommendedProductHeightCm > rules.limits.maxHeightCm ||
    recommendedProductWidthCm < rules.limits.minWidthCm;

  return {
    openingWidthCm,
    openingHeightCm,
    recommendedProductWidthCm,
    recommendedProductHeightCm,
    mountingPosition: input.mountingPosition,
    calculationNotes: notes,
    warnings,
    recommendationLevel: outOfRange ? "custom_required" : "compatible",
  };
}
