import type {
  ProductAvailability,
  ProductCategory,
  ProductOptionDisplay,
  ShippingProfile,
} from "@/domain/product/product.types";

/** Forme persistée : uniquement des références stables, jamais des données dérivées. */
export interface PersistedCartItem {
  productId: string;
  variantId: string;
  quantity: number;
  /** Prix constaté lors de l'ajout, informatif uniquement. */
  priceAtAddMinor: number;
  addedAt: string;
}

export interface PersistedCart {
  version: 1;
  updatedAt: string;
  items: PersistedCartItem[];
}

export type CartItemStatus =
  | "available"
  | "low_stock"
  | "out_of_stock"
  | "variant_missing"
  | "product_missing"
  | "price_changed"
  | "quantity_adjusted";

export interface ResolvedCartItem {
  lineId: string;

  productId: string;
  productSlug: string;
  productName: string;
  productReference: string;

  variantId: string;
  sku: string;

  quantity: number;
  unitPriceMinor: number;
  compareAtPriceMinor?: number;
  lineTotalMinor: number;

  priceAtAddMinor: number;
  priceChanged: boolean;

  imageUrl: string;
  imageAlt: string;

  category?: ProductCategory;
  colorLabel?: string;
  widthCm?: number;
  heightCm?: number;
  curtainHeaderLabel?: string;
  eyeletColorLabel?: string;
  liningLabel?: string;
  /** Options affichables, toutes catégories confondues. */
  selectedOptions?: ProductOptionDisplay[];
  sellingUnitLabel: string;
  /** Profil logistique : conditionne le calcul des frais de livraison. */
  shippingProfile?: ShippingProfile;

  availability: ProductAvailability;
  availableQuantity: number;
  status: CartItemStatus;

  canPurchase: boolean;
}

export interface CartTotals {
  subtotalMinor: number;
  shippingMinor: number;
  totalEstimatedMinor: number;

  freeShippingThresholdMinor: number;
  amountUntilFreeShippingMinor: number;
  hasFreeShipping: boolean;
  /** Un article volumineux est présent : la livraison est chiffrée après la commande. */
  requiresShippingQuote: boolean;
}

export interface Cart {
  items: ResolvedCartItem[];
  itemCount: number;
  lineCount: number;
  totals: CartTotals;

  hasUnavailableItems: boolean;
  hasPriceChanges: boolean;
}
