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
      recentOrders: response.recentOrders.map(mapOrder),
      topProducts: response.topProducts,
      lowStockRows: response.lowStockRows.map(mapInventoryRow),
      salesByDay: response.salesByDay,
    };
  }
}
