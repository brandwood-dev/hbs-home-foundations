export type OrderErrorCode =
  | "empty_cart"
  | "item_unavailable"
  | "quantity_adjusted"
  | "price_changed"
  | "invalid_payload"
  | "storage_unavailable"
  | "order_not_found"
  | "unknown";

export interface OrderErrorDetail {
  lineId?: string;
  productName?: string;
  message: string;
}

export class OrderError extends Error {
  readonly code: OrderErrorCode;
  readonly details: OrderErrorDetail[];

  constructor(code: OrderErrorCode, message: string, details: OrderErrorDetail[] = []) {
    super(message);
    this.name = "OrderError";
    this.code = code;
    this.details = details;
  }
}

export const ORDER_ERROR_MESSAGES: Record<OrderErrorCode, string> = {
  empty_cart: "Votre panier est vide. Ajoutez un article avant de commander.",
  item_unavailable:
    "Certains articles ne sont plus disponibles. Mettez votre panier à jour puis réessayez.",
  quantity_adjusted:
    "Les quantités disponibles ont changé. Vérifiez votre panier avant de valider.",
  price_changed: "Les prix ont été mis à jour. Vérifiez votre panier avant de valider.",
  invalid_payload: "Certaines informations sont invalides. Corrigez le formulaire puis réessayez.",
  storage_unavailable: "Votre navigateur bloque l'enregistrement de la commande.",
  order_not_found: "Cette commande est introuvable.",
  unknown: "La commande n'a pas pu être enregistrée. Veuillez réessayer.",
};

export function getOrderErrorMessage(error: unknown, fallback = ORDER_ERROR_MESSAGES.unknown) {
  if (error instanceof OrderError) return ORDER_ERROR_MESSAGES[error.code];
  return fallback;
}

export function getOrderErrorDetails(error: unknown): OrderErrorDetail[] {
  return error instanceof OrderError ? error.details : [];
}
