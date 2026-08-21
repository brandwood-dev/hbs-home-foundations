import { describe, expect, it } from "vitest";
import { calculateDiscountedSubtotal, calculateOrderTotals } from "./checkout-calculations";

describe("checkout promotion totals", () => {
  it("subtracts a percentage discount before calculating shipping", () => {
    const totals = calculateOrderTotals([{ lineTotalMinor: 264600 }], "home_delivery", 66150);

    expect(totals).toEqual({
      subtotalMinor: 264600,
      discountMinor: 66150,
      shippingMinor: 7000,
      totalMinor: 205450,
    });
  });

  it("caps an invalid discount at the subtotal", () => {
    expect(calculateDiscountedSubtotal(1000, 5000)).toBe(0);
  });
});
