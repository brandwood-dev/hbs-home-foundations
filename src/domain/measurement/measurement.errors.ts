/** Erreurs métier du guide des mesures — jamais de données personnelles. */
export class MeasurementValidationError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "MeasurementValidationError";
  }
}

export const MEASUREMENT_ERROR_MESSAGES = {
  rulesUnavailable:
    "Impossible de charger les règles de mesure pour le moment. Réessayez dans un instant.",
  recommendationsUnavailable:
    "Impossible de charger les produits compatibles pour le moment. Réessayez dans un instant.",
} as const;

export function widthRangeMessage(min: number, max: number): string {
  return `Saisissez une largeur comprise entre ${min} et ${max.toLocaleString("fr-FR")} cm.`;
}

export function heightRangeMessage(min: number, max: number): string {
  return `Saisissez une hauteur comprise entre ${min} et ${max.toLocaleString("fr-FR")} cm.`;
}
