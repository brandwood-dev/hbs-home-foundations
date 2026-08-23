import type { components, operations } from "@/api/generated/hbs-home-api";
import { HbsApiClient, HbsApiError } from "@/api";
import { getSupabaseBrowserClient } from "@/auth/supabase-browser";
import type {
  AdminEditorialPageInput,
  AdminEditorialPagePatch,
  AdminEditorialPageRepository,
} from "@/admin/repositories/interfaces";
import type { AdminEditorialPage } from "@/admin/types/admin.types";

type ApiPage = components["schemas"]["AdminEditorialPage"];
type PageCreateBody =
  operations["adminCreateEditorialPage"]["requestBody"]["content"]["application/json"];
type PagePatchBody =
  operations["adminUpdateEditorialPage"]["requestBody"]["content"]["application/json"];

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

function mapPage(page: ApiPage): AdminEditorialPage {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    body: page.body,
    seoTitle: page.seoTitle ?? "",
    seoDescription: page.seoDescription ?? "",
    status: page.status,
    version: page.version,
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
    blocks: page.blocks,
  };
}

function inputBody(input: AdminEditorialPageInput): PageCreateBody {
  return {
    slug: input.slug.trim(),
    title: input.title.trim(),
    ...(input.body === undefined ? {} : { body: input.body }),
    ...(input.seoTitle === undefined ? {} : { seoTitle: input.seoTitle }),
    ...(input.seoDescription === undefined ? {} : { seoDescription: input.seoDescription }),
    ...(input.blocks === undefined ? {} : { blocks: input.blocks }),
  };
}

function patchBody(input: AdminEditorialPagePatch): PagePatchBody {
  return {
    ...(input.slug === undefined ? {} : { slug: input.slug.trim() }),
    ...(input.title === undefined ? {} : { title: input.title.trim() }),
    ...(input.body === undefined ? {} : { body: input.body }),
    ...(input.seoTitle === undefined ? {} : { seoTitle: input.seoTitle }),
    ...(input.seoDescription === undefined ? {} : { seoDescription: input.seoDescription }),
    ...(input.blocks === undefined ? {} : { blocks: input.blocks }),
    ...(input.expectedVersion === undefined ? {} : { expectedVersion: input.expectedVersion }),
  };
}

export class ApiAdminEditorialPageRepository implements AdminEditorialPageRepository {
  constructor(private readonly client = new HbsApiClient()) {}

  private async request<T>(fn: (token: string) => Promise<T>): Promise<T> {
    return fn(await accessToken());
  }

  async list(): Promise<AdminEditorialPage[]> {
    const response = await this.request((token) =>
      this.client.get<{ items: ApiPage[] }>("/api/v1/admin/content/pages", undefined, token),
    );
    return response.items.map(mapPage);
  }

  async get(id: string): Promise<AdminEditorialPage | null> {
    try {
      return mapPage(
        await this.request((token) =>
          this.client.get<ApiPage>(
            `/api/v1/admin/content/pages/${encodeURIComponent(id)}`,
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

  async create(input: AdminEditorialPageInput): Promise<AdminEditorialPage> {
    return mapPage(
      await this.request((token) =>
        this.client.post<ApiPage>("/api/v1/admin/content/pages", inputBody(input), token),
      ),
    );
  }

  async update(id: string, input: AdminEditorialPagePatch): Promise<AdminEditorialPage> {
    return mapPage(
      await this.request((token) =>
        this.client.patch<ApiPage>(
          `/api/v1/admin/content/pages/${encodeURIComponent(id)}`,
          patchBody(input),
          token,
        ),
      ),
    );
  }

  async publish(id: string): Promise<AdminEditorialPage> {
    return mapPage(
      await this.request((token) =>
        this.client.post<ApiPage>(
          `/api/v1/admin/content/pages/${encodeURIComponent(id)}/publish`,
          {},
          token,
        ),
      ),
    );
  }

  async archive(id: string): Promise<AdminEditorialPage> {
    return mapPage(
      await this.request((token) =>
        this.client.post<ApiPage>(
          `/api/v1/admin/content/pages/${encodeURIComponent(id)}/archive`,
          {},
          token,
        ),
      ),
    );
  }
}

export { mapPage };
