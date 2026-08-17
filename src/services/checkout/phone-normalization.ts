/** Normalisation du numéro de téléphone tunisien — fonctions pures, sans log. */

export const TUNISIAN_PHONE_ERROR = "Saisissez un numéro tunisien valide à 8 chiffres.";

/** Retourne les 8 chiffres nationaux, ou null si l'entrée n'est pas valide. */
export function extractTunisianDigits(input: string): string | null {
  if (typeof input !== "string") return null;
  let value = input.replace(/[\s.\-()]/g, "");
  if (value.length === 0) return null;
  if (/[^\d+]/.test(value)) return null;

  if (value.startsWith("+")) value = value.slice(1);
  if (/^\D/.test(value)) return null;
  if (value.startsWith("00216")) value = value.slice(5);
  else if (value.startsWith("216") && value.length > 8) value = value.slice(3);

  if (!/^\d{8}$/.test(value)) return null;
  return value;
}

/** "22 123 456" -> "+21622123456". Retourne la valeur brute nettoyée si invalide. */
export function normalizeTunisianPhone(input: string): string {
  const digits = extractTunisianDigits(input);
  return digits ? `+216${digits}` : input.trim();
}

export function isValidTunisianPhone(input: string): boolean {
  return extractTunisianDigits(input) !== null;
}

/** "+21622123456" -> "+216 22 123 456". */
export function formatTunisianPhone(input: string): string {
  const digits = extractTunisianDigits(input);
  if (!digits) return input;
  return `+216 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

/** "+21622123456" -> "+216 22 *** 456" (affichage partiel). */
export function maskPhoneNumber(input: string): string {
  const digits = extractTunisianDigits(input);
  if (!digits) return "•••";
  return `+216 ${digits.slice(0, 2)} *** ${digits.slice(5)}`;
}
