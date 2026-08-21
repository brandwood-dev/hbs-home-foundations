export type CartErrorCode =
  | "storage_unavailable"
  | "storage_write_failed"
  | "product_not_found"
  | "variant_not_found"
  | "variant_unavailable"
  | "promotion_unavailable"
  | "invalid_quantity"
  | "line_not_found";

export class CartError extends Error {
  readonly code: CartErrorCode;

  constructor(code: CartErrorCode, message: string) {
    super(message);
    this.name = "CartError";
    this.code = code;
  }
}

export const CART_ERROR_MESSAGES: Record<CartErrorCode, string> = {
  storage_unavailable:
    "Votre navigateur bloque l'enregistrement du panier. Activez le stockage local pour conserver vos articles.",
  storage_write_failed: "Impossible d'enregistrer votre panier. Veuillez réessayer.",
  product_not_found: "Ce produit n'est plus disponible.",
  variant_not_found: "Cette variante n'est plus proposée.",
  variant_unavailable: "Cette variante est actuellement indisponible.",
  promotion_unavailable:
    "Les codes promotionnels sont disponibles lorsque le panier serveur est activé.",
  invalid_quantity: "La quantité demandée n'est pas valide.",
  line_not_found: "Cet article n'est plus dans votre panier.",
};

export function getCartErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof CartError) return CART_ERROR_MESSAGES[error.code];
  return fallback;
}
