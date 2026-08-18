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
  quoteRequired = false,
): number {
  if (deliveryMethod === "store_pickup") return 0;
  if (quoteRequired) return 0;
  return calculateEstimatedShipping(
    subtotalMinor,
    freeShippingThresholdMinor,
    standardShippingFeeMinor,
  );
}

/** Un article volumineux ou hors norme sort du forfait de livraison standard. */
export function orderRequiresShippingQuote(
  items: Pick<OrderItemSnapshot, "shippingProfile">[],
): boolean {
  return items.some(
    (item) => item.shippingProfile === "volumineux" || item.shippingProfile === "hors_norme",
  );
}

export function calculateOrderTotals(
  items: Pick<OrderItemSnapshot, "lineTotalMinor" | "shippingProfile">[],
  deliveryMethod: DeliveryMethod,
): OrderTotals {
  const subtotalMinor = items.reduce((total, item) => total + item.lineTotalMinor, 0);
  const shippingMinor = calculateCheckoutShipping(
    subtotalMinor,
    deliveryMethod,
    storeConfig.freeShippingThresholdMinor,
    storeConfig.standardShippingFeeMinor,
    orderRequiresShippingQuote(items),
  );
  return { subtotalMinor, shippingMinor, totalMinor: subtotalMinor + shippingMinor };
}
