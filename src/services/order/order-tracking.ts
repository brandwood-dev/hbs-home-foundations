import type { Order } from "@/domain/order/order.types";
import type { OrderTrackingResult, OrderTrackingStep } from "@/domain/order/order-tracking.types";
import {
  ORDER_TRACKING_NEXT_STEPS,
  ORDER_TRACKING_STATUS_DESCRIPTIONS,
  ORDER_TRACKING_STATUS_TITLES,
  ORDER_TRACKING_STEPS,
} from "@/domain/order/order-tracking.constants";
import { getStatusStepIndex, isCancelled, isOrderStatus } from "@/services/order/order-status";
import { maskPhoneNumber, normalizeTunisianPhone } from "@/services/checkout/phone-normalization";

/** Fonction pure : aucune date n'est inventée lorsque la donnée n'existe pas. */
export function buildOrderTrackingTimeline(order: Order): OrderTrackingStep[] {
  const cancelled = isCancelled(order.status);
  const reachedIndex = getStatusStepIndex(order.status);

  return ORDER_TRACKING_STEPS.map((step, index) => {
    let state: OrderTrackingStep["state"];

    if (cancelled) {
      state = index <= reachedIndex ? "completed" : "cancelled";
    } else if (index < reachedIndex) {
      state = "completed";
    } else if (index === reachedIndex) {
      state = "current";
    } else {
      state = "upcoming";
    }

    const completedAt = index === 0 && state === "completed" ? order.createdAt : undefined;

    return {
      key: step.key,
      label: step.label,
      description: step.description,
      state,
      ...(completedAt ? { completedAt } : {}),
    };
  });
}

/**
 * Projette une commande complète vers le modèle de suivi public.
 * Adresse complète, e-mail, repère et notes ne sont jamais exposés.
 */
export function toOrderTrackingResult(order: Order): OrderTrackingResult {
  const status = isOrderStatus(order.status) ? order.status : "pending_confirmation";
  const location = order.shippingAddress;

  return {
    orderNumber: order.orderNumber,
    status,
    statusLabel: ORDER_TRACKING_STATUS_TITLES[status],
    statusDescription: ORDER_TRACKING_STATUS_DESCRIPTIONS[status],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt ?? order.createdAt,
    ...(order.customer.firstName ? { customerFirstName: order.customer.firstName } : {}),
    maskedPhone: maskPhoneNumber(order.customer.phone),
    deliveryMethod: order.deliveryMethod,
    ...(order.deliveryMethod === "home_delivery" && location
      ? {
          deliveryLocation: {
            ...(location.governorate ? { governorate: location.governorate } : {}),
            ...(location.city ? { city: location.city } : {}),
          },
        }
      : {}),
    items: order.items,
    totals: order.totals,
    timeline: buildOrderTrackingTimeline(order),
    nextStepTitle: ORDER_TRACKING_STATUS_TITLES[status],
    nextStepDescription: ORDER_TRACKING_NEXT_STEPS[status],
    isDemo: order.isDemo === true,
  };
}

/** Comparaison exacte après normalisation — aucun log du numéro saisi. */
export function phoneMatchesOrder(order: Order, phone: string): boolean {
  return normalizeTunisianPhone(order.customer.phone) === normalizeTunisianPhone(phone);
}
