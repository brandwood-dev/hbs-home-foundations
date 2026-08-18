import type {
  CheckoutAddress,
  CheckoutCustomer,
  DeliveryMethod,
  PaymentMethod,
} from "@/domain/checkout/checkout.types";
import type { ProductCategory, ProductOptionDisplay } from "@/domain/product/product.types";

export type OrderStatus =
  "pending_confirmation" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled";

/** Snapshot figé : la commande ne dépend jamais du catalogue vivant. */
export interface OrderItemSnapshot {
  productId: string;
  variantId: string;

  productSlug: string;
  productName: string;
  productReference: string;

  sku: string;

  imageUrl: string;
  imageAlt: string;

  quantity: number;

  unitPriceMinor: number;
  lineTotalMinor: number;

  category?: ProductCategory;
  colorLabel?: string;
  widthCm?: number;
  heightCm?: number;
  curtainHeaderLabel?: string;
  eyeletColorLabel?: string;
  liningLabel?: string;
  /** Options affichables figées au moment de la commande. */
  selectedOptions?: ProductOptionDisplay[];
  sellingUnitLabel: string;
}

export interface OrderTotals {
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
}

export interface Order {
  id: string;
  orderNumber: string;

  status: OrderStatus;

  customer: CheckoutCustomer;

  deliveryMethod: DeliveryMethod;
  shippingAddress?: CheckoutAddress;

  paymentMethod: PaymentMethod;

  items: OrderItemSnapshot[];
  totals: OrderTotals;

  createdAt: string;
  /** Renseigné lorsque le statut a évolué (commandes de démonstration). */
  updatedAt?: string;
  idempotencyKey: string;

  /** Commande créée par le MockOrderRepository (phase de démonstration). */
  isDemo: true;
}
