import type { components } from "@/api/generated/hbs-home-api";
import { HbsApiClient, HbsApiError } from "@/api/client";
import type { ProductCategory, ShippingProfile } from "@/domain/product/product.types";
import type { OrderTrackingResult } from "@/domain/order/order-tracking.types";
import type { Order, OrderItemSnapshot } from "@/domain/order/order.types";
import { OrderError, type OrderErrorCode } from "@/domain/order/order.errors";
import type {
  CreateOrderInput,
  OrderRepository,
  TrackOrderInput,
} from "@/repositories/interfaces/OrderRepository";

type ApiOrder = components["schemas"]["Order"];
type ApiTracking = components["schemas"]["OrderTracking"];

const LAST_ORDER_STORAGE_KEY = "hbs-home-last-order-v1";

function category(value: string): ProductCategory {
  const values: readonly ProductCategory[] = [
    "rideaux",
    "voilages",
    "stores",
    "coussins",
    "galettes_de_chaise",
    "accessoires",
    "mobilier_interieur",
    "plantes_decoration",
  ];
  return values.includes(value as ProductCategory) ? (value as ProductCategory) : "accessoires";
}

function shippingProfile(value: string | undefined): ShippingProfile | undefined {
  return value === "standard" ||
    value === "fragile" ||
    value === "volumineux" ||
    value === "hors_norme"
    ? value
    : undefined;
}

function mapItem(item: ApiOrder["items"][number]): OrderItemSnapshot {
  const profile = shippingProfile(item.shippingProfile);
  return {
    productId: item.productId,
    variantId: item.variantId,
    productSlug: item.productSlug,
    productName: item.productName,
    productReference: item.productReference,
    sku: item.sku,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    category: category(item.category),
    ...(item.colorLabel ? { colorLabel: item.colorLabel } : {}),
    ...(item.widthCm !== undefined ? { widthCm: item.widthCm } : {}),
    ...(item.heightCm !== undefined ? { heightCm: item.heightCm } : {}),
    ...(item.curtainHeaderLabel ? { curtainHeaderLabel: item.curtainHeaderLabel } : {}),
    ...(item.eyeletColorLabel ? { eyeletColorLabel: item.eyeletColorLabel } : {}),
    ...(item.liningLabel ? { liningLabel: item.liningLabel } : {}),
    ...(item.selectedOptions.length > 0 ? { selectedOptions: item.selectedOptions } : {}),
    sellingUnitLabel: item.sellingUnitLabel,
    ...(profile ? { shippingProfile: profile } : {}),
    quantity: item.quantity,
    unitPriceMinor: item.unitPriceMinor,
    lineTotalMinor: item.lineTotalMinor,
  };
}

function mapOrder(response: ApiOrder): Order {
  return {
    id: response.id,
    orderNumber: response.orderNumber,
    status: response.status,
    customer: response.customer,
    deliveryMethod: response.deliveryMethod,
    ...(response.shippingAddress ? { shippingAddress: response.shippingAddress } : {}),
    paymentMethod: response.paymentMethod,
    items: response.items.map(mapItem),
    totals: response.totals,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    idempotencyKey: response.idempotencyKey,
    isDemo: response.isDemo,
  };
}

function mapTracking(response: ApiTracking): OrderTrackingResult {
  return {
    orderNumber: response.orderNumber,
    status: response.status,
    statusLabel: response.statusLabel,
    statusDescription: response.statusDescription,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    ...(response.customerFirstName ? { customerFirstName: response.customerFirstName } : {}),
    maskedPhone: response.maskedPhone,
    deliveryMethod: response.deliveryMethod,
    ...(response.deliveryLocation ? { deliveryLocation: response.deliveryLocation } : {}),
    items: response.items.map(mapItem),
    totals: response.totals,
    timeline: response.timeline,
    nextStepTitle: response.nextStepTitle,
    nextStepDescription: response.nextStepDescription,
    isDemo: response.isDemo,
  };
}

function storage(): Storage | null {
  return typeof globalThis.sessionStorage === "undefined" ? null : globalThis.sessionStorage;
}

function mapApiError(error: unknown): Error {
  if (!(error instanceof HbsApiError))
    return error instanceof Error ? error : new Error("Order request failed.");
  const codeMap: Record<string, OrderErrorCode> = {
    EMPTY_CART: "empty_cart",
    CART_REQUIRED: "empty_cart",
    CART_EXPIRED: "invalid_payload",
    CART_CHANGED: "invalid_payload",
    PRICE_CHANGED: "price_changed",
    ITEM_UNAVAILABLE: "item_unavailable",
    INSUFFICIENT_STOCK: "item_unavailable",
    INVALID_ORDER: "invalid_payload",
    INVALID_ORDER_ITEMS: "invalid_payload",
    PROMOTION_CHANGED: "invalid_payload",
  };
  const code = error.problem?.code ? codeMap[error.problem.code] : undefined;
  return code ? new OrderError(code, error.message) : error;
}

export class ApiOrderRepository implements OrderRepository {
  constructor(private readonly apiClient: HbsApiClient = new HbsApiClient()) {}

  async createOrder(input: CreateOrderInput): Promise<Order> {
    try {
      const response = await this.apiClient.post<ApiOrder>(
        "/api/v1/orders",
        {
          customer: input.customer,
          deliveryMethod: input.deliveryMethod,
          ...(input.shippingAddress ? { shippingAddress: input.shippingAddress } : {}),
          paymentMethod: input.paymentMethod,
          items: input.items,
        },
        undefined,
        undefined,
        { "idempotency-key": input.idempotencyKey },
      );
      const order = mapOrder(response);
      storage()?.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order));
      return order;
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const stored = storage()?.getItem(LAST_ORDER_STORAGE_KEY);
    if (!stored) return null;
    try {
      const order = JSON.parse(stored) as Order;
      return order.orderNumber === orderNumber ? order : null;
    } catch {
      storage()?.removeItem(LAST_ORDER_STORAGE_KEY);
      return null;
    }
  }

  async getLastOrder(): Promise<Order | null> {
    const stored = storage()?.getItem(LAST_ORDER_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as Order;
    } catch {
      storage()?.removeItem(LAST_ORDER_STORAGE_KEY);
      return null;
    }
  }

  async trackOrder(input: TrackOrderInput): Promise<OrderTrackingResult | null> {
    try {
      const result = await this.apiClient.post<ApiTracking>("/api/v1/orders/track", input);
      return mapTracking(result);
    } catch (error) {
      if (error instanceof HbsApiError && error.status === 404) return null;
      throw mapApiError(error);
    }
  }
}
