import type {
  CheckoutAddress,
  CheckoutCustomer,
  DeliveryMethod,
  PaymentMethod,
} from "@/domain/checkout/checkout.types";
import type { Order } from "@/domain/order/order.types";
import type { OrderTrackingResult } from "@/domain/order/order-tracking.types";

export interface CreateOrderItemInput {
  productId: string;
  variantId: string;
  quantity: number;
  /** Prix unitaire affiché au client — sert uniquement au contrôle de cohérence. */
  expectedUnitPriceMinor: number;
}

export interface CreateOrderInput {
  idempotencyKey: string;
  customer: CheckoutCustomer;
  deliveryMethod: DeliveryMethod;
  shippingAddress?: CheckoutAddress;
  paymentMethod: PaymentMethod;
  items: CreateOrderItemInput[];
}

/**
 * Contrat unique des commandes. Le futur ApiOrderRepository devra l'implémenter
 * à l'identique : l'interface utilisateur restera inchangée.
 */
export interface OrderRepository {
  createOrder(input: CreateOrderInput): Promise<Order>;
  getOrderByNumber(orderNumber: string): Promise<Order | null>;
  getLastOrder(): Promise<Order | null>;
  /** Suivi sans compte : retourne null lorsque le couple numéro + téléphone ne correspond pas. */
  trackOrder(input: TrackOrderInput): Promise<OrderTrackingResult | null>;
}

export interface TrackOrderInput {
  orderNumber: string;
  phone: string;
}
