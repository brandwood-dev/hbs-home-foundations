import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Order } from "@/domain/order/order.types";
import { cartQueryKeys } from "@/hooks/cart/cart.query-keys";
import { orderQueryKeys } from "@/hooks/order/order.query-keys";
import type { CreateOrderInput } from "@/repositories/interfaces/OrderRepository";
import { getCartRepository, getOrderRepository } from "@/repositories/repositoryFactory";

/** Crée la commande puis vide le panier — jamais l'inverse. */
export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...orderQueryKeys.all, "create"],
    mutationFn: async (input: CreateOrderInput): Promise<Order> => {
      const order = await getOrderRepository().createOrder(input);
      const cart = await getCartRepository().clearCart();
      queryClient.setQueryData(cartQueryKeys.current(), cart);
      return order;
    },
    onSuccess: (order) => {
      queryClient.setQueryData(orderQueryKeys.last(), order);
      queryClient.setQueryData(orderQueryKeys.byNumber(order.orderNumber), order);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });
    },
  });
}
