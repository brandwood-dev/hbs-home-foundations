import type {
  GlobalSearchParams,
  GlobalSearchResults,
  ProductSearchHit,
  SearchSuggestionResults,
} from "@/domain/search/search.types";
import type { Product, ProductCategory } from "@/domain/product/product.types";
import { SEARCH_PAGE_SIZE, SEARCH_SUGGESTION_LIMITS } from "@/domain/search/search.constants";
import { HbsApiClient } from "@/api/client";
import { ApiProductRepository } from "@/repositories/api/ApiProductRepository";
import type { SearchRepository } from "@/repositories/interfaces/SearchRepository";
import type { ProductListParams } from "@/repositories/interfaces/ProductRepository";
import { buildCategoryIndex, searchCategories } from "@/services/search/search-catalog-index";
import { buildProductSearchDoc, type ProductSearchDoc } from "@/services/search/search-index";
import { calculateSearchScore } from "@/services/search/search-ranking";

/**
 * Search adapter backed by the public catalogue API.
 *
 * Categories remain navigation metadata owned by the frontend. Product hits,
 * counts, filters and pagination are always resolved by the API; no catalogue
 * fixture is used in this repository.
 */
export class ApiSearchRepository implements SearchRepository {
  private readonly products: ApiProductRepository;
  private readonly categoryIndex = buildCategoryIndex();

  constructor(apiClient: HbsApiClient = new HbsApiClient()) {
    this.products = new ApiProductRepository(apiClient);
  }

  async suggest(
    query: string,
    limit = SEARCH_SUGGESTION_LIMITS.products,
  ): Promise<SearchSuggestionResults> {
    const response = await this.products.list({
      query,
      page: 1,
      pageSize: Math.max(1, Math.min(SEARCH_SUGGESTION_LIMITS.products, limit)),
      sort: "recommended",
    });
    return {
      products: response.items.map((product) => this.toHit(product, query)),
      categories: searchCategories(this.categoryIndex, query, SEARCH_SUGGESTION_LIMITS.categories),
      articles: [],
    };
  }

  async search(params: GlobalSearchParams): Promise<GlobalSearchResults> {
    const listParams: ProductListParams = {
      query: params.query,
      page: params.page,
      pageSize: params.pageSize || SEARCH_PAGE_SIZE,
      sort: params.sort === "relevance" ? "recommended" : params.sort,
      ...(params.category ? { categories: [params.category] } : {}),
    };
    const response = await this.products.list(listParams);
    return {
      query: params.query,
      products: response.items.map((product) => this.toHit(product, params.query)),
      categories: searchCategories(this.categoryIndex, params.query, 4),
      articles: [],
      page: response.page,
      pageSize: response.pageSize,
      totalProducts: response.total,
      totalPages: response.totalPages,
      categoryCounts: response.categoryCounts ?? this.countPageCategories(response.items),
    };
  }

  private toHit(product: Product, query: string): ProductSearchHit {
    const doc: ProductSearchDoc = buildProductSearchDoc(product);
    const result = calculateSearchScore(doc, query);
    return { product, score: result.score, matchedFields: result.matchedFields };
  }

  private countPageCategories(
    products: Awaited<ReturnType<ApiProductRepository["list"]>>["items"],
  ): Partial<Record<ProductCategory, number>> {
    return products.reduce<Partial<Record<ProductCategory, number>>>((counts, product) => {
      counts[product.category] = (counts[product.category] ?? 0) + 1;
      return counts;
    }, {});
  }
}
