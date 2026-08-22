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
  returnInfo: null,
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

  it("persists payment, shipping, notes and cancellation through the API", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => Response.json(order));
    const repository = new ApiAdminOrderRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );

    await repository.updatePaymentStatus({ orderId: order.id, paymentStatus: "collected" });
    await repository.updateShipping({ orderId: order.id, shippingFeeMinor: 9_000 });
    await repository.addNote(order.id, "Client rappelé");
    await repository.cancelOrder({ orderId: order.id, reason: "Test", restoreStock: true });

    expect(fetchImplementation).toHaveBeenNthCalledWith(
      1,
      `https://api.example.test/api/v1/admin/orders/${order.id}/payment`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ paymentStatus: "collected" }),
      }),
    );
    expect(fetchImplementation).toHaveBeenNthCalledWith(
      2,
      `https://api.example.test/api/v1/admin/orders/${order.id}/shipping`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ shippingFeeMinor: 9_000 }),
      }),
    );
    expect(fetchImplementation).toHaveBeenNthCalledWith(
      3,
      `https://api.example.test/api/v1/admin/orders/${order.id}/notes`,
      expect.objectContaining({ method: "POST", body: JSON.stringify({ text: "Client rappelé" }) }),
    );
    expect(fetchImplementation).toHaveBeenNthCalledWith(
      4,
      `https://api.example.test/api/v1/admin/orders/${order.id}/cancel`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ reason: "Test", restoreStock: true }),
      }),
    );
  });

  it("persists contact, address and return operations through the API", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => Response.json(order));
    const repository = new ApiAdminOrderRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );

    await repository.updateContact(order.id, {
      customerName: "Client Modifié",
      customerPhone: "+21655123456",
      customerEmail: "client@example.com",
    });
    await repository.updateAddress(order.id, {
      governorate: "Bizerte",
      city: "Bizerte",
      addressLine: "2 rue de test",
    });
    await repository.returnOrder({
      orderId: order.id,
      action: "request",
      reason: "Produit endommagé",
    });

    expect(fetchImplementation).toHaveBeenNthCalledWith(
      1,
      `https://api.example.test/api/v1/admin/orders/${order.id}/contact`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          customerName: "Client Modifié",
          customerPhone: "+21655123456",
          customerEmail: "client@example.com",
        }),
      }),
    );
    expect(fetchImplementation).toHaveBeenNthCalledWith(
      2,
      `https://api.example.test/api/v1/admin/orders/${order.id}/address`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          governorate: "Bizerte",
          city: "Bizerte",
          addressLine: "2 rue de test",
        }),
      }),
    );
    expect(fetchImplementation).toHaveBeenNthCalledWith(
      3,
      `https://api.example.test/api/v1/admin/orders/${order.id}/return`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ action: "request", reason: "Produit endommagé" }),
      }),
    );
  });
});
