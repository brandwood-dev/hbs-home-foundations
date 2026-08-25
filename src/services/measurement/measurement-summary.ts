import {
  BLIND_MOUNTING_POSITION_LABELS,
  CURTAIN_FLOOR_FINISH_LABELS,
  CURTAIN_LENGTH_TARGET_LABELS,
  CURTAIN_SUPPORT_LABELS,
  MEASUREMENT_PROJECT_LABELS,
  OPENING_TYPE_LABELS,
} from "@/domain/measurement/measurement.constants";
import type {
  BlindMeasurementInput,
  BlindMeasurementResult,
  CurtainMeasurementInput,
  CurtainMeasurementResult,
} from "@/domain/measurement/measurement.types";
import { formatCm } from "@/services/measurement/curtain-measurement";

/** Résumé textuel copiable — aucune donnée personnelle. */
export function buildCurtainSummary(
  input: CurtainMeasurementInput,
  result: CurtainMeasurementResult,
): string {
  return [
    `Projet : ${MEASUREMENT_PROJECT_LABELS[input.projectType]}`,
    `Ouverture : ${OPENING_TYPE_LABELS[input.openingType]}`,
    `Support : ${CURTAIN_SUPPORT_LABELS[input.supportType]} de ${formatCm(result.supportWidthCm)}`,
    `Ampleur : ×${result.fullnessRatio.toLocaleString("fr-FR")} (règle fixe rideaux et voilages)`,
    `Résultat : ${result.panelCount} pan${result.panelCount > 1 ? "s" : ""} de ${formatCm(result.recommendedWidthPerPanelCm)} minimum`,
    `Largeur totale recommandée : ${formatCm(result.recommendedTotalCurtainWidthCm)}`,
    `Hauteur recommandée : ${formatCm(result.recommendedFinishedHeightCm)} (${CURTAIN_LENGTH_TARGET_LABELS[input.lengthTarget]}${
      input.lengthTarget === "sol" && input.floorFinish
        ? `, ${CURTAIN_FLOOR_FINISH_LABELS[input.floorFinish].toLowerCase()}`
        : ""
    })`,
  ].join("\n");
}

export function buildBlindSummary(
  input: BlindMeasurementInput,
  result: BlindMeasurementResult,
): string {
  return [
    "Projet : Stores",
    `Pose : ${BLIND_MOUNTING_POSITION_LABELS[input.mountingPosition]}`,
    `Ouverture retenue : ${formatCm(result.openingWidthCm)} × ${formatCm(result.openingHeightCm)}`,
    `Dimension produit recommandée : ${formatCm(result.recommendedProductWidthCm)} × ${formatCm(result.recommendedProductHeightCm)}`,
  ].join("\n");
}

/** Copie dans le presse-papiers si l'API est disponible côté client. */
export async function copySummaryToClipboard(summary: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(summary);
    return true;
  } catch {
    return false;
  }
}
