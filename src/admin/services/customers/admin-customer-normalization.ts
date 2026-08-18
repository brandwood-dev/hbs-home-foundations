import { normalizeKey } from "@/admin/utils/admin.utils";

/** Comparaison de téléphones : indépendante des espaces et du préfixe pays. */
export function normalizePhoneKey(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 8 ? digits.slice(-8) : digits;
}

export function normalizeEmailKey(email: string | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export function normalizeNameKey(firstName: string, lastName: string): string {
  return normalizeKey(`${firstName} ${lastName}`);
}

/** Masque un e-mail pour les vues de liste : h•••@example.tn */
export function maskEmail(email: string | undefined): string {
  if (!email) return "—";
  const [local = "", domain = ""] = email.split("@");
  if (!domain) return "•••";
  return `${local.slice(0, 1)}•••@${domain}`;
}

export const CUSTOMER_TAGS = [
  "Nouveau client",
  "Fidèle",
  "Professionnel",
  "Sur mesure",
  "Livraison spéciale",
  "À surveiller",
] as const;

export const CUSTOMER_NOTE_MAX_LENGTH = 1000;

export function sanitizeCustomerNote(value: string): string {
  const text = value.replace(/<[^>]*>/g, "").trim();
  if (!text) throw new Error("La note ne peut pas être vide.");
  if (text.length > CUSTOMER_NOTE_MAX_LENGTH) {
    throw new Error(`La note est limitée à ${CUSTOMER_NOTE_MAX_LENGTH} caractères.`);
  }
  return text;
}
