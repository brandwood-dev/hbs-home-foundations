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

/** Apply the server-provided discount without allowing a negative subtotal. */
export function calculateDiscountedSubtotal(subtotalMinor: number, discountMinor = 0): number {
  return Math.max(0, subtotalMinor - Math.max(0, Math.min(discountMinor, subtotalMinor)));
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
  discountMinor = 0,
): OrderTotals {
  const subtotalMinor = items.reduce((total, item) => total + item.lineTotalMinor, 0);
  const appliedDiscountMinor = Math.max(0, Math.min(discountMinor, subtotalMinor));
  const discountedSubtotalMinor = calculateDiscountedSubtotal(subtotalMinor, appliedDiscountMinor);
  const shippingMinor = calculateCheckoutShipping(
    discountedSubtotalMinor,
    deliveryMethod,
    storeConfig.freeShippingThresholdMinor,
    storeConfig.standardShippingFeeMinor,
    orderRequiresShippingQuote(items),
  );
  return {
    subtotalMinor,
    discountMinor: appliedDiscountMinor,
    shippingMinor,
    totalMinor: discountedSubtotalMinor + shippingMinor,
  };
}
