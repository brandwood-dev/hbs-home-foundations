import type { EditorialPage } from "@/domain/content/editorial-page.types";
import type { HomePageContent } from "@/domain/content/home-content.types";
import { HbsApiClient, HbsApiError } from "@/api/client";
import type { ContentRepository } from "@/repositories/interfaces/ContentRepository";
import { MockContentRepository } from "@/repositories/mock/MockContentRepository";

type ApiEditorialPage = EditorialPage;

/** Public content reads. Drafts, archived pages and internal identifiers stay server-side. */
export class ApiContentRepository implements ContentRepository {
  private readonly fallback = new MockContentRepository();

  constructor(private readonly client = new HbsApiClient()) {}

  getHomePage(): Promise<HomePageContent> {
    return this.fallback.getHomePage();
  }

  async getEditorialPage(slug: string): Promise<EditorialPage | null> {
    try {
      return await this.client.get<ApiEditorialPage>(
        `/api/v1/content/pages/${encodeURIComponent(slug)}`,
      );
    } catch (error) {
      if (error instanceof HbsApiError && error.status === 404) return null;
      throw error;
    }
  }
}
