import { useQuery } from "@tanstack/react-query";
import { getProductRepository } from "@/repositories/repositoryFactory";
import { buildPopularSearches } from "@/services/search/popular-searches";
import { searchQueryKeys } from "@/hooks/search/search.query-keys";

const POPULAR_SEARCH_SOURCE_PAGE_SIZE = 24;

/**
 * Published-product search chips for the global search panel and empty state.
 * The short refresh interval keeps catalog publication changes visible without
 * requiring a frontend rebuild or a manual cache purge.
 */
export function usePopularSearches(enabled = true) {
  const result = useQuery({
    queryKey: searchQueryKeys.popular(),
    queryFn: async () => {
      const response = await getProductRepository().list({
        page: 1,
        pageSize: POPULAR_SEARCH_SOURCE_PAGE_SIZE,
        sort: "recommended",
      });
      return buildPopularSearches(response.items);
    },
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchInterval: enabled ? 60_000 : false,
    refetchOnWindowFocus: true,
    retry: false,
  });

  return {
    ...result,
    popularSearches: result.data ?? [],
  };
}
