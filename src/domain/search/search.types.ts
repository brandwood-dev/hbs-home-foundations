import type { Product, ProductCategory } from "@/domain/product/product.types";

export type SearchResultType = "product" | "category" | "article";

export type SearchSort = "relevance" | "newest" | "price_asc" | "price_desc";

export interface GlobalSearchParams {
  query: string;
  category?: ProductCategory | undefined;
  sort: SearchSort;
  page: number;
  pageSize: number;
}

export interface ProductSearchHit {
  product: Product;
  score: number;
  matchedFields: string[];
}

export interface CategorySearchHit {
  id: string;
  label: string;
  href: string;
  description?: string;
  score: number;
}

export interface ArticleSearchHit {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl?: string;
  readingTime?: string;
  score: number;
}

export interface SearchSuggestionResults {
  products: ProductSearchHit[];
  categories: CategorySearchHit[];
  articles: ArticleSearchHit[];
}

export interface GlobalSearchResults {
  query: string;

  products: ProductSearchHit[];
  categories: CategorySearchHit[];
  articles: ArticleSearchHit[];

  page: number;
  pageSize: number;
  totalProducts: number;
  totalPages: number;

  categoryCounts: Partial<Record<ProductCategory, number>>;
}

/** Recherche mémorisée localement (aucune donnée personnelle). */
export interface RecentSearch {
  query: string;
  normalizedQuery: string;
  searchedAt: string;
}

export interface SearchHistoryStorage {
  version: 1;
  items: RecentSearch[];
}

export interface PopularSearch {
  label: string;
  query: string;
}
