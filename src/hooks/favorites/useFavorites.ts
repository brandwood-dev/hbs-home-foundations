import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FAVORITES_QUERY_KEY,
  FAVORITES_SYNC_STORAGE_KEY,
  FAVORITES_STORAGE_KEY,
} from "@/domain/favorites/favorites.constants";
import type { ResolvedFavorites } from "@/domain/favorites/favorites.types";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { getFavoritesRepository } from "@/repositories/repositoryFactory";

export const emptyFavorites: ResolvedFavorites = {
  items: [],
  removedProductIds: [],
  count: 0,
};

/** Favoris résolus + synchronisation entre onglets. */
export function useFavorites() {
  const hydrated = useIsHydrated();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    };
    const onStorage = (event: StorageEvent) => {
      if (
        event.key !== null &&
        event.key !== FAVORITES_STORAGE_KEY &&
        event.key !== FAVORITES_SYNC_STORAGE_KEY
      )
        return;
      invalidate();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: () => getFavoritesRepository().get(),
    enabled: hydrated,
    // Les mutations mettent à jour le cache localement. Une durée courte évite
    // de relancer une résolution catalogue à chaque remontée de composant.
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const favorites = query.data ?? emptyFavorites;

  return {
    ...query,
    hydrated,
    favorites,
    count: favorites.count,
    isEmpty: favorites.count === 0,
  };
}

/** Compteur léger pour l'en-tête (aucune résolution catalogue nécessaire au rendu). */
export function useFavoritesCount(): number {
  const { count, hydrated } = useFavorites();
  return hydrated ? count : 0;
}
