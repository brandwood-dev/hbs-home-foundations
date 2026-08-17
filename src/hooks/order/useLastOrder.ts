import { useQuery } from "@tanstack/react-query";
import { useIsHydrated } from "@/hooks/cart/useCart";
import { orderQueryKeys } from "@/hooks/order/order.query-keys";
import { getOrderRepository } from "@/repositories/repositoryFactory";

/** Dernière commande de la session — la confirmation survit au rechargement. */
export function useLastOrder() {
  const hydrated = useIsHydrated();
  const query = useQuery({
    queryKey: orderQueryKeys.last(),
    queryFn: () => getOrderRepository().getLastOrder(),
    enabled: hydrated,
    staleTime: Infinity,
    retry: false,
  });

  return { ...query, hydrated, order: query.data ?? null };
}
