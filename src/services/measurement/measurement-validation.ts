import { z } from "zod";
import { heightRangeMessage, widthRangeMessage } from "@/domain/measurement/measurement.errors";
import type { MeasurementRules } from "@/domain/measurement/measurement.types";

/** "180,5" ou "180.5" -> 180.5. Retourne null si la saisie n'est pas numérique. */
export function parseCmInput(raw: string): number | null {
  const value = raw.trim().replace(",", ".");
  if (value.length === 0) return null;
  if (!/^\d+(\.\d+)?$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function widthSchema(rules: MeasurementRules) {
  const message = widthRangeMessage(rules.limits.minWidthCm, rules.limits.maxWidthCm);
  return z
    .number({ message })
    .min(rules.limits.minWidthCm, message)
    .max(rules.limits.maxWidthCm, message);
}

export function heightSchema(rules: MeasurementRules) {
  const message = heightRangeMessage(rules.limits.minHeightCm, rules.limits.maxHeightCm);
  return z
    .number({ message })
    .min(rules.limits.minHeightCm, message)
    .max(rules.limits.maxHeightCm, message);
}

/** Validation d'un champ de saisie brut : retourne un message d'erreur ou null. */
export function validateWidthField(raw: string, rules: MeasurementRules): string | null {
  const parsed = parseCmInput(raw);
  if (parsed === null) return widthRangeMessage(rules.limits.minWidthCm, rules.limits.maxWidthCm);
  const result = widthSchema(rules).safeParse(parsed);
  return result.success ? null : (result.error.issues[0]?.message ?? "Valeur invalide.");
}

export function validateHeightField(raw: string, rules: MeasurementRules): string | null {
  const parsed = parseCmInput(raw);
  if (parsed === null)
    return heightRangeMessage(rules.limits.minHeightCm, rules.limits.maxHeightCm);
  const result = heightSchema(rules).safeParse(parsed);
  return result.success ? null : (result.error.issues[0]?.message ?? "Valeur invalide.");
}

/** Débord latéral : facultatif, jamais négatif. */
export function validateExtensionField(raw: string): string | null {
  if (raw.trim().length === 0) return null;
  const parsed = parseCmInput(raw);
  if (parsed === null) return "Saisissez un débord en centimètres (0 accepté).";
  if (parsed > 100) return "Le débord ne peut pas dépasser 100 cm.";
  return null;
}
