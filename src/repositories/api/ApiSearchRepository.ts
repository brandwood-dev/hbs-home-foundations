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
import { ApiContentRepository } from "@/repositories/api/ApiContentRepository";
import { ApiCategoryRepository } from "@/repositories/api/ApiCategoryRepository";

/**
 * Search adapter backed by the public catalogue API.
 *
 * Product hits, categories, counts, filters and pagination are resolved from
 * the API. The fixture category index is used only by the mock repository.
 */
export class ApiSearchRepository implements SearchRepository {
  private readonly products: ApiProductRepository;
  private readonly categories: ApiCategoryRepository;
  private categoryIndexPromise: Promise<ReturnType<typeof buildCategoryIndex>> | null = null;
  private readonly content: ApiContentRepository;

  constructor(apiClient: HbsApiClient = new HbsApiClient()) {
    this.products = new ApiProductRepository(apiClient);
    this.categories = new ApiCategoryRepository(apiClient);
    this.content = new ApiContentRepository(apiClient);
  }

  private getCategoryIndex(): Promise<ReturnType<typeof buildCategoryIndex>> {
    if (!this.categoryIndexPromise) {
      this.categoryIndexPromise = this.categories
        .list()
        .then((categories) => buildCategoryIndex(categories))
        // Category suggestions are supplementary: a taxonomy outage must not
        // make product/article search unavailable, and must not reintroduce
        // stale fixture categories in API mode.
        .catch(() => []);
    }
    return this.categoryIndexPromise;
  }

  async suggest(
    query: string,
    limit = SEARCH_SUGGESTION_LIMITS.products,
  ): Promise<SearchSuggestionResults> {
    const [response, articles, categoryIndex] = await Promise.all([
      this.products.list({
        query,
        page: 1,
        pageSize: Math.max(1, Math.min(SEARCH_SUGGESTION_LIMITS.products, limit)),
        sort: "recommended",
      }),
      this.content.listArticles({ query, page: 1, pageSize: SEARCH_SUGGESTION_LIMITS.articles }),
      this.getCategoryIndex(),
    ]);
    return {
      products: response.items.map((product) => this.toHit(product, query)),
      categories: searchCategories(categoryIndex, query, SEARCH_SUGGESTION_LIMITS.categories),
      articles: articles.items.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        score: article.title.toLocaleLowerCase("fr").includes(query.toLocaleLowerCase("fr"))
          ? 60
          : 30,
        readingTime: `${article.readingTimeMinutes} min`,
        ...(article.cover?.publicUrl ? { imageUrl: article.cover.publicUrl } : {}),
      })),
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
    const [response, articles, categoryIndex] = await Promise.all([
      this.products.list(listParams),
      this.content.listArticles({
        query: params.query,
        page: 1,
        pageSize: SEARCH_SUGGESTION_LIMITS.articles,
      }),
      this.getCategoryIndex(),
    ]);
    return {
      query: params.query,
      products: response.items.map((product) => this.toHit(product, params.query)),
      categories: searchCategories(categoryIndex, params.query, 4),
      articles: articles.items.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        score: article.title.toLocaleLowerCase("fr").includes(params.query.toLocaleLowerCase("fr"))
          ? 60
          : 30,
        readingTime: `${article.readingTimeMinutes} min`,
        ...(article.cover?.publicUrl ? { imageUrl: article.cover.publicUrl } : {}),
      })),
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
