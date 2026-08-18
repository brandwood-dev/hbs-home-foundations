import type { SearchSort } from "@/domain/search/search.types";

export const SEARCH_HISTORY_STORAGE_KEY = "hbs-home-search-history-v1";
export const SEARCH_HISTORY_VERSION = 1 as const;
export const SEARCH_HISTORY_MAX_ITEMS = 8;

/** Longueur minimale avant de déclencher une recherche ou des suggestions. */
export const SEARCH_MIN_QUERY_LENGTH = 2;
export const SEARCH_DEBOUNCE_MS = 280;

export const SEARCH_SUGGESTION_LIMITS = {
  products: 6,
  categories: 4,
  articles: 3,
} as const;

export const SEARCH_PAGE_SIZE = 12;
export const SEARCH_RELATED_CATEGORIES_MAX = 4;
export const SEARCH_RELATED_ARTICLES_MAX = 3;

export const SEARCH_SORT_VALUES: SearchSort[] = ["relevance", "newest", "price_asc", "price_desc"];

export const SEARCH_SORT_LABELS: Record<SearchSort, string> = {
  relevance: "Pertinence",
  newest: "Nouveautés",
  price_asc: "Prix croissant",
  price_desc: "Prix décroissant",
};

/** Barème déterministe du classement par pertinence. */
export const SEARCH_SCORE_WEIGHTS = {
  reference: 120,
  sku: 115,
  nameExact: 100,
  namePrefix: 85,
  nameWords: 70,
  category: 55,
  material: 45,
  color: 40,
  attributes: 30,
  description: 15,
} as const;
