import type { AdminOrder } from "@/admin/types/admin.types";

export interface AdminCustomerMetrics {
  totalOrders: number;
  deliveredOrders: number;
  totalSpentMinor: number;
  averageOrderValueMinor: number;
  firstOrderAt?: string;
  lastOrderAt?: string;
  cancelledOrders: number;
  returnedOrders: number;
}

/**
 * Métriques client — fonction pure.
 * Règle financière : seules les commandes livrées comptent, et uniquement
 * leur sous-total produits (les frais de livraison sont exclus).
 */
export function calculateCustomerMetrics(orders: AdminOrder[]): AdminCustomerMetrics {
  const delivered = orders.filter((order) => order.status === "delivered");
  const totalSpentMinor = delivered.reduce((total, order) => total + order.subtotalMinor, 0);
  const dates = orders.map((order) => order.createdAt).sort();
  const first = dates[0];
  const last = dates.at(-1);

  return {
    totalOrders: orders.length,
    deliveredOrders: delivered.length,
    totalSpentMinor,
    averageOrderValueMinor:
      delivered.length > 0 ? Math.round(totalSpentMinor / delivered.length) : 0,
    ...(first ? { firstOrderAt: first } : {}),
    ...(last ? { lastOrderAt: last } : {}),
    cancelledOrders: orders.filter((order) => order.status === "cancelled").length,
    returnedOrders: orders.filter((order) => order.status === "returned").length,
  };
}
