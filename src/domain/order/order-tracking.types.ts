import type { DeliveryMethod } from "@/domain/checkout/checkout.types";
import type { OrderItemSnapshot, OrderStatus, OrderTotals } from "@/domain/order/order.types";

export type OrderTrackingStepKey = "received" | "confirmed" | "preparing" | "shipped" | "delivered";

export type OrderTrackingStepState = "completed" | "current" | "upcoming" | "cancelled";

export interface OrderTrackingStep {
  key: OrderTrackingStepKey;
  label: string;
  description: string;
  state: OrderTrackingStepState;
  completedAt?: string;
}

/** Modèle de lecture public : volontairement plus pauvre que `Order`. */
export interface OrderTrackingResult {
  orderNumber: string;

  status: OrderStatus;
  statusLabel: string;
  statusDescription: string;

  createdAt: string;
  updatedAt: string;

  customerFirstName?: string;
  maskedPhone: string;

  deliveryMethod: DeliveryMethod;
  deliveryLocation?: {
    governorate?: string;
    city?: string;
  };

  items: OrderItemSnapshot[];
  totals: OrderTotals;

  timeline: OrderTrackingStep[];

  nextStepTitle: string;
  nextStepDescription: string;

  isDemo: boolean;
}
