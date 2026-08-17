import type { OrderStatus } from "@/domain/order/order.types";
import type { OrderTrackingStepKey } from "@/domain/order/order-tracking.types";

const ORDER_STATUSES: OrderStatus[] = [
  "pending_confirmation",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && ORDER_STATUSES.includes(value as OrderStatus);
}

export function isCancelled(status: OrderStatus): boolean {
  return status === "cancelled";
}

/**
 * Index de l'étape courante dans la timeline.
 * `pending_confirmation` -> étape "Commande confirmée" en cours (reçue déjà terminée).
 * Pour une commande annulée, l'index correspond à la dernière étape réellement terminée.
 */
export function getStatusStepIndex(status: OrderStatus): number {
  const byStatus: Record<OrderStatus, number> = {
    pending_confirmation: 1,
    confirmed: 2,
    preparing: 2,
    shipped: 3,
    delivered: 5,
    cancelled: 0,
  };
  return byStatus[status];
}

export function getStepKeyAt(index: number): OrderTrackingStepKey | undefined {
  const keys: OrderTrackingStepKey[] = [
    "received",
    "confirmed",
    "preparing",
    "shipped",
    "delivered",
  ];
  return keys[index];
}
