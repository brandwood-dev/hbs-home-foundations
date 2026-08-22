import { describe, expect, it, vi } from "vitest";
import { HbsApiClient } from "@/api";
import { ApiAdminCustomerRepository } from "./admin-customer-api-repository";

vi.mock("@/auth/supabase-browser", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: { access_token: "admin-token" } }, error: null }),
    },
  }),
}));

const customer = {
  id: "11111111-1111-4111-8111-111111111111",
  firstName: "Test",
  lastName: "Client",
  phone: "+21620123456",
  email: "test@example.com",
  governorate: "Bizerte",
  tags: ["VIP"],
  internalNotes: "",
  addresses: [],
  createdAt: "2026-08-21T19:40:00.000Z",
  notes: [],
  updatedAt: "2026-08-21T19:40:00.000Z",
  metrics: {
    totalOrders: 1,
    deliveredOrders: 1,
    totalSpentMinor: 18_900,
    averageOrderValueMinor: 18_900,
    firstOrderAt: "2026-08-21T19:40:00.000Z",
    lastOrderAt: "2026-08-21T19:40:00.000Z",
    cancelledOrders: 0,
    returnedOrders: 0,
  },
  hasPotentialDuplicate: false,
};

describe("Admin customer API adapter", () => {
  it("lists persisted customers with private search and auth", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({
          items: [customer],
          total: 1,
          page: 1,
          pageSize: 20,
          pageCount: 1,
          governorates: ["Bizerte"],
          tags: ["VIP"],
        }),
      );
    const repository = new ApiAdminCustomerRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );
    await expect(
      repository.list({ page: 1, pageSize: 20, sort: "last_order" }, "Test Client"),
    ).resolves.toMatchObject({ total: 1, rows: [{ id: customer.id, metrics: customer.metrics }] });
    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/admin/customers?page=1&pageSize=20&sort=last_order&q=Test+Client",
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: "Bearer admin-token" }),
      }),
    );
  });

  it("persists tags and address mutations through the API", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => Response.json(customer));
    const repository = new ApiAdminCustomerRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );
    await repository.updateTags(customer.id, ["VIP"]);
    await repository.addAddress(customer.id, {
      governorate: "Bizerte",
      city: "Bizerte",
      addressLine: "1 rue de test",
      isDefault: true,
    });
    expect(fetchImplementation).toHaveBeenNthCalledWith(
      1,
      `https://api.example.test/api/v1/admin/customers/${customer.id}/tags`,
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ tags: ["VIP"] }) }),
    );
    expect(fetchImplementation).toHaveBeenNthCalledWith(
      2,
      `https://api.example.test/api/v1/admin/customers/${customer.id}/addresses`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          governorate: "Bizerte",
          city: "Bizerte",
          addressLine: "1 rue de test",
          isDefault: true,
        }),
      }),
    );
  });
});
