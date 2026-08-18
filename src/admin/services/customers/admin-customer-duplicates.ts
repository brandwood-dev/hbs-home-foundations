import type { AdminCustomer } from "@/admin/types/admin.types";
import {
  normalizeEmailKey,
  normalizeNameKey,
  normalizePhoneKey,
} from "@/admin/services/customers/admin-customer-normalization";

export type DuplicateSignal = "phone" | "email" | "name";

export interface CustomerDuplicate {
  customer: AdminCustomer;
  signals: DuplicateSignal[];
  strong: boolean;
}

/**
 * Détection des doublons potentiels.
 * Téléphone et e-mail sont des signaux forts ; le nom seul ne suffit jamais.
 */
export function findPotentialCustomerDuplicates(
  customer: AdminCustomer,
  all: AdminCustomer[],
): CustomerDuplicate[] {
  const phone = normalizePhoneKey(customer.phone);
  const email = normalizeEmailKey(customer.email);
  const name = normalizeNameKey(customer.firstName, customer.lastName);

  const matches: CustomerDuplicate[] = [];
  for (const other of all) {
    if (other.id === customer.id) continue;
    if (other.mergedIntoCustomerId) continue;

    const signals: DuplicateSignal[] = [];
    if (phone && normalizePhoneKey(other.phone) === phone) signals.push("phone");
    if (email && normalizeEmailKey(other.email) === email) signals.push("email");
    if (
      name &&
      normalizeNameKey(other.firstName, other.lastName) === name &&
      other.governorate === customer.governorate
    ) {
      signals.push("name");
    }
    if (signals.length === 0) continue;

    matches.push({
      customer: other,
      signals,
      strong: signals.includes("phone") || signals.includes("email"),
    });
  }
  return matches.sort((a, b) => Number(b.strong) - Number(a.strong));
}

export const DUPLICATE_SIGNAL_LABELS: Record<DuplicateSignal, string> = {
  phone: "Téléphone identique",
  email: "E-mail identique",
  name: "Nom proche, même gouvernorat (signal faible)",
};
