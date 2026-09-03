import type { components, operations } from "@/api/generated/hbs-home-api";
import { HbsApiClient, HbsApiError } from "@/api";
import { getSupabaseBrowserClient } from "@/auth/supabase-browser";
import type { AdminArticle } from "@/admin/types/admin.types";
import type {
  AdminArticleInput,
  AdminArticlePatch,
  AdminArticleRepository,
  AdminArticleListParams,
} from "@/admin/repositories/interfaces";

type ApiArticle = components["schemas"]["AdminArticle"];
type ArticleCreateBody =
  operations["adminCreateArticle"]["requestBody"]["content"]["application/json"];
type ArticlePatchBody =
  operations["adminUpdateArticle"]["requestBody"]["content"]["application/json"];

async function accessToken(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase Auth n’est pas configuré pour cet environnement.");
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token)
    throw new HbsApiError(401, "Session Admin expirée. Veuillez vous reconnecter.");
  return data.session.access_token;
}

function mapArticle(article: ApiArticle): AdminArticle {
  return article as AdminArticle;
}

function createBody(input: AdminArticleInput): ArticleCreateBody {
  return {
    slug: input.slug.trim(),
    categoryId: input.categoryId,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    bodyBlocks: input.bodyBlocks,
    coverMediaAssetId: input.coverMediaAssetId,
    ...(input.readingTimeMinutes === undefined
      ? {}
      : { readingTimeMinutes: input.readingTimeMinutes }),
    ...(input.seoTitle === undefined ? {} : { seoTitle: input.seoTitle }),
    ...(input.seoDescription === undefined ? {} : { seoDescription: input.seoDescription }),
    ...(input.isFeatured === undefined ? {} : { isFeatured: input.isFeatured }),
    ...(input.homeSortOrder === undefined ? {} : { homeSortOrder: input.homeSortOrder }),
    ...(input.authorName === undefined ? {} : { authorName: input.authorName }),
  };
}

function patchBody(input: AdminArticlePatch): ArticlePatchBody {
  return {
    ...(input.slug === undefined ? {} : { slug: input.slug.trim() }),
    ...(input.categoryId === undefined ? {} : { categoryId: input.categoryId }),
    ...(input.title === undefined ? {} : { title: input.title.trim() }),
    ...(input.excerpt === undefined ? {} : { excerpt: input.excerpt.trim() }),
    ...(input.bodyBlocks === undefined ? {} : { bodyBlocks: input.bodyBlocks }),
    ...(input.coverMediaAssetId === undefined
      ? {}
      : { coverMediaAssetId: input.coverMediaAssetId }),
    ...(input.readingTimeMinutes === undefined
      ? {}
      : { readingTimeMinutes: input.readingTimeMinutes }),
    ...(input.seoTitle === undefined ? {} : { seoTitle: input.seoTitle }),
    ...(input.seoDescription === undefined ? {} : { seoDescription: input.seoDescription }),
    ...(input.isFeatured === undefined ? {} : { isFeatured: input.isFeatured }),
    ...(input.homeSortOrder === undefined ? {} : { homeSortOrder: input.homeSortOrder }),
    ...(input.authorName === undefined ? {} : { authorName: input.authorName }),
    ...(input.expectedVersion === undefined ? {} : { expectedVersion: input.expectedVersion }),
  };
}

export class ApiAdminArticleRepository implements AdminArticleRepository {
  constructor(
    private readonly client = new HbsApiClient(),
    private readonly resolveAccessToken: () => Promise<string> = accessToken,
  ) {}

  private async request<T>(fn: (token: string) => Promise<T>): Promise<T> {
    return fn(await this.resolveAccessToken());
  }

  async listPage(params: AdminArticleListParams) {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
    });
    if (params.query) query.set("q", params.query);
    if (params.status) query.set("status", params.status);
    if (params.categoryId) query.set("categoryId", params.categoryId);
    const response = await this.request((token) =>
      this.client.get<components["schemas"]["AdminArticleList"]>(
        `/api/v1/admin/content/articles?${query.toString()}`,
        undefined,
        token,
      ),
    );
    return {
      items: response.items.map(mapArticle),
      total: response.total,
      page: params.page,
      pageSize: params.pageSize,
      pageCount: Math.max(1, Math.ceil(response.total / params.pageSize)),
    };
  }

  async listCategories(): Promise<
    Array<{ id: string; slug: string; name: string; description: string; sortOrder: number }>
  > {
    const response = await this.request((token) =>
      this.client.get<{ items: components["schemas"]["ArticleCategory"][] }>(
        "/api/v1/admin/content/article-categories",
        undefined,
        token,
      ),
    );
    return response.items;
  }

  async list(
    params: { query?: string; status?: AdminArticle["status"]; categoryId?: string } = {},
  ): Promise<AdminArticle[]> {
    const query = new URLSearchParams();
    if (params.query) query.set("q", params.query);
    if (params.status) query.set("status", params.status);
    if (params.categoryId) query.set("categoryId", params.categoryId);
    const response = await this.request((token) =>
      this.client.get<{ items: ApiArticle[] }>(
        `/api/v1/admin/content/articles${query.size ? `?${query.toString()}` : ""}`,
        undefined,
        token,
      ),
    );
    return response.items.map(mapArticle);
  }

  async get(id: string): Promise<AdminArticle | null> {
    try {
      return mapArticle(
        await this.request((token) =>
          this.client.get<ApiArticle>(
            `/api/v1/admin/content/articles/${encodeURIComponent(id)}`,
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

  async create(input: AdminArticleInput): Promise<AdminArticle> {
    return mapArticle(
      await this.request((token) =>
        this.client.post<ApiArticle>("/api/v1/admin/content/articles", createBody(input), token),
      ),
    );
  }

  async update(id: string, input: AdminArticlePatch): Promise<AdminArticle> {
    return mapArticle(
      await this.request((token) =>
        this.client.patch<ApiArticle>(
          `/api/v1/admin/content/articles/${encodeURIComponent(id)}`,
          patchBody(input),
          token,
        ),
      ),
    );
  }

  async publish(id: string): Promise<AdminArticle> {
    return mapArticle(
      await this.request((token) =>
        this.client.post<ApiArticle>(
          `/api/v1/admin/content/articles/${encodeURIComponent(id)}/publish`,
          {},
          token,
        ),
      ),
    );
  }

  async archive(id: string): Promise<AdminArticle> {
    return mapArticle(
      await this.request((token) =>
        this.client.post<ApiArticle>(
          `/api/v1/admin/content/articles/${encodeURIComponent(id)}/archive`,
          {},
          token,
        ),
      ),
    );
  }

  async delete(id: string): Promise<void> {
    await this.request((token) =>
      this.client.delete<void>(
        `/api/v1/admin/content/articles/${encodeURIComponent(id)}`,
        undefined,
        token,
      ),
    );
  }

  async duplicate(id: string): Promise<AdminArticle> {
    return mapArticle(
      await this.request((token) =>
        this.client.post<ApiArticle>(
          `/api/v1/admin/content/articles/${encodeURIComponent(id)}/duplicate`,
          {},
          token,
        ),
      ),
    );
  }
}
