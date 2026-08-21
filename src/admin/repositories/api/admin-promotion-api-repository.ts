import type { components, operations } from "@/api/generated/hbs-home-api";
import { HbsApiClient, HbsApiError } from "@/api";
import { getSupabaseBrowserClient } from "@/auth/supabase-browser";
import type {
  AdminPromotionInput,
  AdminPromotionRepository,
} from "@/admin/repositories/interfaces";
import type { AdminPromotion } from "@/admin/types/admin.types";

type ApiPromotion = components["schemas"]["AdminPromotion"];
type PromotionCreateBody =
  operations["adminCreatePromotion"]["requestBody"]["content"]["application/json"];
type PromotionPatchBody =
  operations["adminUpdatePromotion"]["requestBody"]["content"]["application/json"];

async function accessToken(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase Auth n’est pas configuré pour cet environnement.");
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token)
    throw new HbsApiError(401, "Session Admin expirée. Veuillez vous reconnecter.");
  return data.session.access_token;
}

function fallbackStart(value: string | null): string {
  return value ?? new Date(0).toISOString();
}

function fallbackEnd(value: string | null): string {
  return value ?? "2099-12-31T23:59:59.000Z";
}

function mapPromotion(item: ApiPromotion): AdminPromotion {
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    type: "coupon",
    discountType: item.discountType,
    value: item.discountValue,
    startAt: fallbackStart(item.startsAt),
    endAt: fallbackEnd(item.endsAt),
    isActive: item.isActive,
    minimumOrderMinor: item.minSubtotalMinor,
    productIds: [],
    categoryIds: [],
    ...(item.maxRedemptions === null ? {} : { usageLimit: item.maxRedemptions }),
    usageCount: item.redeemedCount,
    priority: 0,
    isStackable: false,
  };
}

function body(input: AdminPromotionInput): PromotionCreateBody {
  if (!input.code?.trim()) throw new Error("Un code promotionnel est requis.");
  if (input.discountType === "free_shipping")
    throw new Error("La livraison offerte sera disponible avec le checkout.");
  return {
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    discountType: input.discountType,
    discountValue: input.value,
    minSubtotalMinor: input.minimumOrderMinor,
    startsAt: input.startAt ? new Date(input.startAt).toISOString() : null,
    endsAt: input.endAt ? new Date(input.endAt).toISOString() : null,
    maxRedemptions: input.usageLimit ?? null,
    isActive: input.isActive,
  };
}

function patch(input: Partial<AdminPromotionInput>): PromotionPatchBody {
  const next: PromotionPatchBody = {};
  if (input.name !== undefined) next.name = input.name.trim();
  if (input.code !== undefined) next.code = input.code.trim().toUpperCase();
  if (input.discountType !== undefined) {
    if (input.discountType === "free_shipping")
      throw new Error("La livraison offerte sera disponible avec le checkout.");
    next.discountType = input.discountType;
  }
  if (input.value !== undefined) next.discountValue = input.value;
  if (input.minimumOrderMinor !== undefined) next.minSubtotalMinor = input.minimumOrderMinor;
  if (input.startAt !== undefined)
    next.startsAt = input.startAt ? new Date(input.startAt).toISOString() : null;
  if (input.endAt !== undefined)
    next.endsAt = input.endAt ? new Date(input.endAt).toISOString() : null;
  if (input.usageLimit !== undefined) next.maxRedemptions = input.usageLimit ?? null;
  if (input.isActive !== undefined) next.isActive = input.isActive;
  return next;
}

export class ApiAdminPromotionRepository implements AdminPromotionRepository {
  constructor(private readonly client = new HbsApiClient()) {}

  private async request<T>(fn: (token: string) => Promise<T>): Promise<T> {
    return fn(await accessToken());
  }

  async list(): Promise<AdminPromotion[]> {
    const response = await this.request((token) =>
      this.client.get<components["schemas"]["AdminPromotionsResponse"]>(
        "/api/v1/admin/promotions?limit=100&offset=0",
        undefined,
        token,
      ),
    );
    return response.items.map(mapPromotion);
  }

  async getById(id: string): Promise<AdminPromotion | null> {
    try {
      return mapPromotion(
        await this.request((token) =>
          this.client.get<ApiPromotion>(
            `/api/v1/admin/promotions/${encodeURIComponent(id)}`,
            undefined,
            token,
          ),
        ),
      );
    } catch (error) {
      if (error instanceof HbsApiError && error.status === 404) return null;
      throw error;
    }
  }

  async create(input: AdminPromotionInput): Promise<AdminPromotion> {
    return mapPromotion(
      await this.request((token) =>
        this.client.post<ApiPromotion>("/api/v1/admin/promotions", body(input), token),
      ),
    );
  }

  async update(id: string, input: Partial<AdminPromotionInput>): Promise<AdminPromotion> {
    return mapPromotion(
      await this.request((token) =>
        this.client.patch<ApiPromotion>(
          `/api/v1/admin/promotions/${encodeURIComponent(id)}`,
          patch(input),
          token,
        ),
      ),
    );
  }

  async delete(id: string): Promise<void> {
    await this.request((token) =>
      this.client.post<ApiPromotion>(
        `/api/v1/admin/promotions/${encodeURIComponent(id)}/archive`,
        {},
        token,
      ),
    );
  }
}
