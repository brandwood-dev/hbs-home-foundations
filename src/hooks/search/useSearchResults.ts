import { useQuery } from "@tanstack/react-query";
import { SEARCH_MIN_QUERY_LENGTH } from "@/domain/search/search.constants";
import type { GlobalSearchParams } from "@/domain/search/search.types";
import { searchQueryKeys } from "@/hooks/search/search.query-keys";
import { getSearchRepository } from "@/repositories/repositoryFactory";
import { isSearchableQuery } from "@/services/search/normalize-search-query";

export const searchResultsQueryOptions = (params: GlobalSearchParams) => ({
  queryKey: searchQueryKeys.results(params),
  queryFn: () => getSearchRepository().search(params),
  staleTime: 30_000,
});

/** Résultats complets de la page /recherche. */
export function useSearchResults(params: GlobalSearchParams) {
  const isValid = isSearchableQuery(params.query, SEARCH_MIN_QUERY_LENGTH);

  const result = useQuery({
    ...searchResultsQueryOptions(params),
    enabled: isValid,
    retry: false,
  });

  return {
    ...result,
    isValidQuery: isValid,
    results: result.data ?? null,
    hasResults: (result.data?.totalProducts ?? 0) > 0,
  };
}
