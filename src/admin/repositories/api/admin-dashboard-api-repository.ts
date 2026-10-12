import type { components } from "@/api/generated/hbs-home-api";
import { HbsApiClient, HbsApiError } from "@/api";
import { getSupabaseBrowserClient } from "@/auth/supabase-browser";
import {
  mapInventoryRow,
  type AdminAccessTokenProvider,
} from "@/admin/repositories/api/admin-catalog-api-repositories";
import { mapOrder } from "@/admin/repositories/api/admin-order-api-repository";
import type {
  AdminDashboardPeriod,
  AdminDashboardRepository,
  DashboardMetrics,
} from "@/admin/repositories/interfaces";
import type { AdminOrderStatus } from "@/admin/types/admin.types";

type ApiDashboard = components["schemas"]["AdminDashboard"];

/**
 * The dashboard endpoint can expose richer aggregates without requiring a
 * breaking API contract. Keep the extra fields optional so older API workers
 * remain compatible while the UI can progressively use thumbnails and the
 * governorate aggregate when they are available.
 */
type ApiDashboardEnhancements = {
  governorateBreakdown?: Array<{ governorate: string; count: number }>;
  topProducts?: Array<
    ApiDashboard["topProducts"][number] & {
      imageUrl?: string | null;
      productSlug?: string | null;
    }
  >;
};

async function defaultAccessToken(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase Auth n’est pas configuré pour cet environnement.");
  }
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) {
    throw new HbsApiError(401, "Session Admin expirée. Veuillez vous reconnecter.");
  }
  return data.session.access_token;
}

function status(value: ApiDashboard["statusBreakdown"][number]["status"]): AdminOrderStatus {
  return value as AdminOrderStatus;
}

export class ApiAdminDashboardRepository implements AdminDashboardRepository {
  constructor(
    private readonly client = new HbsApiClient(),
    private readonly accessToken: AdminAccessTokenProvider = defaultAccessToken,
  ) {}

  async metrics(period: AdminDashboardPeriod = {}): Promise<DashboardMetrics> {
    const token = await this.accessToken();
    const query = new URLSearchParams();
    if (period.dateFrom) query.set("dateFrom", period.dateFrom);
    if (period.dateTo) query.set("dateTo", period.dateTo);
    const path = query.size
      ? `/api/v1/admin/dashboard?${query.toString()}`
      : "/api/v1/admin/dashboard";
    const response = await this.client.get<ApiDashboard>(path, undefined, token);
    const enhanced = response as ApiDashboard & ApiDashboardEnhancements;
    const recentOrders = response.recentOrders.map(mapOrder);
    const itemSnapshots = new Map(
      recentOrders.flatMap((order) => order.items).map((item) => [item.productId, item] as const),
    );
    const governorateBreakdown = enhanced.governorateBreakdown?.filter(
      (entry) => entry.governorate.trim().length > 0 && entry.count > 0,
    );
    const topProducts = (enhanced.topProducts ?? response.topProducts) as NonNullable<
      ApiDashboardEnhancements["topProducts"]
    >;
    return {
      revenueMinor: response.revenueMinor,
      deliveredCount: response.deliveredCount,
      averageOrderValueMinor: response.averageOrderValueMinor,
      totalOrders: response.totalOrders,
      pendingConfirmationCount: response.pendingConfirmationCount,
      preparingCount: response.preparingCount,
      shippedCount: response.shippedCount,
      cancelledCount: response.cancelledCount,
      lowStockCount: response.lowStockCount,
      statusBreakdown: response.statusBreakdown.map((entry) => ({
        status: status(entry.status),
        count: entry.count,
      })),
      recentOrders,
      topProducts: topProducts.map((product) => {
        const snapshot = itemSnapshots.get(product.productId);
        const imageUrl = product.imageUrl ?? snapshot?.imageUrl;
        const productSlug = product.productSlug ?? snapshot?.productSlug;
        return {
          productId: product.productId,
          name: product.name,
          quantity: product.quantity,
          revenueMinor: product.revenueMinor,
          ...(typeof imageUrl === "string" && imageUrl ? { imageUrl } : {}),
          ...(typeof productSlug === "string" && productSlug ? { productSlug } : {}),
        };
      }),
      lowStockRows: response.lowStockRows.map(mapInventoryRow),
      salesByDay: response.salesByDay,
      ...(governorateBreakdown?.length
        ? { governorateBreakdown }
        : {
            // Older workers do not yet return the aggregate. The recent order
            // list keeps the chart useful during the transition and is clearly
            // scoped to the records present in that response.
            governorateBreakdown: Array.from(
              recentOrders.reduce((counts, order) => {
                const governorate = order.governorate?.trim();
                if (governorate) counts.set(governorate, (counts.get(governorate) ?? 0) + 1);
                return counts;
              }, new Map<string, number>()),
            )
              .map(([governorate, count]) => ({ governorate, count }))
              .sort((a, b) => b.count - a.count),
          }),
    };
  }
}
