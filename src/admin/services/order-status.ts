import type { AdminOrderStatus } from "@/admin/types/admin.types";

export const ORDER_STATUS_LABELS: Record<AdminOrderStatus, string> = {
  received: "Reçue",
  pending_confirmation: "À confirmer",
  confirmed: "Confirmée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  return_requested: "Retour demandé",
  returned: "Retournée",
};

export const PAYMENT_STATUS_LABELS = {
  pending: "En attente",
  collected: "Encaissé",
  refunded: "Remboursé",
} as const;

/** Transitions autorisées. Le backend devra appliquer les mêmes règles. */
const TRANSITIONS: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  received: ["pending_confirmation", "confirmed", "cancelled"],
  pending_confirmation: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: ["return_requested"],
  cancelled: [],
  return_requested: ["returned", "delivered"],
  returned: [],
};

export function allowedTransitions(from: AdminOrderStatus): AdminOrderStatus[] {
  return TRANSITIONS[from];
}

export function canTransition(from: AdminOrderStatus, to: AdminOrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function transitionError(from: AdminOrderStatus, to: AdminOrderStatus): string {
  return `Transition impossible : « ${ORDER_STATUS_LABELS[from]} » → « ${ORDER_STATUS_LABELS[to]} ».`;
}

export const CRITICAL_STATUSES: AdminOrderStatus[] = ["cancelled", "delivered", "returned"];

export type StatusTone = "neutral" | "info" | "warning" | "success" | "danger";

export const ORDER_STATUS_TONE: Record<AdminOrderStatus, StatusTone> = {
  received: "neutral",
  pending_confirmation: "warning",
  confirmed: "info",
  preparing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
  return_requested: "warning",
  returned: "danger",
};
