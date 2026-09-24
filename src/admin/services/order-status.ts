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
 * Les statuts de commande restent corrigeables par l'équipe Admin. Les
 * transitions métier sensibles sont confirmées dans la boîte de dialogue et
 * la validation serveur conserve la trace de chaque changement.
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

const NORMAL_EDITABLE_STATUSES = EDITABLE_STATUSES.filter((status) => status !== "cancelled");

const TRANSITIONS: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  received: NORMAL_EDITABLE_STATUSES.filter((status) => status !== "received"),
  pending_confirmation: NORMAL_EDITABLE_STATUSES.filter(
    (status) => status !== "pending_confirmation",
  ),
  confirmed: NORMAL_EDITABLE_STATUSES.filter((status) => status !== "confirmed"),
  preparing: NORMAL_EDITABLE_STATUSES.filter((status) => status !== "preparing"),
  shipped: NORMAL_EDITABLE_STATUSES.filter((status) => status !== "shipped"),
  delivered: NORMAL_EDITABLE_STATUSES.filter((status) => status !== "delivered"),
  cancelled: NORMAL_EDITABLE_STATUSES,
  return_requested: ["returned", "delivered"],
  returned: ["pending_confirmation", "confirmed", "preparing", "shipped", "delivered", "cancelled"],
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

/**
 * Un retour vers une étape précédente ou un statut critique doit être
 * explicitement justifié afin de protéger l'historique opérationnel.
 */
export function transitionRequiresReason(from: AdminOrderStatus, to: AdminOrderStatus): boolean {
  if (from === to) return false;
  if (to === "cancelled" || to === "delivered") return true;
  if (["delivered", "cancelled", "returned"].includes(from)) return true;

  const order = ["received", "pending_confirmation", "confirmed", "preparing", "shipped"];
  const fromIndex = order.indexOf(from);
  const toIndex = order.indexOf(to);
  return fromIndex >= 0 && toIndex >= 0 && toIndex < fromIndex;
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
