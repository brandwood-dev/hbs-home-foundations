import type { CartItemStatus } from "@/domain/cart/cart.types";

export const CART_STORAGE_KEY = "hbs-home-cart";
export const CART_STORAGE_VERSION = 1 as const;

export const MAX_CART_LINE_QUANTITY = 99;
export const MIN_CART_LINE_QUANTITY = 1;

/** Message utilisateur associé à l'état d'une ligne (null = rien à signaler). */
export const CART_STATUS_MESSAGES: Record<CartItemStatus, string | null> = {
  available: null,
  low_stock: "Stock limité pour cette variante.",
  out_of_stock: "Cette variante est actuellement indisponible.",
  variant_missing: "Cette variante n'est plus proposée.",
  product_missing: "Ce produit n'est plus disponible.",
  price_changed: "Le prix de cet article a été mis à jour.",
  quantity_adjusted: "La quantité a été ajustée selon le stock disponible.",
};

export const CART_EMPTY_TITLE = "Votre intérieur n'attend plus que vous.";
export const CART_EMPTY_TEXT =
  "Découvrez nos rideaux, voilages et accessoires pour composer votre intérieur.";
export const CART_ESTIMATE_NOTICE =
  "Le prix, la disponibilité et les frais seront vérifiés lors de la commande.";
