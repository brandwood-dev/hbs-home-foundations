import { useQuery } from "@tanstack/react-query";
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_QUERY_LENGTH } from "@/domain/search/search.constants";
import { searchQueryKeys } from "@/hooks/search/search.query-keys";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getSearchRepository } from "@/repositories/repositoryFactory";
import { isSearchableQuery } from "@/services/search/normalize-search-query";

/** Suggestions du panneau de recherche, debouncées et mises en cache. */
export function useSearchSuggestions(query: string, enabled = true) {
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const isValid = isSearchableQuery(debouncedQuery, SEARCH_MIN_QUERY_LENGTH);

  const result = useQuery({
    queryKey: searchQueryKeys.suggestions(debouncedQuery),
    queryFn: () => getSearchRepository().suggest(debouncedQuery),
    enabled: enabled && isValid,
    staleTime: 60_000,
    retry: false,
  });

  const data = result.data ?? { products: [], categories: [], articles: [] };
  const total = data.products.length + data.categories.length + data.articles.length;

  return {
    ...result,
    debouncedQuery,
    isValidQuery: isValid,
    isTyping: query !== debouncedQuery,
    suggestions: data,
    isEmpty: isValid && !result.isPending && total === 0,
  };
}
