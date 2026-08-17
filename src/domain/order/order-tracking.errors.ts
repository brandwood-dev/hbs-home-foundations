import { ORDER_TRACKING_NOT_FOUND_MESSAGE } from "@/domain/order/order-tracking.constants";

export type OrderTrackingErrorCode = "invalid_input" | "not_found" | "unknown";

export class OrderTrackingError extends Error {
  readonly code: OrderTrackingErrorCode;

  constructor(code: OrderTrackingErrorCode, message: string) {
    super(message);
    this.name = "OrderTrackingError";
    this.code = code;
  }
}

export const ORDER_TRACKING_TECHNICAL_ERROR =
  "Une erreur est survenue pendant la recherche de votre commande.";

export function getOrderTrackingErrorMessage(error: unknown): string {
  if (error instanceof OrderTrackingError && error.code === "not_found") {
    return ORDER_TRACKING_NOT_FOUND_MESSAGE;
  }
  return ORDER_TRACKING_TECHNICAL_ERROR;
}
