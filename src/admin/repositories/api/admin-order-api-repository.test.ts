import { describe, expect, it, vi } from "vitest";
import type { components } from "@/api/generated/hbs-home-api";
import { HbsApiClient } from "@/api";
import { ApiAdminOrderRepository } from "./admin-order-api-repository";

vi.mock("@/auth/supabase-browser", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: async () => ({
        data: { session: { access_token: "admin-token" } },
        error: null,
      }),
    },
  }),
}));

const order = {
  id: "11111111-1111-4111-8111-111111111111",
  orderNumber: "HBS-20260821-ABC123",
  createdAt: "2026-08-21T19:40:00.000Z",
  updatedAt: "2026-08-21T19:40:00.000Z",
  status: "confirmed",
  paymentStatus: "pending",
  paymentMethod: "cash_on_delivery",
  customerId: "22222222-2222-4222-8222-222222222222",
  customerName: "Test Client",
  customerPhone: "+21620123456",
  customerEmail: null,
  deliveryMethod: "home_delivery",
  governorate: "Bizerte",
  city: "Bizerte",
  postalCode: null,
  addressLine: "1 rue de test",
  landmark: null,
  deliveryNote: null,
  items: [],
  subtotalMinor: 18_900,
  shippingMinor: 7_000,
  discountMinor: 0,
  totalMinor: 25_900,
  timeline: [],
  notes: [],
  shipment: { shippingStatus: "calculated", shippingFeeMinor: 7_000 },
} as components["schemas"]["AdminOrder"];

describe("Admin order API adapter", () => {
  it("persists a status transition through the authenticated API", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(Response.json(order));
    const repository = new ApiAdminOrderRepository(
      new HbsApiClient({
        baseUrl: "https://api.example.test",
        fetch: fetchImplementation,
      }),
    );

    await expect(
      repository.updateStatus({
        orderId: order.id,
        status: "confirmed",
        note: "Client confirmé par téléphone",
      }),
    ).resolves.toMatchObject({ status: "confirmed" });

    expect(fetchImplementation).toHaveBeenCalledWith(
      `https://api.example.test/api/v1/admin/orders/${order.id}/status`,
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          authorization: "Bearer admin-token",
        }),
        body: JSON.stringify({
          status: "confirmed",
          note: "Client confirmé par téléphone",
        }),
      }),
    );
  });

  it("does not send API mutations for statuses not supported by the persisted order model", async () => {
    const fetchImplementation = vi.fn<typeof fetch>();
    const repository = new ApiAdminOrderRepository(
      new HbsApiClient({
        baseUrl: "https://api.example.test",
        fetch: fetchImplementation,
      }),
    );

    await expect(
      repository.updateStatus({ orderId: order.id, status: "returned" }),
    ).rejects.toThrow("prochaine sous-phase");
    expect(fetchImplementation).not.toHaveBeenCalled();
  });
});
