import type { Cart, ResolvedCartItem } from "@/domain/cart/cart.types";
import type { OrderItemSnapshot } from "@/domain/order/order.types";
import type { CreateOrderItemInput } from "@/repositories/interfaces/OrderRepository";

/** Lignes envoyées au repository : uniquement l'identité et la quantité (+ prix vu par le client). */
export function toOrderItemInputs(cart: Cart): CreateOrderItemInput[] {
  return cart.items
    .filter((item) => item.canPurchase)
    .map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      expectedUnitPriceMinor: item.unitPriceMinor,
    }));
}

/** Snapshot figé construit à partir de la ligne résolue côté catalogue. */
export function toOrderItemSnapshot(item: ResolvedCartItem): OrderItemSnapshot {
  return {
    productId: item.productId,
    variantId: item.variantId,
    productSlug: item.productSlug,
    productName: item.productName,
    productReference: item.productReference,
    sku: item.sku,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    quantity: item.quantity,
    unitPriceMinor: item.unitPriceMinor,
    lineTotalMinor: item.lineTotalMinor,
    ...(item.colorLabel ? { colorLabel: item.colorLabel } : {}),
    ...(item.widthCm ? { widthCm: item.widthCm } : {}),
    ...(item.heightCm ? { heightCm: item.heightCm } : {}),
    ...(item.curtainHeaderLabel ? { curtainHeaderLabel: item.curtainHeaderLabel } : {}),
    ...(item.eyeletColorLabel ? { eyeletColorLabel: item.eyeletColorLabel } : {}),
    ...(item.liningLabel ? { liningLabel: item.liningLabel } : {}),
    ...(item.category ? { category: item.category } : {}),
    ...(item.selectedOptions ? { selectedOptions: item.selectedOptions } : {}),
    sellingUnitLabel: item.sellingUnitLabel,
  };
}
