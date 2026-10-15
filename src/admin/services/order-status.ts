import type { AdminOrderStatus } from "@/admin/types/admin.types";

export const ORDER_STATUS_LABELS: Record<AdminOrderStatus, string> = {
  received: "Reçue",
  pending_confirmation: "En attente de confirmation",
  confirmed: "Confirmée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  return_requested: "Retour demandé",
  returned: "Retournée",
};

/** Statuts persistés par l'API et proposés dans l'éditeur de commande. */
export const ORDER_STATUS_OPTIONS: AdminOrderStatus[] = [
  "pending_confirmation",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

export const PAYMENT_STATUS_LABELS = {
  pending: "En attente",
  collected: "Encaissé",
  refunded: "Remboursé",
} as const;

/**
 * Les statuts de commande restent corrigeables librement par l'équipe Admin.
 * Les contrôles métier sensibles (annulation, stock et paiement) sont
 * appliqués dans leurs workflows dédiés et tracés côté serveur.
 */
const EDITABLE_STATUSES: AdminOrderStatus[] = [
  "received",
  "pending_confirmation",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

const TRANSITIONS: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  received: EDITABLE_STATUSES.filter((status) => status !== "received"),
  pending_confirmation: EDITABLE_STATUSES.filter((status) => status !== "pending_confirmation"),
  confirmed: EDITABLE_STATUSES.filter((status) => status !== "confirmed"),
  preparing: EDITABLE_STATUSES.filter((status) => status !== "preparing"),
  shipped: EDITABLE_STATUSES.filter((status) => status !== "shipped"),
  delivered: EDITABLE_STATUSES.filter((status) => status !== "delivered"),
  cancelled: EDITABLE_STATUSES.filter((status) => status !== "cancelled"),
  return_requested: EDITABLE_STATUSES,
  returned: EDITABLE_STATUSES,
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

/** Seule l'annulation requiert une justification dans le workflow Admin. */
export function transitionRequiresReason(_from: AdminOrderStatus, to: AdminOrderStatus): boolean {
  return to === "cancelled";
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
