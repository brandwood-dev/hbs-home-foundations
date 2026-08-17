import { useMutation } from "@tanstack/react-query";
import { OrderTrackingError } from "@/domain/order/order-tracking.errors";
import type { OrderTrackingResult } from "@/domain/order/order-tracking.types";
import { orderQueryKeys } from "@/hooks/order/order.query-keys";
import type { TrackOrderInput } from "@/repositories/interfaces/OrderRepository";
import { getOrderRepository } from "@/repositories/repositoryFactory";

/**
 * Le résultat vit dans l'état de la mutation : le téléphone n'est jamais mis en cache global.
 */
export function useTrackOrder() {
  return useMutation<OrderTrackingResult, Error, TrackOrderInput>({
    mutationKey: [...orderQueryKeys.all, "track"],
    mutationFn: async (input) => {
      const result = await getOrderRepository().trackOrder(input);
      if (!result) throw new OrderTrackingError("not_found", "Aucun résultat de suivi");
      return result;
    },
  });
}
