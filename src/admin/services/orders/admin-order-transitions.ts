import type { AdminOrder, AdminOrderStatus } from "@/admin/types/admin.types";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  allowedTransitions,
  canTransition,
  transitionRequiresReason,
  transitionError,
} from "@/admin/services/order-status";

export { ORDER_STATUS_LABELS, ORDER_STATUS_TONE, canTransition, transitionError };

/** Fonction pure centrale des transitions autorisées. */
export function getAllowedOrderTransitions(status: AdminOrderStatus): AdminOrderStatus[] {
  return allowedTransitions(status);
}

/** Statuts terminaux : aucune évolution possible. */
export function isTerminalStatus(status: AdminOrderStatus): boolean {
  return getAllowedOrderTransitions(status).length === 0;
}

/** Transitions exigeant un motif explicite. */
export { transitionRequiresReason };

export interface TransitionAction {
  to: AdminOrderStatus;
  label: string;
  critical: boolean;
}

const ACTION_LABELS: Partial<Record<AdminOrderStatus, string>> = {
  pending_confirmation: "Mettre en attente de confirmation",
  confirmed: "Confirmer",
  preparing: "Passer en préparation",
  shipped: "Marquer comme expédiée",
  delivered: "Marquer comme livrée",
  cancelled: "Annuler",
  return_requested: "Enregistrer une demande de retour",
  returned: "Clôturer le retour",
};

/** Actions proposables dans l'interface pour le statut courant. */
export function getOrderActions(order: AdminOrder): TransitionAction[] {
  return getAllowedOrderTransitions(order.status).map((to) => ({
    to,
    label: ACTION_LABELS[to] ?? ORDER_STATUS_LABELS[to],
    critical: transitionRequiresReason(order.status, to) || to === "delivered",
  }));
}

/** Actions groupées autorisées (sûres) de la liste. */
export const BULK_TRANSITIONS: AdminOrderStatus[] = ["confirmed", "preparing", "shipped"];
