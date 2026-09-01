import { HbsApiClient, HbsApiError } from "@/api/client";
import type {
  CategoryRepository,
  PublicCategory,
} from "@/repositories/interfaces/CategoryRepository";

interface ApiCategoryResponse {
  slug: string;
  name: string;
  description: string | null;
  parentSlug: string | null;
  path: string;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  attributes: PublicCategory["attributes"];
  latestProduct?: NonNullable<PublicCategory["latestProduct"]> | null;
  children: ApiCategoryResponse[];
}

function mapCategory(category: ApiCategoryResponse): PublicCategory {
  return {
    ...category,
    attributes: category.attributes.map((attribute) => ({
      ...attribute,
      options: [...attribute.options],
    })),
    latestProduct: category.latestProduct ?? null,
    children: category.children.map(mapCategory),
  };
}

export class ApiCategoryRepository implements CategoryRepository {
  constructor(private readonly apiClient: HbsApiClient = new HbsApiClient()) {}

  async list(options: { navigationOnly?: boolean } = {}): Promise<PublicCategory[]> {
    const query = options.navigationOnly ? "?navigation=true" : "";
    const response = await this.apiClient.get<ApiCategoryResponse[]>(
      `/api/v1/catalog/categories${query}`,
    );
    return response.map(mapCategory);
  }

  async getBySlug(slug: string): Promise<PublicCategory | null> {
    try {
      return mapCategory(
        await this.apiClient.get<ApiCategoryResponse>(
          `/api/v1/catalog/categories/${encodeURIComponent(slug)}`,
        ),
      );
    } catch (error) {
      if (error instanceof HbsApiError && error.status === 404) return null;
      throw error;
    }
  }
}
