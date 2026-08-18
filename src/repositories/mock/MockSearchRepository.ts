import {
  SEARCH_MIN_QUERY_LENGTH,
  SEARCH_PAGE_SIZE,
  SEARCH_RELATED_ARTICLES_MAX,
  SEARCH_RELATED_CATEGORIES_MAX,
  SEARCH_SUGGESTION_LIMITS,
} from "@/domain/search/search.constants";
import type {
  ArticleSearchHit,
  GlobalSearchParams,
  GlobalSearchResults,
  ProductSearchHit,
  SearchSuggestionResults,
} from "@/domain/search/search.types";
import { adviceArticles } from "@/fixtures/advice.fixture";
import type { ProductRepository } from "@/repositories/interfaces/ProductRepository";
import type { SearchRepository } from "@/repositories/interfaces/SearchRepository";
import { buildProductSearchIndex, type ProductSearchDoc } from "@/services/search/search-index";
import {
  buildCategoryIndex,
  searchCategories,
  type CategoryIndexEntry,
} from "@/services/search/search-catalog-index";
import {
  calculateSearchScore,
  countHitsByCategory,
  sortProductHits,
} from "@/services/search/search-ranking";
import {
  isSearchableQuery,
  normalizeSearchQuery,
  tokenizeSearchQuery,
} from "@/services/search/normalize-search-query";

function emptyResults(query: string, params?: GlobalSearchParams): GlobalSearchResults {
  return {
    query,
    products: [],
    categories: [],
    articles: [],
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? SEARCH_PAGE_SIZE,
    totalProducts: 0,
    totalPages: 0,
    categoryCounts: {},
  };
}

function searchArticles(query: string, limit: number): ArticleSearchHit[] {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return [];
  return adviceArticles
    .map((article) => {
      const terms = normalizeSearchQuery(
        `${article.title} ${article.excerpt} ${article.category} ${article.slug}`,
      );
      if (!tokens.every((token) => terms.includes(token))) return null;
      const hit: ArticleSearchHit = {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        score: normalizeSearchQuery(article.title).includes(normalizeSearchQuery(query)) ? 60 : 30,
        readingTime: `${article.readingTimeMinutes} min`,
        ...(article.image?.src ? { imageUrl: article.image.src } : {}),
      };
      return hit;
    })
    .filter((hit): hit is ArticleSearchHit => hit !== null)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "fr"))
    .slice(0, limit);
}

/**
 * Recherche in-memory sur le catalogue de démonstration.
 * Reproduit le contrat que l'API HTTP implémentera (`/api/v1/search`).
 */
export class MockSearchRepository implements SearchRepository {
  private index: Map<string, ProductSearchDoc> | null = null;
  private readonly categoryIndex: CategoryIndexEntry[] = buildCategoryIndex();

  constructor(private readonly products: ProductRepository) {}

  private async ensureIndex() {
    if (this.index) return this.index;
    const all = await this.products.listScope();
    this.index = buildProductSearchIndex(all);
    return this.index;
  }

  private async matchProducts(query: string): Promise<ProductSearchHit[]> {
    const index = await this.ensureIndex();
    const all = await this.products.listScope();
    const hits: ProductSearchHit[] = [];
    for (const product of all) {
      const doc = index.get(product.id);
      if (!doc) continue;
      const { score, matchedFields } = calculateSearchScore(doc, query);
      if (score > 0) hits.push({ product, score, matchedFields });
    }
    return hits;
  }

  async suggest(
    query: string,
    limit = SEARCH_SUGGESTION_LIMITS.products,
  ): Promise<SearchSuggestionResults> {
    if (!isSearchableQuery(query, SEARCH_MIN_QUERY_LENGTH)) {
      return { products: [], categories: [], articles: [] };
    }
    const hits = sortProductHits(await this.matchProducts(query), "relevance");
    return {
      products: hits.slice(0, limit),
      categories: searchCategories(this.categoryIndex, query, SEARCH_SUGGESTION_LIMITS.categories),
      articles: searchArticles(query, SEARCH_SUGGESTION_LIMITS.articles),
    };
  }

  async search(params: GlobalSearchParams): Promise<GlobalSearchResults> {
    if (!isSearchableQuery(params.query, SEARCH_MIN_QUERY_LENGTH)) {
      return emptyResults(params.query, params);
    }

    const allHits = await this.matchProducts(params.query);
    const categoryCounts = countHitsByCategory(allHits);
    const scoped = params.category
      ? allHits.filter((hit) => hit.product.category === params.category)
      : allHits;
    const sorted = sortProductHits(scoped, params.sort);

    const pageSize = params.pageSize > 0 ? params.pageSize : SEARCH_PAGE_SIZE;
    const totalProducts = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
    const page = Math.min(Math.max(1, params.page), totalPages);
    const start = (page - 1) * pageSize;

    return {
      query: params.query,
      products: sorted.slice(start, start + pageSize),
      categories: searchCategories(this.categoryIndex, params.query, SEARCH_RELATED_CATEGORIES_MAX),
      articles: searchArticles(params.query, SEARCH_RELATED_ARTICLES_MAX),
      page,
      pageSize,
      totalProducts,
      totalPages: totalProducts === 0 ? 0 : totalPages,
      categoryCounts,
    };
  }
}
