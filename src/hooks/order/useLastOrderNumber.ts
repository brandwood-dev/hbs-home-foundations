import { useLastOrder } from "@/hooks/order/useLastOrder";

/**
 * Numéro de la dernière commande de la session (jamais le téléphone).
 * Passe par le repository : aucun accès direct au stockage depuis les composants.
 */
export function useLastOrderNumber(): { orderNumber: string | null; hydrated: boolean } {
  const { order, hydrated, isLoading } = useLastOrder();
  return {
    orderNumber: !hydrated || isLoading ? null : (order?.orderNumber ?? null),
    hydrated: hydrated && !isLoading,
  };
}
