import type {
  GlobalSearchParams,
  GlobalSearchResults,
  SearchSuggestionResults,
} from "@/domain/search/search.types";

export interface SearchRepository {
  /** Suggestions courtes : produits via `/api/v1/products`, catégories via l'index de navigation. */
  suggest(query: string, limit?: number): Promise<SearchSuggestionResults>;
  /** Résultats paginés via `/api/v1/products` avec `q`, filtres et tri serveur. */
  search(params: GlobalSearchParams): Promise<GlobalSearchResults>;
}
