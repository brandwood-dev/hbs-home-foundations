import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { searchQueryKeys } from "@/hooks/search/search.query-keys";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { getSearchHistoryRepository } from "@/repositories/repositoryFactory";

/** Historique de recherche local (max 8 entrées). */
export function useSearchHistory() {
  const hydrated = useIsHydrated();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: searchQueryKeys.history(),
    queryFn: () => getSearchHistoryRepository().list(),
    enabled: hydrated,
    staleTime: Infinity,
    retry: false,
  });

  const invalidate = useCallback(
    (items: unknown) => {
      queryClient.setQueryData(searchQueryKeys.history(), items);
    },
    [queryClient],
  );

  const addMutation = useMutation({
    mutationFn: (value: string) => getSearchHistoryRepository().add(value),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (normalizedQuery: string) =>
      getSearchHistoryRepository().remove(normalizedQuery),
    onSuccess: invalidate,
  });

  const clearMutation = useMutation({
    mutationFn: () => getSearchHistoryRepository().clear(),
    onSuccess: () => invalidate([]),
  });

  return {
    hydrated,
    recentSearches: query.data ?? [],
    addSearch: (value: string) => addMutation.mutate(value),
    removeSearch: (normalizedQuery: string) => removeMutation.mutate(normalizedQuery),
    clearHistory: () => clearMutation.mutate(),
  };
}
