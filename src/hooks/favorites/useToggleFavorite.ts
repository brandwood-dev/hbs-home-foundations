import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FAVORITES_OPTIMISTIC_QUERY_KEY,
  FAVORITES_QUERY_KEY,
} from "@/domain/favorites/favorites.constants";
import { FAVORITES_ERROR_MESSAGES, FavoritesError } from "@/domain/favorites/favorites.errors";
import type { ResolvedFavorites } from "@/domain/favorites/favorites.types";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { trackEvent } from "@/lib/analytics/analytics";
import { getFavoritesRepository } from "@/repositories/repositoryFactory";

interface ToggleInput {
  productId: string;
  productName: string;
  /** État lu dans le cache au moment du clic (évite GET /favorites). */
  isFavorite: boolean;
}

type OptimisticState = Record<string, boolean>;

interface MutationContext {
  previousFavorites: ResolvedFavorites | undefined;
  previousOptimistic: OptimisticState;
}

/** Ajout / retrait d'un favori avec retour visuel non bloquant. */
export function useToggleFavorite(productId: string) {
  const queryClient = useQueryClient();
  const hydrated = useIsHydrated();

  // Chaque carte s'abonne uniquement au booléen qui la concerne. Le cache
  // complet reste partagé par React Query pour la page Favoris et le compteur.
  const favoriteQuery = useQuery<ResolvedFavorites, Error, boolean>({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: () => getFavoritesRepository().get(),
    enabled: hydrated,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
    select: (favorites) => favorites.items.some((item) => item.productId === productId),
  });

  const optimisticQuery = useQuery<OptimisticState>({
    queryKey: FAVORITES_OPTIMISTIC_QUERY_KEY,
    queryFn: async () => ({}),
    enabled: hydrated,
    initialData: {},
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const isFavorite = useCallback(
    () => optimisticQuery.data?.[productId] ?? Boolean(favoriteQuery.data),
    [favoriteQuery.data, optimisticQuery.data, productId],
  );

  const mutation = useMutation<ResolvedFavorites, unknown, ToggleInput, MutationContext>({
    // Le serveur sait déjà si l'action est un ajout ou un retrait : ne refais
    // pas un GET séquentiel avant le POST/DELETE.
    mutationFn: ({ productId: id, isFavorite }) =>
      isFavorite ? getFavoritesRepository().remove(id) : getFavoritesRepository().add(id),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_QUERY_KEY });
      const previousFavorites = queryClient.getQueryData<ResolvedFavorites>(FAVORITES_QUERY_KEY);
      const previousOptimistic =
        queryClient.getQueryData<OptimisticState>(FAVORITES_OPTIMISTIC_QUERY_KEY) ?? {};
      const nextIsFavorite = !variables.isFavorite;

      queryClient.setQueryData<OptimisticState>(FAVORITES_OPTIMISTIC_QUERY_KEY, {
        ...previousOptimistic,
        [variables.productId]: nextIsFavorite,
      });

      if (previousFavorites) {
        queryClient.setQueryData<ResolvedFavorites>(FAVORITES_QUERY_KEY, (current) => {
          if (!current) return current;
          const items = nextIsFavorite
            ? current.items
            : current.items.filter((item) => item.productId !== variables.productId);
          return {
            ...current,
            items,
            count: Math.max(0, current.count + (nextIsFavorite ? 1 : -1)),
          };
        });
      }

      return { previousFavorites, previousOptimistic };
    },
    onSuccess: (favorites, variables) => {
      queryClient.setQueryData(FAVORITES_QUERY_KEY, favorites);
      queryClient.setQueryData<OptimisticState>(FAVORITES_OPTIMISTIC_QUERY_KEY, (current) => {
        if (!current) return {};
        const next = { ...current };
        delete next[variables.productId];
        return next;
      });
      trackEvent(variables.isFavorite ? "remove_from_wishlist" : "add_to_wishlist", {
        item_id: variables.productId,
      });
      toast.success(
        variables.isFavorite
          ? `${variables.productName} retiré de vos favoris`
          : `${variables.productName} ajouté à vos favoris`,
      );
    },
    onError: (error, _variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, context.previousFavorites);
      }
      queryClient.setQueryData(FAVORITES_OPTIMISTIC_QUERY_KEY, context?.previousOptimistic ?? {});
      const message =
        error instanceof FavoritesError
          ? FAVORITES_ERROR_MESSAGES[error.code]
          : "Une erreur est survenue. Réessayez.";
      toast.error(message);
    },
  });

  return {
    hydrated,
    isFavorite,
    toggleFavorite: (input: Omit<ToggleInput, "isFavorite">) => {
      const currentFavorites = queryClient.getQueryData<ResolvedFavorites>(FAVORITES_QUERY_KEY);
      const currentIsFavorite =
        queryClient.getQueryData<OptimisticState>(FAVORITES_OPTIMISTIC_QUERY_KEY)?.[productId] ??
        currentFavorites?.items.some((item) => item.productId === productId) ??
        Boolean(favoriteQuery.data);
      mutation.mutate({ ...input, isFavorite: currentIsFavorite });
    },
    isPending: mutation.isPending,
    pendingProductId: mutation.isPending ? mutation.variables?.productId : undefined,
  };
}
