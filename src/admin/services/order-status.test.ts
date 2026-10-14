import { describe, expect, it } from "vitest";
import { allowedTransitions, canTransition, transitionRequiresReason } from "./order-status";

describe("admin order status corrections", () => {
  it("allows an administrator to correct a status in either direction", () => {
    expect(canTransition("preparing", "pending_confirmation")).toBe(true);
    expect(canTransition("delivered", "preparing")).toBe(true);
    expect(allowedTransitions("cancelled")).toContain("confirmed");
  });

  it("requires a reason only when cancelling", () => {
    expect(transitionRequiresReason("pending_confirmation", "confirmed")).toBe(false);
    expect(transitionRequiresReason("preparing", "confirmed")).toBe(false);
    expect(transitionRequiresReason("shipped", "delivered")).toBe(false);
    expect(transitionRequiresReason("delivered", "cancelled")).toBe(true);
    expect(transitionRequiresReason("cancelled", "confirmed")).toBe(false);
  });
});
