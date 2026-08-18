import type { CartTotals, ResolvedCartItem } from "@/domain/cart/cart.types";
import { storeConfig } from "@/config/store.config";

/** Toutes les fonctions travaillent en millimes entiers. */

export function createCartLineId(productId: string, variantId: string): string {
  return `${productId}:${variantId}`;
}

export function parseCartLineId(lineId: string): { productId: string; variantId: string } | null {
  const separator = lineId.indexOf(":");
  if (separator <= 0) return null;
  return {
    productId: lineId.slice(0, separator),
    variantId: lineId.slice(separator + 1),
  };
}

export function calculateCartItemCount(items: Pick<ResolvedCartItem, "quantity">[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function calculateCartLineTotal(unitPriceMinor: number, quantity: number): number {
  return Math.max(0, Math.round(unitPriceMinor) * Math.max(0, Math.trunc(quantity)));
}

export function calculateCartSubtotal(items: Pick<ResolvedCartItem, "lineTotalMinor">[]): number {
  return items.reduce((total, item) => total + item.lineTotalMinor, 0);
}

export function calculateEstimatedShipping(
  subtotalMinor: number,
  freeShippingThresholdMinor: number = storeConfig.freeShippingThresholdMinor,
  standardShippingFeeMinor: number = storeConfig.standardShippingFeeMinor,
): number {
  if (subtotalMinor <= 0) return 0;
  return subtotalMinor >= freeShippingThresholdMinor ? 0 : standardShippingFeeMinor;
}

export function calculateEstimatedTotal(subtotalMinor: number, shippingMinor: number): number {
  return subtotalMinor + shippingMinor;
}

export function calculateAmountUntilFreeShipping(
  subtotalMinor: number,
  freeShippingThresholdMinor: number = storeConfig.freeShippingThresholdMinor,
): number {
  return Math.max(0, freeShippingThresholdMinor - subtotalMinor);
}

/** Progression 0 → 100 vers la livraison offerte. */
export function calculateFreeShippingProgress(
  subtotalMinor: number,
  freeShippingThresholdMinor: number = storeConfig.freeShippingThresholdMinor,
): number {
  if (freeShippingThresholdMinor <= 0) return 100;
  const ratio = (subtotalMinor / freeShippingThresholdMinor) * 100;
  return Math.max(0, Math.min(100, Math.round(ratio)));
}

/** Les meubles volumineux et hors norme ne rentrent pas dans le forfait standard. */
export function requiresShippingQuote(items: Pick<ResolvedCartItem, "shippingProfile">[]): boolean {
  return items.some(
    (item) => item.shippingProfile === "volumineux" || item.shippingProfile === "hors_norme",
  );
}

export function calculateCartTotals(items: ResolvedCartItem[]): CartTotals {
  const subtotalMinor = calculateCartSubtotal(items);
  const quoteRequired = requiresShippingQuote(items);
  const shippingMinor = quoteRequired ? 0 : calculateEstimatedShipping(subtotalMinor);
  return {
    requiresShippingQuote: quoteRequired,
    subtotalMinor,
    shippingMinor,
    totalEstimatedMinor: calculateEstimatedTotal(subtotalMinor, shippingMinor),
    freeShippingThresholdMinor: storeConfig.freeShippingThresholdMinor,
    amountUntilFreeShippingMinor: calculateAmountUntilFreeShipping(subtotalMinor),
    hasFreeShipping: !quoteRequired && subtotalMinor > 0 && shippingMinor === 0,
  };
}

/** Borne une quantité entre 1 et le stock disponible (ou une limite haute par défaut). */
export function clampQuantity(quantity: number, maxQuantity: number): number {
  const integer = Math.trunc(Number.isFinite(quantity) ? quantity : 1);
  const upper = Math.max(1, Math.trunc(maxQuantity));
  return Math.min(Math.max(1, integer), upper);
}
