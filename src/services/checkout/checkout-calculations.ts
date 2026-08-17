import type { DeliveryMethod } from "@/domain/checkout/checkout.types";
import type { OrderItemSnapshot, OrderTotals } from "@/domain/order/order.types";
import { storeConfig } from "@/config/store.config";
import { calculateEstimatedShipping } from "@/services/cart/cart-calculations";

/** Le retrait en magasin annule les frais de livraison. */
export function calculateCheckoutShipping(
  subtotalMinor: number,
  deliveryMethod: DeliveryMethod,
  freeShippingThresholdMinor: number = storeConfig.freeShippingThresholdMinor,
  standardShippingFeeMinor: number = storeConfig.standardShippingFeeMinor,
): number {
  if (deliveryMethod === "store_pickup") return 0;
  return calculateEstimatedShipping(
    subtotalMinor,
    freeShippingThresholdMinor,
    standardShippingFeeMinor,
  );
}

export function calculateOrderTotals(
  items: Pick<OrderItemSnapshot, "lineTotalMinor">[],
  deliveryMethod: DeliveryMethod,
): OrderTotals {
  const subtotalMinor = items.reduce((total, item) => total + item.lineTotalMinor, 0);
  const shippingMinor = calculateCheckoutShipping(subtotalMinor, deliveryMethod);
  return { subtotalMinor, shippingMinor, totalMinor: subtotalMinor + shippingMinor };
}
