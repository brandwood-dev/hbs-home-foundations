import { describe, expect, it } from "vitest";
import { HbsApiClient } from "@/api/client";
import { ApiOrderRepository } from "@/repositories/api/ApiOrderRepository";

const orderResponse = {
  id: "11111111-1111-4111-8111-111111111111",
  orderNumber: "HBS-20260821-ABC123",
  status: "pending_confirmation",
  customer: { firstName: "Hedi", lastName: "Home", phone: "+21620123456" },
  deliveryMethod: "home_delivery",
  shippingAddress: {
    governorate: "Tunis",
    city: "Tunis",
    addressLine: "1 rue de Test",
  },
  paymentMethod: "cash_on_delivery",
  items: [
    {
      productId: "prod-1",
      variantId: "variant-1",
      productSlug: "rideau-lin",
      productName: "Rideau lin naturel",
      productReference: "HBS-RID-LIN-001",
      sku: "RID-LIN-140",
      imageUrl: "https://cdn.example.test/rideau.jpg",
      imageAlt: "Rideau lin naturel",
      category: "rideaux",
      selectedOptions: [],
      sellingUnitLabel: "piece",
      quantity: 2,
      unitPriceMinor: 18900,
      lineTotalMinor: 37800,
    },
  ],
  totals: {
    subtotalMinor: 37800,
    discountMinor: 0,
    shippingMinor: 7000,
    totalMinor: 44800,
  },
  createdAt: "2026-08-21T18:00:00.000Z",
  updatedAt: "2026-08-21T18:00:00.000Z",
  idempotencyKey: "checkout-key-1",
  isDemo: false,
} as const;

describe("ApiOrderRepository", () => {
  it("creates an order with the idempotency header and maps image snapshots", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const client = new HbsApiClient({
      baseUrl: "https://api-preview.hbs-home.com",
      fetch: async (input, init) => {
        calls.push({ url: String(input), ...(init ? { init } : {}) });
        return Response.json(orderResponse, { status: 201 });
      },
    });
    const repository = new ApiOrderRepository(client);

    const order = await repository.createOrder({
      idempotencyKey: "checkout-key-1",
      customer: { firstName: "Hedi", lastName: "Home", phone: "+21620123456" },
      deliveryMethod: "home_delivery",
      shippingAddress: {
        governorate: "Tunis",
        city: "Tunis",
        addressLine: "1 rue de Test",
      },
      paymentMethod: "cash_on_delivery",
      items: [
        {
          productId: "prod-1",
          variantId: "variant-1",
          quantity: 2,
          expectedUnitPriceMinor: 18900,
        },
      ],
    });

    expect(calls[0]?.url).toBe("https://api-preview.hbs-home.com/api/v1/orders");
    expect(calls[0]?.init?.headers).toEqual(
      expect.objectContaining({ "idempotency-key": "checkout-key-1" }),
    );
    expect(order.items[0]).toMatchObject({
      imageUrl: "https://cdn.example.test/rideau.jpg",
      imageAlt: "Rideau lin naturel",
    });
    expect(order.isDemo).toBe(false);
  });
});
