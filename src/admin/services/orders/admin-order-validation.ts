import type { AdminOrder, AdminOrderStatus } from "@/admin/types/admin.types";
import { canTransition, transitionError } from "@/admin/services/order-status";
import { transitionRequiresReason } from "@/admin/services/orders/admin-order-transitions";
import {
  canConfirmWithoutShippingFee,
  isShippingToConfirm,
} from "@/admin/services/orders/admin-order-shipping";
import { getShipment } from "@/admin/services/orders/admin-order-shipping";

export const ORDER_NOTE_MAX_LENGTH = 1000;

/** Aucune exécution HTML dans les notes internes. */
export function sanitizeNoteText(value: string): string {
  const text = value.replace(/<[^>]*>/g, "").trim();
  if (!text) throw new Error("La note ne peut pas être vide.");
  if (text.length > ORDER_NOTE_MAX_LENGTH) {
    throw new Error(`La note est limitée à ${ORDER_NOTE_MAX_LENGTH} caractères.`);
  }
  return text;
}

/**
 * Validation métier des transitions, appliquée dans le repository.
 * Masquer un bouton ne suffit pas : le repository refuse toujours.
 */
export function assertStatusTransition(
  order: AdminOrder,
  next: AdminOrderStatus,
  reason?: string,
): void {
  if (!canTransition(order.status, next)) {
    throw new Error(transitionError(order.status, next));
  }
  if (transitionRequiresReason(order.status, next) && !reason?.trim()) {
    throw new Error("Un motif est obligatoire pour cette transition.");
  }
  if (next === "confirmed" && isShippingToConfirm(order) && !canConfirmWithoutShippingFee(order)) {
    throw new Error(
      "Les frais de livraison doivent être définis avant de confirmer cette commande.",
    );
  }
  if (next === "shipped" && order.status !== "preparing") {
    throw new Error("La commande doit être en préparation avant d'être expédiée.");
  }
  if (next === "delivered" && order.status === "preparing") {
    if (order.deliveryMethod !== "store_pickup") {
      throw new Error("Une commande doit être expédiée avant d'être livrée.");
    }
  }
  if (next === "delivered" && order.status === "shipped" && !getShipment(order).shippedAt) {
    // Tolérance : les commandes de démonstration expédiées avant Admin 3
    // n'ont pas de date d'expédition. Aucune erreur bloquante.
  }
}

const TUNISIAN_PHONE = /^(?:\+216)?[2-59]\d{7}$/;

export function normalizeTunisianPhone(value: string): string {
  const digits = value.replace(/[\s.-]/g, "");
  if (!TUNISIAN_PHONE.test(digits)) {
    throw new Error("Numéro de téléphone tunisien invalide (ex. +216 55 123 456).");
  }
  return digits.startsWith("+216") ? digits : `+216${digits}`;
}

export function assertEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (!email) return "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new Error("Adresse e-mail invalide.");
  }
  return email;
}

/** Coordonnées et adresse modifiables uniquement avant expédition. */
export function canEditOrderDetails(order: AdminOrder): boolean {
  return !["shipped", "delivered", "cancelled", "return_requested", "returned"].includes(
    order.status,
  );
}
