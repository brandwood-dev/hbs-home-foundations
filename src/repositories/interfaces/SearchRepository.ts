import type {
  GlobalSearchParams,
  GlobalSearchResults,
  SearchSuggestionResults,
} from "@/domain/search/search.types";

export interface SearchRepository {
  /** Suggestions courtes du panneau de recherche — futur `GET /api/v1/search/suggestions`. */
  suggest(query: string, limit?: number): Promise<SearchSuggestionResults>;
  /** Résultats complets paginés — futur `GET /api/v1/search`. */
  search(params: GlobalSearchParams): Promise<GlobalSearchResults>;
}
