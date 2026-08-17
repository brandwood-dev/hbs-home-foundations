import type { Money, Product } from "@/domain/product/product.types";

const MINOR_PER_UNIT = 1000;

export function money(amountMinor: number): Money {
  return { amountMinor, currency: "TND" };
}

/** 99000 -> "99 DT", 59900 -> "59,900 DT" */
export function formatMoney(value: Money | number): string {
  const amountMinor = typeof value === "number" ? value : value.amountMinor;
  const units = Math.trunc(amountMinor / MINOR_PER_UNIT);
  const rest = Math.abs(amountMinor % MINOR_PER_UNIT);
  if (rest === 0) return `${units} DT`;
  return `${units},${String(rest).padStart(3, "0")} DT`;
}

export function toMinor(units: number): number {
  return Math.round(units * MINOR_PER_UNIT);
}

export function toUnits(amountMinor: number): number {
  return Math.round(amountMinor / MINOR_PER_UNIT);
}

export function getProductStartingPrice(product: Product): Money {
  const min = Math.min(...product.variants.map((variant) => variant.price.amountMinor));
  return money(min);
}

export function getProductMaxPrice(product: Product): Money {
  const max = Math.max(...product.variants.map((variant) => variant.price.amountMinor));
  return money(max);
}

export function hasMultiplePrices(product: Product): boolean {
  return getProductStartingPrice(product).amountMinor !== getProductMaxPrice(product).amountMinor;
}

/** Compare-at price of the cheapest variant, when that variant is discounted. */
export function getProductCompareAtPrice(product: Product): Money | null {
  const cheapest = [...product.variants].sort(
    (a, b) => a.price.amountMinor - b.price.amountMinor,
  )[0];
  if (!cheapest?.compareAtPrice) return null;
  if (cheapest.compareAtPrice.amountMinor <= cheapest.price.amountMinor) return null;
  return cheapest.compareAtPrice;
}

export function hasActiveDiscount(product: Product): boolean {
  return product.variants.some(
    (variant) =>
      variant.compareAtPrice != null &&
      variant.compareAtPrice.amountMinor > variant.price.amountMinor,
  );
}

/** Highest discount percentage across the product variants (0 when none). */
export function getDiscountPercentage(product: Product): number {
  let best = 0;
  for (const variant of product.variants) {
    if (!variant.compareAtPrice) continue;
    const before = variant.compareAtPrice.amountMinor;
    const now = variant.price.amountMinor;
    if (before <= now) continue;
    best = Math.max(best, Math.round(((before - now) / before) * 100));
  }
  return best;
}
