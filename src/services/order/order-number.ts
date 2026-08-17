import { ORDER_NUMBER_PREFIX } from "@/domain/order/order.constants";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSuffix(length: number, random: () => number): string {
  let out = "";
  for (let index = 0; index < length; index += 1) {
    out += ALPHABET[Math.floor(random() * ALPHABET.length)];
  }
  return out;
}

/** Exemple : HBS-260214-K7QP */
export function generateOrderNumber(now: Date = new Date(), random: () => number = Math.random) {
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${ORDER_NUMBER_PREFIX}-${year}${month}${day}-${randomSuffix(4, random)}`;
}

export function generateOrderId(random: () => number = Math.random): string {
  return `ord_${Date.now().toString(36)}_${randomSuffix(6, random).toLowerCase()}`;
}

/** "  hbs-20260818-100001 " -> "HBS-20260818-100001" (aucune recherche approximative). */
export function normalizeOrderNumber(input: string): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, "").toUpperCase();
}

/**
 * Accepte les numéros de démonstration (HBS-YYYYMMDD-NNNNNN)
 * et les numéros générés par le checkout (HBS-YYMMDD-XXXX).
 */
export function isValidOrderNumber(input: string): boolean {
  const value = normalizeOrderNumber(input);
  return /^HBS-\d{8}-\d{6}$/.test(value) || /^HBS-\d{6}-[A-Z0-9]{4}$/.test(value);
}
