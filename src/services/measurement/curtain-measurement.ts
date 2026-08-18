import type {
  CurtainMeasurementInput,
  CurtainMeasurementResult,
  MeasurementRules,
} from "@/domain/measurement/measurement.types";

/** Arrondi d'affichage uniquement — la logique conserve la précision. */
export function roundCm(value: number): number {
  return Math.round(value * 10) / 10;
}

export function formatCm(value: number): string {
  const rounded = roundCm(value);
  return `${rounded.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} cm`;
}

/** Largeur de support : mesurée directement ou reconstruite depuis l'ouverture. */
export function calculateSupportWidth(
  input: CurtainMeasurementInput,
  rules: MeasurementRules,
): number {
  if (typeof input.supportWidthCm === "number" && input.supportWidthCm > 0) {
    return input.supportWidthCm;
  }
  const opening = input.openingWidthCm ?? 0;
  const left = input.leftExtensionCm ?? rules.curtain.defaultSideExtensionCm;
  const right = input.rightExtensionCm ?? rules.curtain.defaultSideExtensionCm;
  return Math.max(0, opening + left + right);
}

export function calculateRequiredFabricWidth(supportWidthCm: number, ratio: number): number {
  return Math.max(0, supportWidthCm * ratio);
}

export function calculateWidthPerPanel(totalWidthCm: number, panelCount: number): number {
  const panels = panelCount > 0 ? panelCount : 1;
  return Math.max(0, totalWidthCm / panels);
}

/** Hauteur finie selon le point d'arrivée souhaité. */
export function calculateFinishedHeight(
  input: CurtainMeasurementInput,
  rules: MeasurementRules,
): number {
  const measured = input.measuredHeightCm;
  if (input.lengthTarget === "rebord_fenetre") return Math.max(0, measured);
  if (input.lengthTarget === "sous_rebord") {
    return Math.max(0, measured + rules.curtain.belowSillExtensionCm);
  }
  const adjustments = rules.curtain.floorAdjustmentsCm;
  const finish = input.floorFinish ?? "ras_du_sol";
  const delta =
    finish === "au_dessus_du_sol"
      ? adjustments.aboveFloor
      : finish === "tombe_cassant"
        ? adjustments.puddle
        : adjustments.kissFloor;
  return Math.max(0, measured + delta);
}

/** Fonction pure : aucune I/O, aucun état, aucun arrondi destructif. */
export function calculateCurtainMeasurements(
  input: CurtainMeasurementInput,
  rules: MeasurementRules,
): CurtainMeasurementResult {
  const supportWidthCm = calculateSupportWidth(input, rules);
  const requiredTotalFabricWidthCm = calculateRequiredFabricWidth(
    supportWidthCm,
    input.fullnessRatio,
  );
  const recommendedWidthPerPanelCm = calculateWidthPerPanel(
    requiredTotalFabricWidthCm,
    input.panelCount,
  );
  const recommendedFinishedHeightCm = calculateFinishedHeight(input, rules);

  const notes: string[] = [];
  if (typeof input.supportWidthCm === "number" && input.supportWidthCm > 0) {
    notes.push(`Largeur de support saisie : ${formatCm(supportWidthCm)}.`);
  } else {
    const left = input.leftExtensionCm ?? rules.curtain.defaultSideExtensionCm;
    const right = input.rightExtensionCm ?? rules.curtain.defaultSideExtensionCm;
    notes.push(
      `Largeur de support estimée : ${formatCm(input.openingWidthCm ?? 0)} d'ouverture + ${formatCm(left)} à gauche + ${formatCm(right)} à droite = ${formatCm(supportWidthCm)}.`,
    );
  }
  notes.push(
    `Ampleur ×${input.fullnessRatio.toLocaleString("fr-FR")} : ${formatCm(supportWidthCm)} × ${input.fullnessRatio.toLocaleString("fr-FR")} = ${formatCm(requiredTotalFabricWidthCm)} de tissu au total.`,
  );
  notes.push(
    `Réparti sur ${input.panelCount} pan${input.panelCount > 1 ? "s" : ""} : ${formatCm(recommendedWidthPerPanelCm)} de largeur par pan.`,
  );

  if (input.lengthTarget === "sous_rebord") {
    notes.push(
      `Hauteur mesurée ${formatCm(input.measuredHeightCm)} + ${formatCm(rules.curtain.belowSillExtensionCm)} sous le rebord = ${formatCm(recommendedFinishedHeightCm)}.`,
    );
  } else if (input.lengthTarget === "sol") {
    const finish = input.floorFinish ?? "ras_du_sol";
    const delta = recommendedFinishedHeightCm - input.measuredHeightCm;
    const sign = delta >= 0 ? "+" : "−";
    notes.push(
      `Finition « ${finish.replace(/_/g, " ")} » : ${formatCm(input.measuredHeightCm)} ${sign} ${formatCm(Math.abs(delta))} = ${formatCm(recommendedFinishedHeightCm)}.`,
    );
  } else {
    notes.push(`Hauteur au rebord : ${formatCm(recommendedFinishedHeightCm)}.`);
  }

  const outOfRange =
    supportWidthCm > rules.limits.maxWidthCm ||
    recommendedFinishedHeightCm > rules.limits.maxHeightCm;

  return {
    supportWidthCm,
    requiredTotalFabricWidthCm,
    recommendedWidthPerPanelCm,
    recommendedFinishedHeightCm,
    panelCount: input.panelCount,
    fullnessRatio: input.fullnessRatio,
    calculationNotes: notes,
    recommendationLevel: outOfRange ? "custom_required" : "compatible",
  };
}
