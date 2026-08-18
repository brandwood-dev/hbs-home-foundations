import type { AdminOrder } from "@/admin/types/admin.types";
import { getShipment, isShippingToConfirm } from "@/admin/services/orders/admin-order-shipping";

/** Sous-total produits (snapshots), en millimes. */
export function calculateSubtotalMinor(order: AdminOrder): number {
  return order.items.reduce((total, item) => total + item.lineTotalMinor, 0);
}

/**
 * Total commande. `null` lorsque les frais restent à confirmer :
 * l'interface ne doit jamais afficher un faux total définitif.
 */
export function calculateOrderTotalMinor(order: AdminOrder): number | null {
  if (isShippingToConfirm(order)) return null;
  const shipping = getShipment(order).shippingFeeMinor ?? order.shippingMinor;
  return order.subtotalMinor - order.discountMinor + shipping;
}

/** Recalcule `shippingMinor` et `totalMinor` en millimes après définition des frais. */
export function applyShippingFee(order: AdminOrder, shippingFeeMinor: number): void {
  order.shippingMinor = shippingFeeMinor;
  order.totalMinor = order.subtotalMinor - order.discountMinor + shippingFeeMinor;
}

export function countOrderItems(order: AdminOrder): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}
