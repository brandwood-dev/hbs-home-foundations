import { describe, expect, it } from "vitest";
import { HbsApiClient } from "@/api/client";
import { ApiCartRepository } from "@/repositories/api/ApiCartRepository";

const cartResponse = {
  cartId: "11111111-1111-4111-8111-111111111111",
  currency: "TND",
  expiresAt: "2026-08-30T00:00:00.000Z",
  items: [],
  itemCount: 0,
  lineCount: 0,
  totals: {
    subtotalMinor: 0,
    discountMinor: 0,
    shippingMinor: 0,
    totalEstimatedMinor: 0,
    freeShippingThresholdMinor: 200000,
    amountUntilFreeShippingMinor: 0,
    hasFreeShipping: true,
    requiresShippingQuote: false,
  },
  promotion: null,
  hasUnavailableItems: false,
  hasPriceChanges: false,
};

describe("ApiCartRepository promotions", () => {
  it("applies and removes a promotion through the server contract", async () => {
    const calls: Array<{ method: string; url: string; body?: string }> = [];
    const client = new HbsApiClient({
      baseUrl: "https://api-preview.hbs-home.com",
      fetch: async (input, init) => {
        calls.push({
          method: init?.method ?? "GET",
          url: String(input),
          ...(init?.body ? { body: String(init.body) } : {}),
        });
        return new Response(JSON.stringify(cartResponse), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    });
    const repository = new ApiCartRepository(client);

    await repository.applyPromotion(" bienvenue10 ");
    await repository.removePromotion();

    expect(calls).toEqual([
      {
        method: "POST",
        url: "https://api-preview.hbs-home.com/api/v1/cart/promotion",
        body: JSON.stringify({ code: "bienvenue10" }),
      },
      { method: "DELETE", url: "https://api-preview.hbs-home.com/api/v1/cart/promotion" },
    ]);
  });

  it("traduit les codes de mode de vente renvoyés par l'API", async () => {
    const client = new HbsApiClient({
      baseUrl: "https://api-preview.hbs-home.com",
      fetch: async () =>
        Response.json(
          {
            ...cartResponse,
            items: [
              {
                lineId: "line-1",
                productId: "product-1",
                productSlug: "rideau-lin",
                productName: "Rideau lin",
                productReference: "RID-001",
                variantId: "variant-1",
                confectionKey: null,
                sku: "RID-001-140",
                quantity: 1,
                unitPriceMinor: 12000,
                compareAtPriceMinor: null,
                lineTotalMinor: 12000,
                priceAtAddMinor: 12000,
                priceChanged: false,
                imageUrl: "https://cdn.example.test/rideau.jpg",
                imageAlt: "Rideau lin",
                category: "rideaux",
                colorLabel: null,
                widthCm: 140,
                heightCm: 250,
                selectedOptions: [],
                sellingUnitLabel: "ready_made",
                shippingProfile: null,
                availability: "in_stock",
                availableQuantity: 2,
                status: "available",
                canPurchase: true,
              },
            ],
            itemCount: 1,
            lineCount: 1,
          },
          { status: 200 },
        ),
    });

    const cart = await new ApiCartRepository(client).getCart();

    expect(cart.items[0]?.sellingUnitLabel).toBe("Prêt à poser");
  });
});
