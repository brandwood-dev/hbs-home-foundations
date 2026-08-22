import type { components, operations } from "@/api/generated/hbs-home-api";
import { HbsApiClient, HbsApiError } from "@/api";
import { getSupabaseBrowserClient } from "@/auth/supabase-browser";
import type {
  AdminOrderRepository,
  AdminOrderListParams,
  AdminOrderCounters,
  PaginatedAdminOrders,
  UpdateAdminOrderStatusInput,
  UpdateAdminPaymentStatusInput,
  UpdateAdminOrderShippingInput,
  CancelAdminOrderInput,
  ReturnAdminOrderInput,
} from "@/admin/repositories/interfaces";
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminOrderAddress,
  AdminOrderContact,
  AdminOrderEvent,
  AdminOrderItemOption,
  AdminOrderNote,
  AdminShippingProfile,
} from "@/admin/types/admin.types";

type ApiOrder = components["schemas"]["AdminOrder"];
type ApiOrderList = components["schemas"]["AdminOrderListResponse"];
type ApiOrderQuery = operations["listAdminOrders"]["parameters"]["query"];
type ApiOrderStatusUpdate =
  operations["updateAdminOrderStatus"]["requestBody"]["content"]["application/json"];
type ApiPaymentUpdate =
  operations["updateAdminOrderPayment"]["requestBody"]["content"]["application/json"];
type ApiShippingUpdate =
  operations["updateAdminOrderShipping"]["requestBody"]["content"]["application/json"];
type ApiNoteBody = operations["addAdminOrderNote"]["requestBody"]["content"]["application/json"];
type ApiCancellationBody =
  operations["cancelAdminOrder"]["requestBody"]["content"]["application/json"];
const API_ORDER_STATUSES = [
  "pending_confirmation",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
type ApiOrderStatus = (typeof API_ORDER_STATUSES)[number];

function isApiOrderStatus(status: AdminOrderStatus): status is ApiOrderStatus {
  return (API_ORDER_STATUSES as readonly string[]).includes(status);
}

async function accessToken(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase Auth n’est pas configuré pour cet environnement.");
  }
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) {
    throw new HbsApiError(401, "Session Admin expirée. Veuillez vous reconnecter.");
  }
  return data.session.access_token;
}

function profile(value: string | null): AdminShippingProfile | undefined {
  if (!value) return undefined;
  return ["standard", "fragile", "bulky", "oversized"].includes(value)
    ? (value as AdminShippingProfile)
    : undefined;
}

function mapItem(item: ApiOrder["items"][number]): AdminOrder["items"][number] {
  const shippingProfile = profile(item.shippingProfile);
  return {
    productId: item.productId,
    variantId: item.variantId,
    productName: item.productName,
    variantLabel: item.variantLabel,
    sku: item.sku,
    quantity: item.quantity,
    unitPriceMinor: item.unitPriceMinor,
    lineTotalMinor: item.lineTotalMinor,
    ...(item.productReference ? { productReference: item.productReference } : {}),
    ...(item.productSlug ? { productSlug: item.productSlug } : {}),
    ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}),
    ...(item.selectedOptions.length
      ? { selectedOptions: item.selectedOptions as AdminOrderItemOption[] }
      : {}),
    ...(item.sellingUnitLabel ? { sellingUnitLabel: item.sellingUnitLabel } : {}),
    ...(shippingProfile ? { shippingProfile } : {}),
  } satisfies AdminOrder["items"][number];
}

function mapEvent(event: ApiOrder["timeline"][number]): AdminOrderEvent {
  return {
    id: event.id,
    at: event.at,
    status: event.status,
    label: event.label,
    kind: event.kind,
    ...(event.reason ? { reason: event.reason } : {}),
  };
}

function mapNote(note: ApiOrder["notes"][number]): AdminOrderNote {
  return {
    id: note.id,
    at: note.at,
    author: note.author,
    body: note.body,
    ...(note.userId ? { userId: note.userId } : {}),
  };
}

function mapOrder(order: ApiOrder): AdminOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    customerId: order.customerId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    ...(order.customerEmail ? { customerEmail: order.customerEmail } : {}),
    deliveryMethod: order.deliveryMethod,
    governorate: order.governorate,
    city: order.city,
    ...(order.postalCode ? { postalCode: order.postalCode } : {}),
    addressLine: order.addressLine,
    ...(order.landmark ? { landmark: order.landmark } : {}),
    ...(order.deliveryNote ? { deliveryNote: order.deliveryNote } : {}),
    items: order.items.map(mapItem),
    subtotalMinor: order.subtotalMinor,
    shippingMinor: order.shippingMinor,
    discountMinor: order.discountMinor,
    totalMinor: order.totalMinor,
    timeline: order.timeline.map(mapEvent),
    notes: order.notes.map(mapNote),
    shipment: {
      shippingStatus: order.shipment.shippingStatus,
      shippingFeeMinor: order.shipment.shippingFeeMinor,
    },
  };
}

function unsupported<T>(): Promise<T> {
  return Promise.reject(
    new Error(
      "Cette action Admin sera activée dans la prochaine sous-phase de synchronisation des commandes.",
    ),
  );
}

export class ApiAdminOrderRepository implements AdminOrderRepository {
  constructor(private readonly client = new HbsApiClient()) {}

  private async request<T>(fn: (token: string) => Promise<T>): Promise<T> {
    return fn(await accessToken());
  }

  async list(
    params: AdminOrderListParams,
    privateSearchQuery?: string,
  ): Promise<PaginatedAdminOrders> {
    const query: ApiOrderQuery = {
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
      ...(params.status?.length ? { status: params.status.join(",") } : {}),
      ...(params.governorates?.length ? { governorate: params.governorates[0] } : {}),
      ...(privateSearchQuery?.trim() ? { q: privateSearchQuery.trim() } : {}),
    };
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) search.set(key, String(value));
    }
    const response = await this.request((token) =>
      this.client.get<ApiOrderList>(`/api/v1/admin/orders?${search.toString()}`, undefined, token),
    );
    return {
      rows: response.items.map(mapOrder),
      total: response.total,
      page: response.page,
      pageSize: response.pageSize,
      pageCount: response.pageCount,
      counters: response.counters satisfies AdminOrderCounters,
      governorates: response.governorates,
    };
  }

  async getById(orderId: string): Promise<AdminOrder | null> {
    try {
      return mapOrder(
        await this.request((token) =>
          this.client.get<ApiOrder>(
            `/api/v1/admin/orders/${encodeURIComponent(orderId)}`,
            undefined,
            token,
          ),
        ),
      );
    } catch (error) {
      if (error instanceof HbsApiError && error.status === 404) return null;
      throw error;
    }
  }

  async updateStatus(input: UpdateAdminOrderStatusInput): Promise<AdminOrder> {
    if (!isApiOrderStatus(input.status)) {
      return unsupported();
    }
    const body: ApiOrderStatusUpdate = {
      status: input.status,
      ...(input.reason ? { reason: input.reason } : {}),
      ...(input.note ? { note: input.note } : {}),
      ...(input.carrierName ? { carrierName: input.carrierName } : {}),
      ...(input.trackingNumber ? { trackingNumber: input.trackingNumber } : {}),
      ...(input.shippedAt ? { shippedAt: input.shippedAt } : {}),
      ...(input.deliveredAt ? { deliveredAt: input.deliveredAt } : {}),
    };
    return mapOrder(
      await this.request((token) =>
        this.client.patch<ApiOrder>(
          `/api/v1/admin/orders/${encodeURIComponent(input.orderId)}/status`,
          body,
          token,
        ),
      ),
    );
  }
  async updatePaymentStatus(input: UpdateAdminPaymentStatusInput): Promise<AdminOrder> {
    const body: ApiPaymentUpdate = {
      paymentStatus: input.paymentStatus,
      ...(input.reason ? { reason: input.reason } : {}),
      ...(input.note ? { note: input.note } : {}),
    };
    return mapOrder(
      await this.request((token) =>
        this.client.patch<ApiOrder>(
          `/api/v1/admin/orders/${encodeURIComponent(input.orderId)}/payment`,
          body,
          token,
        ),
      ),
    );
  }
  async updateShipping(input: UpdateAdminOrderShippingInput): Promise<AdminOrder> {
    const body: ApiShippingUpdate = {
      shippingFeeMinor: input.shippingFeeMinor,
      ...(input.carrierName ? { carrierName: input.carrierName } : {}),
      ...(input.note ? { note: input.note } : {}),
    };
    return mapOrder(
      await this.request((token) =>
        this.client.patch<ApiOrder>(
          `/api/v1/admin/orders/${encodeURIComponent(input.orderId)}/shipping`,
          body,
          token,
        ),
      ),
    );
  }
  updateContact(_orderId: string, _contact: AdminOrderContact): Promise<AdminOrder> {
    return unsupported();
  }
  updateAddress(_orderId: string, _address: AdminOrderAddress): Promise<AdminOrder> {
    return unsupported();
  }
  async addNote(orderId: string, text: string): Promise<AdminOrder> {
    const body: ApiNoteBody = { text };
    return mapOrder(
      await this.request((token) =>
        this.client.post<ApiOrder>(
          `/api/v1/admin/orders/${encodeURIComponent(orderId)}/notes`,
          body,
          token,
        ),
      ),
    );
  }
  async cancelOrder(input: CancelAdminOrderInput): Promise<AdminOrder> {
    const body: ApiCancellationBody = {
      reason: input.reason,
      restoreStock: input.restoreStock,
      ...(input.note ? { note: input.note } : {}),
      ...(input.refundPayment !== undefined ? { refundPayment: input.refundPayment } : {}),
    };
    return mapOrder(
      await this.request((token) =>
        this.client.post<ApiOrder>(
          `/api/v1/admin/orders/${encodeURIComponent(input.orderId)}/cancel`,
          body,
          token,
        ),
      ),
    );
  }
  returnOrder(_input: ReturnAdminOrderInput): Promise<AdminOrder> {
    return unsupported();
  }
}
