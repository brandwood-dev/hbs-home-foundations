import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CART_STORAGE_KEY } from "@/domain/cart/cart.constants";
import { cartQueryKeys } from "@/hooks/cart/cart.query-keys";
import { getCartRepository } from "@/repositories/repositoryFactory";
import { emptyCart } from "@/services/cart/cart-reconciliation";

/** true une fois l'hydratation client terminée (le panier n'existe pas côté serveur). */
export function useIsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export function useCart() {
  const hydrated = useIsHydrated();
  const queryClient = useQueryClient();

  // Synchronisation entre onglets : on invalide simplement le cache.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== CART_STORAGE_KEY) return;
      void queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [queryClient]);

  const query = useQuery({
    queryKey: cartQueryKeys.current(),
    queryFn: () => getCartRepository().getCart(),
    enabled: hydrated,
    staleTime: 0,
    retry: false,
  });

  return {
    ...query,
    hydrated,
    cart: query.data ?? emptyCart(),
    isEmpty: (query.data?.lineCount ?? 0) === 0,
  };
}
