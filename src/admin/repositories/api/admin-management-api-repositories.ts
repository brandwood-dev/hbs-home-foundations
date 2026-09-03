import type { components } from "@/api/generated/hbs-home-api";
import { HbsApiClient, HbsApiError } from "@/api";
import { getSupabaseBrowserClient } from "@/auth/supabase-browser";
import type {
  AdminSettingsRepository,
  AdminUserRepository,
  AdminAuditRepository,
  AdminUserListParams,
  AdminAuditListParams,
} from "@/admin/repositories/interfaces";
import type { AdminAuditLog, AdminSettings, AdminUser } from "@/admin/types/admin.types";

type ApiSettings = components["schemas"]["AdminSettings"];
type ApiUser = components["schemas"]["AdminManagedUser"];
type ApiAudit = components["schemas"]["AuditEvent"];

async function token(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase Auth n’est pas configuré pour cet environnement.");
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token)
    throw new HbsApiError(401, "Session Admin expirée. Veuillez vous reconnecter.");
  return data.session.access_token;
}

function settingsFromApi(value: ApiSettings): AdminSettings & { version: number } {
  return { ...(value.payload as unknown as AdminSettings), version: value.version };
}

function userFromApi(value: ApiUser): AdminUser & { roles: string[]; status: ApiUser["status"] } {
  const role = (value.roles[0] ?? "read_only") as AdminUser["role"];
  return {
    id: value.id,
    fullName: value.displayName ?? value.email,
    email: value.email,
    role,
    roles: value.roles.filter((item): item is AdminUser["role"] =>
      ["super_admin", "catalog_manager", "orders_manager", "content_editor", "read_only"].includes(
        item,
      ),
    ) as AdminUser["role"][],
    status: value.status,
    isActive: value.status === "active",
    createdAt: value.createdAt,
    ...(value.lastSeenAt ? { lastSeenAt: value.lastSeenAt } : {}),
  };
}

function auditFromApi(value: ApiAudit): AdminAuditLog {
  return {
    id: value.id,
    at: value.occurredAt,
    userId: value.actorUserId ?? "system",
    userName: value.actorEmail ?? "Système",
    action: value.action as AdminAuditLog["action"],
    resourceType: value.resourceType,
    resourceId: value.resourceId ?? "",
    details: Object.keys(value.metadata).length ? JSON.stringify(value.metadata) : value.action,
    outcome: value.outcome,
  };
}

export class ApiAdminSettingsRepository implements AdminSettingsRepository {
  constructor(private readonly client = new HbsApiClient()) {}
  async get(): Promise<AdminSettings> {
    const value = await this.client.get<ApiSettings>(
      "/api/v1/admin/settings",
      undefined,
      await token(),
    );
    return settingsFromApi(value);
  }
  async update(input: Partial<AdminSettings>): Promise<AdminSettings> {
    const current = await this.get();
    const payload = { ...current, ...input } as AdminSettings & { version?: number };
    delete payload.version;
    const value = await this.client.patch<ApiSettings>(
      "/api/v1/admin/settings",
      { payload, expectedVersion: (current as AdminSettings & { version?: number }).version },
      await token(),
    );
    return settingsFromApi(value);
  }
  async reset(): Promise<void> {
    throw new Error("La réinitialisation des paramètres n’est pas disponible dans cette version.");
  }
  async exportJson(): Promise<string> {
    return JSON.stringify(await this.get(), null, 2);
  }
  async importJson(): Promise<void> {
    throw new Error(
      "Importez les paramètres depuis une sauvegarde validée dans la prochaine version.",
    );
  }
  async snapshot(): Promise<never> {
    throw new Error("Snapshot indisponible avec les données persistées.");
  }
}

export class ApiAdminUserRepository implements AdminUserRepository {
  constructor(private readonly client = new HbsApiClient()) {}
  async listPage(params: AdminUserListParams) {
    const search = new URLSearchParams({
      limit: String(params.pageSize),
      offset: String((params.page - 1) * params.pageSize),
    });
    if (params.query) search.set("q", params.query);
    if (params.status) search.set("status", params.status);
    const response = await this.client.get<components["schemas"]["AdminUserList"]>(
      `/api/v1/admin/users?${search.toString()}`,
      undefined,
      await token(),
    );
    return {
      items: response.items.map(userFromApi),
      total: response.total,
      page: params.page,
      pageSize: params.pageSize,
      pageCount: Math.max(1, Math.ceil(response.total / params.pageSize)),
    };
  }

  async list(params?: Record<string, unknown>): Promise<AdminUser[]> {
    const search = new URLSearchParams();
    const q = params?.["q"] ?? params?.["query"];
    if (typeof q === "string" && q) search.set("q", q);
    if (typeof params?.["status"] === "string") search.set("status", String(params["status"]));
    search.set("limit", "100");
    const response = await this.client.get<{ items: ApiUser[] }>(
      `/api/v1/admin/users?${search.toString()}`,
      undefined,
      await token(),
    );
    return response.items.map(userFromApi);
  }
  async getById(id: string): Promise<AdminUser | null> {
    return (await this.list()).find((item) => item.id === id) ?? null;
  }
  async create(input: Omit<AdminUser, "id" | "createdAt">): Promise<AdminUser> {
    const response = await this.client.post<ApiUser>(
      "/api/v1/admin/users/invite",
      {
        email: input.email,
        ...(input.fullName ? { displayName: input.fullName } : {}),
        roleKey: input.role,
        redirectTo: `${window.location.origin}/admin/auth/callback`,
      },
      await token(),
    );
    return userFromApi(response);
  }
  async update(
    id: string,
    input: Partial<Omit<AdminUser, "id" | "createdAt">>,
  ): Promise<AdminUser> {
    if (input.isActive !== undefined) {
      const status = input.isActive ? "active" : "suspended";
      return userFromApi(
        await this.client.patch<ApiUser>(
          `/api/v1/admin/users/${encodeURIComponent(id)}/status`,
          { status },
          await token(),
        ),
      );
    }
    if (input.role) {
      return userFromApi(
        await this.client.post<ApiUser>(
          `/api/v1/admin/users/${encodeURIComponent(id)}/roles`,
          { roleKey: input.role },
          await token(),
        ),
      );
    }
    return (await this.getById(id)) as AdminUser;
  }
  async delete(id: string): Promise<void> {
    await this.client.delete<void>(
      `/api/v1/admin/users/${encodeURIComponent(id)}`,
      undefined,
      await token(),
    );
  }

  async revokeRole(id: string, role: string): Promise<AdminUser> {
    return userFromApi(
      await this.client.delete<ApiUser>(
        `/api/v1/admin/users/${encodeURIComponent(id)}/roles/${encodeURIComponent(role)}`,
        undefined,
        await token(),
      ),
    );
  }
}

export class ApiAdminAuditRepository implements AdminAuditRepository {
  constructor(private readonly client = new HbsApiClient()) {}
  async listPage(params: AdminAuditListParams) {
    const search = new URLSearchParams({
      limit: String(params.pageSize),
      offset: String((params.page - 1) * params.pageSize),
    });
    if (params.query) search.set("q", params.query);
    if (params.action) search.set("action", params.action);
    if (params.resourceType) search.set("resourceType", params.resourceType);
    if (params.outcome) search.set("outcome", params.outcome);
    if (params.actorUserId) search.set("actorUserId", params.actorUserId);
    if (params.dateFrom) search.set("dateFrom", params.dateFrom);
    if (params.dateTo) search.set("dateTo", params.dateTo);
    const response = await this.client.get<components["schemas"]["AuditListResponse"]>(
      `/api/v1/admin/audit-events?${search.toString()}`,
      undefined,
      await token(),
    );
    return {
      items: response.items.map(auditFromApi),
      total: response.total,
      page: params.page,
      pageSize: params.pageSize,
      pageCount: Math.max(1, Math.ceil(response.total / params.pageSize)),
    };
  }

  async list(params?: Parameters<AdminAuditRepository["list"]>[0]): Promise<AdminAuditLog[]> {
    const search = new URLSearchParams({ limit: "100" });
    if (params?.action) search.set("action", params.action);
    if (params?.resourceType) search.set("resourceType", params.resourceType);
    if (params?.outcome) search.set("outcome", params.outcome);
    if (params?.actorUserId) search.set("actorUserId", params.actorUserId);
    if (params?.dateFrom) search.set("dateFrom", params.dateFrom);
    if (params?.dateTo) search.set("dateTo", params.dateTo);
    const response = await this.client.get<{ items: ApiAudit[] }>(
      `/api/v1/admin/audit-events?${search.toString()}`,
      undefined,
      await token(),
    );
    return response.items.map(auditFromApi);
  }
}
