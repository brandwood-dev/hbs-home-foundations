import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FAVORITES_QUERY_KEY } from "@/domain/favorites/favorites.constants";
import {
  FAVORITES_ERROR_MESSAGES,
  FavoritesError,
} from "@/domain/favorites/favorites.errors";
import { getFavoritesRepository } from "@/repositories/repositoryFactory";

function errorMessage(error: unknown): string {
  return error instanceof FavoritesError
    ? FAVORITES_ERROR_MESSAGES[error.code]
    : "Une erreur est survenue. Réessayez.";
}

/** Actions de la page Favoris : retrait ciblé et vidage complet. */
export function useFavoritesActions() {
  const queryClient = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: (productId: string) => getFavoritesRepository().remove(productId),
    onSuccess: (favorites) => {
      queryClient.setQueryData(FAVORITES_QUERY_KEY, favorites);
      toast.success("Article retiré de vos favoris");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const clearMutation = useMutation({
    mutationFn: () => getFavoritesRepository().clear(),
    onSuccess: (favorites) => {
      queryClient.setQueryData(FAVORITES_QUERY_KEY, favorites);
      toast.success("Vos favoris ont été vidés");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return {
    removeFavorite: (productId: string) => removeMutation.mutate(productId),
    clearFavorites: () => clearMutation.mutate(),
    isRemoving: removeMutation.isPending,
    isClearing: clearMutation.isPending,
  };
}
