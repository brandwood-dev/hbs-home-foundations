/** Utilitaires purs du back-office (aucun accès navigateur). */

let idCounter = 0;

/** Identifiant déterministe côté client — le backend générera de vrais UUID. */
export function adminId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}`;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Clé de comparaison pour éviter les doublons (accents, casse, ligatures). */
export function normalizeKey(value: string): string {
  return slugify(value).replace(/-/g, "");
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\s+/g, "");
  if (digits.length < 4) return "•••";
  return `${digits.slice(0, digits.length - 5)}•••${digits.slice(-2)}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export function toDateInput(iso: string | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function discountPercent(priceMinor: number, compareAtMinor?: number): number | null {
  if (!compareAtMinor || compareAtMinor <= priceMinor) return null;
  return Math.round(((compareAtMinor - priceMinor) / compareAtMinor) * 100);
}

export function marginPercent(priceMinor: number, costMinor?: number): number | null {
  if (!costMinor || costMinor <= 0 || priceMinor <= 0) return null;
  return Math.round(((priceMinor - costMinor) / priceMinor) * 100);
}

export function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}
