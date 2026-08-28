import type { components, operations } from "@/api/generated/hbs-home-api";
import { HbsApiClient, HbsApiError } from "@/api";
import { getSupabaseBrowserClient } from "@/auth/supabase-browser";
import type {
  AdminHomeContent,
  AdminHomeDraftInput,
  AdminHomeRevision,
  AdminHomeSection,
  AdminHomeSectionInput,
  AdminHomeSectionKey,
  AdminHomeContentRepository,
} from "@/admin/repositories/interfaces";

type ApiHomeContent = components["schemas"]["AdminHomeContent"];
type ApiHomeRevision = NonNullable<ApiHomeContent["draft"]>;
type ApiHomeSection = ApiHomeRevision["sections"][number];
type ApiHomeDraftBody =
  operations["adminUpdateHomeContent"]["requestBody"]["content"]["application/json"];
type ApiHomeSectionDraftBody =
  operations["adminUpdateHomeSection"]["requestBody"]["content"]["application/json"];

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

function mapSection(section: ApiHomeSection): AdminHomeSection {
  return {
    id: section.id,
    sectionKey: section.sectionKey,
    sortOrder: section.sortOrder,
    isEnabled: section.isEnabled,
    payload: section.payload,
    media: section.media,
    mobileMedia: section.mobileMedia,
    hotspots: section.hotspots,
  };
}

function mapRevision(revision: ApiHomeRevision): AdminHomeRevision {
  return {
    id: revision.id,
    status: revision.status,
    version: revision.version,
    publishedAt: revision.publishedAt,
    updatedAt: revision.updatedAt,
    sections: revision.sections.map(mapSection),
  };
}

function mapContent(content: ApiHomeContent): AdminHomeContent {
  return {
    draft: content.draft ? mapRevision(content.draft) : null,
    published: content.published ? mapRevision(content.published) : null,
  };
}

function draftBody(input: AdminHomeDraftInput): ApiHomeDraftBody {
  return {
    sections: input.sections.map((section) => ({
      sectionKey: section.sectionKey,
      sortOrder: section.sortOrder,
      ...(section.isEnabled === undefined ? {} : { isEnabled: section.isEnabled }),
      ...(section.payload === undefined ? {} : { payload: section.payload }),
      ...(section.mediaAssetId === undefined ? {} : { mediaAssetId: section.mediaAssetId }),
      ...(section.mobileMediaAssetId === undefined
        ? {}
        : { mobileMediaAssetId: section.mobileMediaAssetId }),
      ...(section.hotspots === undefined ? {} : { hotspots: section.hotspots }),
    })),
    ...(input.expectedVersion === undefined ? {} : { expectedVersion: input.expectedVersion }),
  };
}

function sectionDraftBody(
  input: AdminHomeSectionInput & { expectedVersion?: number },
): ApiHomeSectionDraftBody {
  return {
    sectionKey: input.sectionKey,
    sortOrder: input.sortOrder,
    ...(input.isEnabled === undefined ? {} : { isEnabled: input.isEnabled }),
    ...(input.payload === undefined ? {} : { payload: input.payload }),
    ...(input.mediaAssetId === undefined ? {} : { mediaAssetId: input.mediaAssetId }),
    ...(input.mobileMediaAssetId === undefined
      ? {}
      : { mobileMediaAssetId: input.mobileMediaAssetId }),
    ...(input.hotspots === undefined ? {} : { hotspots: input.hotspots }),
    ...(input.expectedVersion === undefined ? {} : { expectedVersion: input.expectedVersion }),
  };
}

export class ApiAdminHomeContentRepository implements AdminHomeContentRepository {
  constructor(
    private readonly client = new HbsApiClient(),
    private readonly resolveAccessToken: () => Promise<string> = accessToken,
  ) {}

  private async request<T>(fn: (token: string) => Promise<T>): Promise<T> {
    return fn(await this.resolveAccessToken());
  }

  async get(sectionKey?: AdminHomeSectionKey): Promise<AdminHomeContent> {
    return mapContent(
      await this.request((token) =>
        this.client.get<ApiHomeContent>(
          sectionKey
            ? `/api/v1/admin/content/home/${encodeURIComponent(sectionKey)}`
            : "/api/v1/admin/content/home",
          undefined,
          token,
        ),
      ),
    );
  }

  async update(input: AdminHomeDraftInput): Promise<AdminHomeRevision> {
    return mapRevision(
      await this.request((token) =>
        this.client.put<ApiHomeRevision>("/api/v1/admin/content/home", draftBody(input), token),
      ),
    );
  }

  async updateSection(
    sectionKey: AdminHomeSectionKey,
    input: AdminHomeSectionInput & { expectedVersion?: number },
  ): Promise<AdminHomeRevision> {
    return mapRevision(
      await this.request((token) =>
        this.client.put<ApiHomeRevision>(
          `/api/v1/admin/content/home/${encodeURIComponent(sectionKey)}`,
          sectionDraftBody(input),
          token,
        ),
      ),
    );
  }

  async publish(): Promise<AdminHomeRevision> {
    return mapRevision(
      await this.request((token) =>
        this.client.post<ApiHomeRevision>("/api/v1/admin/content/home/publish", {}, token),
      ),
    );
  }

  async publishSection(sectionKey: AdminHomeSectionKey): Promise<AdminHomeRevision> {
    return mapRevision(
      await this.request((token) =>
        this.client.post<ApiHomeRevision>(
          `/api/v1/admin/content/home/${encodeURIComponent(sectionKey)}/publish`,
          {},
          token,
        ),
      ),
    );
  }

  async archive(): Promise<AdminHomeRevision> {
    return mapRevision(
      await this.request((token) =>
        this.client.post<ApiHomeRevision>("/api/v1/admin/content/home/archive", {}, token),
      ),
    );
  }

  async archiveSection(sectionKey: AdminHomeSectionKey): Promise<AdminHomeRevision> {
    return mapRevision(
      await this.request((token) =>
        this.client.post<ApiHomeRevision>(
          `/api/v1/admin/content/home/${encodeURIComponent(sectionKey)}/archive`,
          {},
          token,
        ),
      ),
    );
  }
}
