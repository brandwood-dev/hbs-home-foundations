import { OrderError, type OrderErrorDetail } from "@/domain/order/order.errors";
import type { Order, OrderItemSnapshot } from "@/domain/order/order.types";
import type { PersistedCartItem } from "@/domain/cart/cart.types";
import type { Product } from "@/domain/product/product.types";
import type {
  CreateOrderInput,
  OrderRepository,
  TrackOrderInput,
} from "@/repositories/interfaces/OrderRepository";
import type { ProductRepository } from "@/repositories/interfaces/ProductRepository";
import {
  appendSessionOrder,
  readSessionOrders,
} from "@/repositories/mock/mock-order-session-storage";
import { DEMO_TRACKING_ORDERS } from "@/fixtures/order-tracking.fixture";
import type { OrderTrackingResult } from "@/domain/order/order-tracking.types";
import { normalizeOrderNumber } from "@/services/order/order-number";
import { phoneMatchesOrder, toOrderTrackingResult } from "@/services/order/order-tracking";
import { resolveCartItem } from "@/services/cart/cart-reconciliation";
import { calculateOrderTotals } from "@/services/checkout/checkout-calculations";
import { toOrderItemSnapshot } from "@/services/checkout/checkout-mappers";
import { generateOrderId, generateOrderNumber } from "@/services/order/order-number";

const NETWORK_DELAY_MS = 700;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Implémentation de démonstration : aucune requête réseau, aucune donnée envoyée.
 * Les prix et disponibilités sont systématiquement revalidés depuis le catalogue.
 */
export class MockOrderRepository implements OrderRepository {
  constructor(private readonly products: ProductRepository) {}

  private async productsById(ids: string[]): Promise<Map<string, Product>> {
    const found = await this.products.getByIds([...new Set(ids)]);
    return new Map(found.map((product) => [product.id, product]));
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    if (input.items.length === 0) {
      throw new OrderError("empty_cart", "Panier vide");
    }

    const existing = readSessionOrders().find(
      (order) => order.idempotencyKey === input.idempotencyKey,
    );
    if (existing) return existing;

    await delay(NETWORK_DELAY_MS);

    const map = await this.productsById(input.items.map((item) => item.productId));

    const unavailable: OrderErrorDetail[] = [];
    const adjusted: OrderErrorDetail[] = [];
    const repriced: OrderErrorDetail[] = [];
    const snapshots: OrderItemSnapshot[] = [];

    for (const item of input.items) {
      const persisted: PersistedCartItem = {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtAddMinor: item.expectedUnitPriceMinor,
        addedAt: new Date().toISOString(),
      };
      const resolved = resolveCartItem(persisted, map.get(item.productId) ?? null);

      if (!resolved.canPurchase) {
        unavailable.push({
          lineId: resolved.lineId,
          productName: resolved.productName,
          message: `${resolved.productName} n'est plus disponible.`,
        });
        continue;
      }
      if (resolved.quantity !== item.quantity) {
        adjusted.push({
          lineId: resolved.lineId,
          productName: resolved.productName,
          message: `${resolved.productName} : quantité limitée à ${resolved.quantity}.`,
        });
        continue;
      }
      if (resolved.unitPriceMinor !== item.expectedUnitPriceMinor) {
        repriced.push({
          lineId: resolved.lineId,
          productName: resolved.productName,
          message: `${resolved.productName} : le prix a changé.`,
        });
        continue;
      }

      snapshots.push(toOrderItemSnapshot(resolved));
    }

    if (unavailable.length > 0) {
      throw new OrderError("item_unavailable", "Articles indisponibles", unavailable);
    }
    if (adjusted.length > 0) {
      throw new OrderError("quantity_adjusted", "Quantités ajustées", adjusted);
    }
    if (repriced.length > 0) {
      throw new OrderError("price_changed", "Prix modifiés", repriced);
    }

    const order: Order = {
      id: generateOrderId(),
      orderNumber: generateOrderNumber(),
      status: "pending_confirmation",
      customer: input.customer,
      deliveryMethod: input.deliveryMethod,
      ...(input.shippingAddress ? { shippingAddress: input.shippingAddress } : {}),
      paymentMethod: input.paymentMethod,
      items: snapshots,
      totals: calculateOrderTotals(snapshots, input.deliveryMethod),
      createdAt: new Date().toISOString(),
      idempotencyKey: input.idempotencyKey,
      isDemo: true,
    };

    appendSessionOrder(order);
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const normalized = normalizeOrderNumber(orderNumber);
    const search = [...readSessionOrders(), ...DEMO_TRACKING_ORDERS];
    return search.find((order) => normalizeOrderNumber(order.orderNumber) === normalized) ?? null;
  }

  /** Session d'abord, puis commandes de démonstration. Résultat unique et générique. */
  async trackOrder(input: TrackOrderInput): Promise<OrderTrackingResult | null> {
    await delay(400);
    const order = await this.getOrderByNumber(input.orderNumber);
    if (!order) return null;
    if (!phoneMatchesOrder(order, input.phone)) return null;
    return toOrderTrackingResult(order);
  }

  async getLastOrder(): Promise<Order | null> {
    const orders = readSessionOrders();
    return orders[orders.length - 1] ?? null;
  }
}
