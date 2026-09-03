import type { components, operations } from "@/api/generated/hbs-home-api";
import { HbsApiClient, HbsApiError } from "@/api";
import { getSupabaseBrowserClient } from "@/auth/supabase-browser";
import type {
  AdminMediaInput,
  AdminMediaPatch,
  AdminMediaRepository,
  AdminMediaListParams,
} from "@/admin/repositories/interfaces";
import type { AdminMedia } from "@/admin/types/admin.types";

type ApiMedia = components["schemas"]["AdminMediaAsset"];
type MediaCreateBody = operations["adminCreateMedia"]["requestBody"]["content"]["application/json"];
type MediaPatchBody = operations["adminUpdateMedia"]["requestBody"]["content"]["application/json"];

async function accessToken(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase Auth n’est pas configuré pour cet environnement.");
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) {
    throw new HbsApiError(401, "Session Admin expirée. Veuillez vous reconnecter.");
  }
  return data.session.access_token;
}

function mapMedia(item: ApiMedia): AdminMedia {
  return {
    id: item.id,
    name: item.name,
    url: item.publicUrl,
    storagePath: item.storagePath,
    alt: item.alt,
    width: item.width,
    height: item.height,
    mimeType: item.mimeType,
    status: item.status,
    createdAt: item.createdAt,
    usage: item.usage,
  };
}

function createBody(input: AdminMediaInput): MediaCreateBody {
  return {
    ...(input.storagePath ? { storagePath: input.storagePath } : {}),
    publicUrl: input.url,
    name: input.name.trim(),
    alt: input.alt.trim(),
    width: input.width,
    height: input.height,
    mimeType: input.mimeType as MediaCreateBody["mimeType"],
    status: input.status,
    usage: input.usage.trim() || "unassigned",
  };
}

function patchBody(input: AdminMediaPatch): MediaPatchBody {
  return {
    ...(input.name === undefined ? {} : { name: input.name.trim() }),
    ...(input.alt === undefined ? {} : { alt: input.alt.trim() }),
    ...(input.width === undefined ? {} : { width: input.width }),
    ...(input.height === undefined ? {} : { height: input.height }),
    ...(input.status === undefined ? {} : { status: input.status }),
    ...(input.usage === undefined ? {} : { usage: input.usage.trim() }),
  };
}

export class ApiAdminMediaRepository implements AdminMediaRepository {
  constructor(private readonly client = new HbsApiClient()) {}

  private async request<T>(fn: (token: string) => Promise<T>): Promise<T> {
    return fn(await accessToken());
  }

  async listPage(params: AdminMediaListParams) {
    const query = new URLSearchParams({
      limit: String(params.pageSize),
      offset: String((params.page - 1) * params.pageSize),
    });
    if (params.query) query.set("q", params.query);
    const response = await this.request((token) =>
      this.client.get<{
        items: ApiMedia[];
        total: number;
        limit: number;
        offset: number;
      }>(`/api/v1/admin/media?${query.toString()}`, undefined, token),
    );
    return {
      items: response.items.map(mapMedia),
      total: response.total,
      page: params.page,
      pageSize: params.pageSize,
      pageCount: Math.max(1, Math.ceil(response.total / params.pageSize)),
    };
  }

  async list(): Promise<AdminMedia[]> {
    const response = await this.request((token) =>
      this.client.get<{ items: ApiMedia[] }>("/api/v1/admin/media", undefined, token),
    );
    return response.items.map(mapMedia);
  }

  async create(input: AdminMediaInput): Promise<AdminMedia> {
    return mapMedia(
      await this.request((token) =>
        this.client.post<ApiMedia>("/api/v1/admin/media", createBody(input), token),
      ),
    );
  }

  async update(id: string, input: AdminMediaPatch): Promise<AdminMedia> {
    return mapMedia(
      await this.request((token) =>
        this.client.patch<ApiMedia>(
          `/api/v1/admin/media/${encodeURIComponent(id)}`,
          patchBody(input),
          token,
        ),
      ),
    );
  }

  async delete(id: string): Promise<void> {
    await this.update(id, { status: "archived" });
  }
}

export { mapMedia };
