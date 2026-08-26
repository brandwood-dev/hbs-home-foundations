import type { components } from "@/api/generated/hbs-home-api";
import { describe, expect, it, vi } from "vitest";
import { HbsApiClient } from "@/api";
import { ApiAdminDashboardRepository } from "@/admin/repositories/api/admin-dashboard-api-repository";

const dashboardResponse = {
  revenueMinor: 37_800,
  deliveredCount: 1,
  averageOrderValueMinor: 37_800,
  totalOrders: 2,
  pendingConfirmationCount: 1,
  preparingCount: 0,
  shippedCount: 0,
  cancelledCount: 0,
  lowStockCount: 1,
  statusBreakdown: [
    { status: "pending_confirmation", count: 1 },
    { status: "confirmed", count: 0 },
    { status: "preparing", count: 0 },
    { status: "shipped", count: 0 },
    { status: "delivered", count: 1 },
    { status: "cancelled", count: 0 },
  ],
  recentOrders: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      orderNumber: "HBS-20260825-TEST01",
      createdAt: "2026-08-25T10:00:00.000Z",
      updatedAt: "2026-08-25T10:00:00.000Z",
      status: "delivered",
      paymentStatus: "collected",
      paymentMethod: "cash_on_delivery",
      customerId: "44444444-4444-4444-8444-444444444444",
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
      subtotalMinor: 37_800,
      shippingMinor: 0,
      discountMinor: 0,
      totalMinor: 37_800,
      timeline: [],
      notes: [],
      shipment: { shippingStatus: "calculated", shippingFeeMinor: 0 },
    },
  ],
  topProducts: [{ productId: "product-1", name: "Rideau test", quantity: 2, revenueMinor: 37_800 }],
  lowStockRows: [
    {
      productId: "product-1",
      productName: "Rideau test",
      categoryId: "category-1",
      updatedAt: "2026-08-25T10:00:00.000Z",
      variant: {
        id: "variant-1",
        sku: "TEST-001",
        colorId: "natural",
        colorLabel: "Naturel",
        widthCm: 140,
        heightCm: 250,
        curtainHeader: "Oeillets",
        priceMinor: 18_900,
        stock: 1,
        reserved: 0,
        lowStockThreshold: 3,
        availability: "low_stock",
        isActive: true,
        isDefault: true,
        options: {},
        trackInventory: true,
      },
    },
  ],
  salesByDay: [{ date: "2026-08-25", revenueMinor: 37_800 }],
} satisfies components["schemas"]["AdminDashboard"];

describe("ApiAdminDashboardRepository", () => {
  it("fetches the authenticated dashboard endpoint and maps its aggregates", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(dashboardResponse));
    const repository = new ApiAdminDashboardRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
      async () => "admin-token",
    );

    const metrics = await repository.metrics({ dateFrom: "2026-08-01", dateTo: "2026-08-25" });

    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/admin/dashboard?dateFrom=2026-08-01&dateTo=2026-08-25",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ authorization: "Bearer admin-token" }),
      }),
    );
    expect(metrics).toMatchObject({
      revenueMinor: 37_800,
      deliveredCount: 1,
      lowStockCount: 1,
      topProducts: [{ productId: "product-1", quantity: 2 }],
      lowStockRows: [{ productId: "product-1", variant: { stock: 1 } }],
    });
    expect(metrics.statusBreakdown).toContainEqual({
      status: "pending_confirmation",
      count: 1,
    });
  });
});
