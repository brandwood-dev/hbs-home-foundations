import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Cart } from "@/domain/cart/cart.types";
import { cartQueryKeys } from "@/hooks/cart/cart.query-keys";
import { getCartRepository } from "@/repositories/repositoryFactory";

/** Écrit le résultat de la mutation dans le cache : le repository est la source de vérité. */
export function useCartMutationOptions() {
  const queryClient = useQueryClient();
  return {
    onSuccess: (cart: Cart) => {
      queryClient.setQueryData(cartQueryKeys.current(), cart);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });
    },
  };
}

export function useAddCartItemMutation() {
  const options = useCartMutationOptions();
  return useMutation({
    mutationKey: [...cartQueryKeys.all, "add"],
    mutationFn: (input: { productId: string; variantId: string; quantity: number }) =>
      getCartRepository().addItem(input),
    ...options,
  });
}

export function useUpdateCartItemMutation() {
  const options = useCartMutationOptions();
  return useMutation({
    mutationKey: [...cartQueryKeys.all, "update"],
    mutationFn: (input: { lineId: string; quantity: number }) =>
      getCartRepository().updateItem(input.lineId, input.quantity),
    ...options,
  });
}

export function useRemoveCartItemMutation() {
  const options = useCartMutationOptions();
  return useMutation({
    mutationKey: [...cartQueryKeys.all, "remove"],
    mutationFn: (lineId: string) => getCartRepository().removeItem(lineId),
    ...options,
  });
}

export function useClearCartMutation() {
  const options = useCartMutationOptions();
  return useMutation({
    mutationKey: [...cartQueryKeys.all, "clear"],
    mutationFn: () => getCartRepository().clearCart(),
    ...options,
  });
}

export function useApplyCartPromotionMutation() {
  const options = useCartMutationOptions();
  return useMutation({
    mutationKey: [...cartQueryKeys.all, "promotion", "apply"],
    mutationFn: (code: string) => getCartRepository().applyPromotion(code),
    ...options,
  });
}

export function useRemoveCartPromotionMutation() {
  const options = useCartMutationOptions();
  return useMutation({
    mutationKey: [...cartQueryKeys.all, "promotion", "remove"],
    mutationFn: () => getCartRepository().removePromotion(),
    ...options,
  });
}
