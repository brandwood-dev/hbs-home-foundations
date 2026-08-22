import type { components, operations } from "@/api/generated/hbs-home-api";
import { HbsApiClient, HbsApiError } from "@/api";
import { getSupabaseBrowserClient } from "@/auth/supabase-browser";
import type {
  AdminCustomerRepository,
  AdminCustomerListParams,
  AdminCustomerRow,
  AdminCustomerDetail,
  PaginatedAdminCustomers,
  UpdateAdminCustomerInput,
  AdminCustomerAddressInput,
  MergeAdminCustomersInput,
} from "@/admin/repositories/interfaces";
import type {
  AdminCustomer,
  AdminCustomerAddress,
  AdminCustomerNote,
  AdminOrder,
  AdminOrderItemOption,
  AdminShippingProfile,
} from "@/admin/types/admin.types";

type ApiCustomerList =
  operations["listAdminCustomers"]["responses"][200]["content"]["application/json"];
type ApiCustomer = ApiCustomerList["items"][number];
type ApiCustomerDetail =
  operations["getAdminCustomer"]["responses"][200]["content"]["application/json"];
type ApiOrder = components["schemas"]["AdminOrder"];
type ApiCustomerMutation =
  operations["updateAdminCustomer"]["responses"][200]["content"]["application/json"];
type ApiAddressBody =
  operations["addAdminCustomerAddress"]["requestBody"]["content"]["application/json"];
type ApiTagsBody =
  operations["updateAdminCustomerTags"]["requestBody"]["content"]["application/json"];

async function accessToken(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase Auth n’est pas configuré pour cet environnement.");
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token)
    throw new HbsApiError(401, "Session Admin expirée. Veuillez vous reconnecter.");
  return data.session.access_token;
}

function mapAddress(address: ApiCustomer["addresses"][number]): AdminCustomerAddress {
  return {
    id: address.id,
    ...(address.label ? { label: address.label } : {}),
    governorate: address.governorate,
    city: address.city,
    ...(address.postalCode ? { postalCode: address.postalCode } : {}),
    addressLine: address.addressLine,
    ...(address.landmark ? { landmark: address.landmark } : {}),
    ...(address.isDefault !== undefined ? { isDefault: address.isDefault } : {}),
    ...(address.createdAt ? { createdAt: address.createdAt } : {}),
    ...(address.updatedAt ? { updatedAt: address.updatedAt } : {}),
  };
}

function mapNote(note: NonNullable<ApiCustomer["notes"]>[number]): AdminCustomerNote {
  return {
    id: note.id,
    text: note.text,
    createdAt: note.createdAt,
    ...(note.userId ? { userId: note.userId } : {}),
    ...(note.userName ? { userName: note.userName } : {}),
  };
}

function mapCustomer(customer: ApiCustomer | ApiCustomerMutation): AdminCustomer {
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    ...(customer.email ? { email: customer.email } : {}),
    governorate: customer.governorate,
    tags: customer.tags,
    internalNotes: customer.internalNotes,
    addresses: customer.addresses.map(mapAddress),
    createdAt: customer.createdAt,
    ...(customer.notes ? { notes: customer.notes.map(mapNote) } : {}),
    ...(customer.preferredChannel ? { preferredChannel: customer.preferredChannel } : {}),
    ...(customer.mergedIntoCustomerId
      ? { mergedIntoCustomerId: customer.mergedIntoCustomerId }
      : {}),
    ...(customer.mergedAt ? { mergedAt: customer.mergedAt } : {}),
    ...(customer.updatedAt ? { updatedAt: customer.updatedAt } : {}),
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
    items: order.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantLabel: item.variantLabel,
      sku: item.sku,
      quantity: item.quantity,
      unitPriceMinor: item.unitPriceMinor,
      lineTotalMinor: item.lineTotalMinor,
      productReference: item.productReference,
      productSlug: item.productSlug,
      imageUrl: item.imageUrl,
      selectedOptions: item.selectedOptions as AdminOrderItemOption[],
      sellingUnitLabel: item.sellingUnitLabel,
      ...(item.shippingProfile &&
      ["standard", "fragile", "bulky", "oversized"].includes(item.shippingProfile)
        ? { shippingProfile: item.shippingProfile as AdminShippingProfile }
        : {}),
    })),
    subtotalMinor: order.subtotalMinor,
    shippingMinor: order.shippingMinor,
    discountMinor: order.discountMinor,
    totalMinor: order.totalMinor,
    timeline: order.timeline.map((event) => ({
      id: event.id,
      at: event.at,
      status: event.status,
      label: event.label,
      kind: event.kind,
      ...(event.reason ? { reason: event.reason } : {}),
    })),
    notes: order.notes.map((note) => ({
      id: note.id,
      at: note.at,
      author: note.author,
      body: note.body,
      userId: note.userId,
    })),
    ...(order.returnInfo
      ? {
          returnInfo: {
            id: order.returnInfo.id,
            status: order.returnInfo.status,
            requestedAt: order.returnInfo.requestedAt,
            reason: order.returnInfo.reason,
            ...(order.returnInfo.note ? { note: order.returnInfo.note } : {}),
            ...(order.returnInfo.resolvedAt ? { resolvedAt: order.returnInfo.resolvedAt } : {}),
            ...(order.returnInfo.resolution ? { resolution: order.returnInfo.resolution } : {}),
            restocked: order.returnInfo.restocked,
            refundPayment: order.returnInfo.refundPayment,
            ...(order.returnInfo.conditionReason
              ? { conditionReason: order.returnInfo.conditionReason }
              : {}),
          },
        }
      : {}),
    shipment: order.shipment,
  };
}

function mapRow(row: ApiCustomerList["items"][number]): AdminCustomerRow {
  return {
    ...mapCustomer(row),
    metrics: row.metrics,
    hasPotentialDuplicate: row.hasPotentialDuplicate,
  };
}

function addressBody(input: AdminCustomerAddressInput): ApiAddressBody {
  return {
    ...(input.label !== undefined ? { label: input.label || null } : {}),
    governorate: input.governorate,
    city: input.city,
    ...(input.postalCode !== undefined ? { postalCode: input.postalCode || null } : {}),
    addressLine: input.addressLine,
    ...(input.landmark !== undefined ? { landmark: input.landmark || null } : {}),
    ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
  };
}

export class ApiAdminCustomerRepository implements AdminCustomerRepository {
  constructor(private readonly client = new HbsApiClient()) {}

  private async request<T>(fn: (token: string) => Promise<T>): Promise<T> {
    return fn(await accessToken());
  }

  async list(
    params: AdminCustomerListParams,
    privateSearchQuery?: string,
  ): Promise<PaginatedAdminCustomers> {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      sort: params.sort,
    });
    if (params.governorates?.[0]) query.set("governorate", params.governorates[0]);
    if (params.hasOrders !== undefined) query.set("hasOrders", String(params.hasOrders));
    if (params.hasDeliveredOrders !== undefined)
      query.set("hasDeliveredOrders", String(params.hasDeliveredOrders));
    if (params.minSpentMinor !== undefined)
      query.set("minSpentMinor", String(params.minSpentMinor));
    if (params.tags?.length) query.set("tags", params.tags.join(","));
    if (params.lastOrderFrom) query.set("lastOrderFrom", params.lastOrderFrom);
    if (params.lastOrderTo) query.set("lastOrderTo", params.lastOrderTo);
    if (params.onlyPotentialDuplicates !== undefined)
      query.set("onlyPotentialDuplicates", String(params.onlyPotentialDuplicates));
    if (privateSearchQuery?.trim()) query.set("q", privateSearchQuery.trim());
    const response = await this.request((token) =>
      this.client.get<ApiCustomerList>(`/api/v1/admin/customers?${query}`, undefined, token),
    );
    return {
      rows: response.items.map(mapRow),
      total: response.total,
      page: response.page,
      pageSize: response.pageSize,
      pageCount: response.pageCount,
      governorates: response.governorates,
      tags: response.tags,
    };
  }

  async getById(customerId: string): Promise<AdminCustomerDetail | null> {
    try {
      const response = await this.request((token) =>
        this.client.get<ApiCustomerDetail>(
          `/api/v1/admin/customers/${encodeURIComponent(customerId)}`,
          undefined,
          token,
        ),
      );
      const customer = mapCustomer(response);
      return {
        ...customer,
        metrics: response.metrics,
        hasPotentialDuplicate: response.hasPotentialDuplicate,
        orders: (response.orders as unknown as ApiOrder[]).map(mapOrder),
        duplicates: response.duplicates.map(mapCustomer),
      };
    } catch (error) {
      if (error instanceof HbsApiError && error.status === 404) return null;
      throw error;
    }
  }

  async update(customerId: string, input: UpdateAdminCustomerInput): Promise<AdminCustomer> {
    const body = { ...input, ...(input.email !== undefined ? { email: input.email || null } : {}) };
    return mapCustomer(
      await this.request((token) =>
        this.client.patch<ApiCustomerMutation>(
          `/api/v1/admin/customers/${encodeURIComponent(customerId)}`,
          body,
          token,
        ),
      ),
    );
  }

  async addAddress(customerId: string, address: AdminCustomerAddressInput): Promise<AdminCustomer> {
    return mapCustomer(
      await this.request((token) =>
        this.client.post<ApiCustomerMutation>(
          `/api/v1/admin/customers/${encodeURIComponent(customerId)}/addresses`,
          addressBody(address),
          token,
        ),
      ),
    );
  }

  async updateAddress(
    customerId: string,
    addressId: string,
    input: AdminCustomerAddressInput,
  ): Promise<AdminCustomer> {
    return mapCustomer(
      await this.request((token) =>
        this.client.patch<ApiCustomerMutation>(
          `/api/v1/admin/customers/${encodeURIComponent(customerId)}/addresses/${encodeURIComponent(addressId)}`,
          addressBody(input),
          token,
        ),
      ),
    );
  }

  async deleteAddress(customerId: string, addressId: string): Promise<AdminCustomer> {
    return mapCustomer(
      await this.request((token) =>
        this.client.delete<ApiCustomerMutation>(
          `/api/v1/admin/customers/${encodeURIComponent(customerId)}/addresses/${encodeURIComponent(addressId)}`,
          undefined,
          token,
        ),
      ),
    );
  }

  async setDefaultAddress(customerId: string, addressId: string): Promise<AdminCustomer> {
    return mapCustomer(
      await this.request((token) =>
        this.client.post<ApiCustomerMutation>(
          `/api/v1/admin/customers/${encodeURIComponent(customerId)}/addresses/${encodeURIComponent(addressId)}/default`,
          {},
          token,
        ),
      ),
    );
  }

  async updateTags(customerId: string, tags: string[]): Promise<AdminCustomer> {
    const body: ApiTagsBody = { tags };
    return mapCustomer(
      await this.request((token) =>
        this.client.patch<ApiCustomerMutation>(
          `/api/v1/admin/customers/${encodeURIComponent(customerId)}/tags`,
          body,
          token,
        ),
      ),
    );
  }

  async addNote(customerId: string, text: string): Promise<AdminCustomer> {
    return mapCustomer(
      await this.request((token) =>
        this.client.post<ApiCustomerMutation>(
          `/api/v1/admin/customers/${encodeURIComponent(customerId)}/notes`,
          { text },
          token,
        ),
      ),
    );
  }

  async findPotentialDuplicates(customerId: string): Promise<AdminCustomer[]> {
    const response = await this.request((token) =>
      this.client.get<ApiCustomer[]>(
        `/api/v1/admin/customers/${encodeURIComponent(customerId)}/duplicates`,
        undefined,
        token,
      ),
    );
    return response.map(mapCustomer);
  }

  async mergeCustomers(input: MergeAdminCustomersInput): Promise<AdminCustomer> {
    return mapCustomer(
      await this.request((token) =>
        this.client.post<ApiCustomerDetail>("/api/v1/admin/customers/merge", input, token),
      ),
    );
  }
}
