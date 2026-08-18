import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FAVORITES_QUERY_KEY } from "@/domain/favorites/favorites.constants";
import { FAVORITES_ERROR_MESSAGES, FavoritesError } from "@/domain/favorites/favorites.errors";
import { useFavorites } from "@/hooks/favorites/useFavorites";
import { trackEvent } from "@/lib/analytics/analytics";
import { getFavoritesRepository } from "@/repositories/repositoryFactory";

interface ToggleInput {
  productId: string;
  productName: string;
}

/** Ajout / retrait d'un favori avec retour visuel non bloquant. */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { favorites, hydrated } = useFavorites();

  const isFavorite = useCallback(
    (productId: string) => favorites.items.some((item) => item.productId === productId),
    [favorites.items],
  );

  const mutation = useMutation({
    mutationFn: ({ productId }: ToggleInput) => getFavoritesRepository().toggle(productId),
    onSuccess: (result, variables) => {
      queryClient.setQueryData(FAVORITES_QUERY_KEY, result.favorites);
      trackEvent(result.isFavorite ? "add_to_wishlist" : "remove_from_wishlist", {
        item_id: variables.productId,
      });
      toast.success(
        result.isFavorite
          ? `${variables.productName} ajouté à vos favoris`
          : `${variables.productName} retiré de vos favoris`,
      );
    },
    onError: (error) => {
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
    toggleFavorite: (input: ToggleInput) => mutation.mutate(input),
    isPending: mutation.isPending,
    pendingProductId: mutation.isPending ? mutation.variables?.productId : undefined,
  };
}
