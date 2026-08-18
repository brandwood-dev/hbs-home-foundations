import type { AdminOrder, AdminPaymentStatus } from "@/admin/types/admin.types";
import type { StatusTone } from "@/admin/services/order-status";

export const PAYMENT_STATUS_LABELS: Record<AdminPaymentStatus, string> = {
  pending: "En attente",
  collected: "Encaissé",
  refunded: "Remboursé",
};

export const PAYMENT_STATUS_TONE: Record<AdminPaymentStatus, StatusTone> = {
  pending: "warning",
  collected: "success",
  refunded: "danger",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: "Paiement à la livraison",
};

/**
 * Transitions de paiement.
 * `refunded` n'est accessible que pour une commande annulée après encaissement
 * ou retournée. Les remboursements partiels ne sont pas gérés dans cette phase.
 */
export function getAllowedPaymentTransitions(order: AdminOrder): AdminPaymentStatus[] {
  if (order.paymentStatus === "pending") return ["collected"];
  if (order.paymentStatus === "collected") {
    return order.status === "cancelled" || order.status === "returned" ? ["refunded"] : [];
  }
  return [];
}

export function paymentTransitionError(order: AdminOrder, next: AdminPaymentStatus): string | null {
  if (order.paymentStatus === next) return null;
  if (!getAllowedPaymentTransitions(order).includes(next)) {
    return `Transition de paiement impossible : « ${PAYMENT_STATUS_LABELS[order.paymentStatus]} » → « ${PAYMENT_STATUS_LABELS[next]} ».`;
  }
  return null;
}

export function paymentRequiresReason(next: AdminPaymentStatus): boolean {
  return next === "refunded";
}
