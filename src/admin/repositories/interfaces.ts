import type {
  AdminAttribute,
  AdminAuditLog,
  AdminCategory,
  AdminContent,
  AdminCustomer,
  AdminCustomerAddress,
  AdminMockDatabase,
  AdminOrder,
  AdminOrderAddress,
  AdminOrderContact,
  AdminOrderStatus,
  AdminPaymentStatus,
  AdminProduct,
  AdminPromotion,
  AdminSettings,
  AdminShippingProfile,
  AdminShippingStatus,
  AdminUser,
  AdminVariant,
  StockMovement,
  StockMovementReason,
} from "@/admin/types/admin.types";
import type { AdminCustomerMetrics } from "@/admin/services/customers/admin-customer-metrics";

/** Contrat CRUD générique — implémenté par les mocks aujourd'hui, l'API demain. */
export interface CrudRepository<T, CreateInput, UpdateInput> {
  list(params?: Record<string, unknown>): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(input: CreateInput): Promise<T>;
  update(id: string, input: UpdateInput): Promise<T>;
  delete(id: string): Promise<void>;
}

export type AdminProductInput = Omit<AdminProduct, "id" | "createdAt" | "updatedAt">;

export interface AdminProductRepository extends CrudRepository<
  AdminProduct,
  AdminProductInput,
  Partial<AdminProductInput>
> {
  duplicate(id: string): Promise<AdminProduct>;
  setStatus(id: string, status: AdminProduct["status"]): Promise<AdminProduct>;
  /** Un produit référencé par une commande ne peut plus être supprimé. */
  isUsedInOrders(id: string): Promise<boolean>;
}

export type AdminCategoryInput = Omit<AdminCategory, "id">;
export interface AdminCategoryRepository extends CrudRepository<
  AdminCategory,
  AdminCategoryInput,
  Partial<AdminCategoryInput>
> {
  move(id: string, direction: "up" | "down"): Promise<void>;
}

export type AdminAttributeInput = Omit<AdminAttribute, "id">;
export type AdminAttributeRepository = CrudRepository<
  AdminAttribute,
  AdminAttributeInput,
  Partial<AdminAttributeInput>
>;

export interface InventoryRow {
  productId: string;
  productName: string;
  categoryId: string;
  variant: AdminVariant;
  updatedAt: string;
}

export interface StockAdjustmentInput {
  productId: string;
  variantId: string;
  type: StockMovement["type"];
  quantity: number;
  reason: StockMovementReason;
  note?: string;
  lowStockThreshold?: number;
  availability?: AdminVariant["availability"];
}

export interface StockSettingsInput {
  productId: string;
  variantId: string;
  lowStockThreshold: number;
  availability?: AdminVariant["availability"];
}

export interface AdminInventoryRepository {
  list(): Promise<InventoryRow[]>;
  adjust(input: StockAdjustmentInput): Promise<InventoryRow>;
  updateSettings(input: StockSettingsInput): Promise<InventoryRow>;
  movements(variantId?: string): Promise<StockMovement[]>;
}

export type AdminOrderSort = "newest" | "oldest" | "total_desc" | "total_asc" | "status";

export interface AdminOrderListParams {
  page: number;
  pageSize: number;
  status?: AdminOrderStatus[];
  paymentStatus?: AdminPaymentStatus[];
  shippingStatus?: AdminShippingStatus[];
  shippingProfiles?: AdminShippingProfile[];
  deliveryMethod?: Array<"home_delivery" | "store_pickup">;
  governorates?: string[];
  dateFrom?: string;
  dateTo?: string;
  sort: AdminOrderSort;
}

export interface AdminOrderCounters {
  total: number;
  pendingConfirmation: number;
  confirmed: number;
  preparing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  shippingToConfirm: number;
  paymentPending: number;
}

export interface PaginatedAdminOrders {
  rows: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  counters: AdminOrderCounters;
  governorates: string[];
}

export interface UpdateAdminOrderStatusInput {
  orderId: string;
  status: AdminOrderStatus;
  reason?: string;
  note?: string;
  /** Expédition / livraison : renseignés par les dialogs dédiés. */
  carrierName?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  paymentCollected?: boolean;
}

export interface UpdateAdminPaymentStatusInput {
  orderId: string;
  paymentStatus: AdminPaymentStatus;
  reason?: string;
  note?: string;
}

export interface UpdateAdminOrderShippingInput {
  orderId: string;
  shippingFeeMinor: number;
  shippingProfile?: AdminShippingProfile;
  carrierName?: string;
  note?: string;
}

export interface CancelAdminOrderInput {
  orderId: string;
  reason: string;
  note?: string;
  restoreStock: boolean;
  refundPayment?: boolean;
}

export interface ReturnAdminOrderInput {
  orderId: string;
  reason: string;
  note?: string;
  /** "request" ouvre le retour, les autres le clôturent. */
  action: "request" | "accept" | "refuse";
  restock?: boolean;
  conditionReason?: string;
  refundPayment?: boolean;
}

export interface AdminOrderRepository {
  list(params: AdminOrderListParams, privateSearchQuery?: string): Promise<PaginatedAdminOrders>;
  getById(orderId: string): Promise<AdminOrder | null>;
  updateStatus(input: UpdateAdminOrderStatusInput): Promise<AdminOrder>;
  updatePaymentStatus(input: UpdateAdminPaymentStatusInput): Promise<AdminOrder>;
  updateShipping(input: UpdateAdminOrderShippingInput): Promise<AdminOrder>;
  updateContact(orderId: string, contact: AdminOrderContact): Promise<AdminOrder>;
  updateAddress(orderId: string, address: AdminOrderAddress): Promise<AdminOrder>;
  addNote(orderId: string, text: string): Promise<AdminOrder>;
  cancelOrder(input: CancelAdminOrderInput): Promise<AdminOrder>;
  returnOrder(input: ReturnAdminOrderInput): Promise<AdminOrder>;
}

export type AdminCustomerSort =
  "last_order" | "name_asc" | "spent_desc" | "orders_desc" | "aov_desc";

export interface AdminCustomerListParams {
  page: number;
  pageSize: number;
  governorates?: string[];
  hasOrders?: boolean;
  hasDeliveredOrders?: boolean;
  minSpentMinor?: number;
  tags?: string[];
  lastOrderFrom?: string;
  lastOrderTo?: string;
  onlyPotentialDuplicates?: boolean;
  sort: AdminCustomerSort;
}

export type AdminCustomerRow = AdminCustomer & {
  metrics: AdminCustomerMetrics;
  hasPotentialDuplicate: boolean;
};

export interface PaginatedAdminCustomers {
  rows: AdminCustomerRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  governorates: string[];
  tags: string[];
}

export interface UpdateAdminCustomerInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  governorate?: string;
  preferredChannel?: AdminCustomer["preferredChannel"];
}

export type AdminCustomerAddressInput = Omit<
  AdminCustomerAddress,
  "id" | "createdAt" | "updatedAt"
>;

export interface MergeAdminCustomersInput {
  primaryCustomerId: string;
  secondaryCustomerId: string;
  keepPhoneFrom?: "primary" | "secondary";
  keepEmailFrom?: "primary" | "secondary";
}

export interface AdminCustomerDetail extends AdminCustomerRow {
  orders: AdminOrder[];
  duplicates: AdminCustomer[];
}

export interface AdminCustomerRepository {
  list(
    params: AdminCustomerListParams,
    privateSearchQuery?: string,
  ): Promise<PaginatedAdminCustomers>;
  getById(customerId: string): Promise<AdminCustomerDetail | null>;
  update(customerId: string, input: UpdateAdminCustomerInput): Promise<AdminCustomer>;
  addAddress(customerId: string, address: AdminCustomerAddressInput): Promise<AdminCustomer>;
  updateAddress(
    customerId: string,
    addressId: string,
    input: AdminCustomerAddressInput,
  ): Promise<AdminCustomer>;
  deleteAddress(customerId: string, addressId: string): Promise<AdminCustomer>;
  setDefaultAddress(customerId: string, addressId: string): Promise<AdminCustomer>;
  updateTags(customerId: string, tags: string[]): Promise<AdminCustomer>;
  addNote(customerId: string, text: string): Promise<AdminCustomer>;
  findPotentialDuplicates(customerId: string): Promise<AdminCustomer[]>;
  mergeCustomers(input: MergeAdminCustomersInput): Promise<AdminCustomer>;
}

export type AdminPromotionInput = Omit<AdminPromotion, "id" | "usageCount">;
export type AdminPromotionRepository = CrudRepository<
  AdminPromotion,
  AdminPromotionInput,
  Partial<AdminPromotionInput>
>;

export interface AdminContentRepository {
  get(): Promise<AdminContent>;
  update(input: Partial<AdminContent>): Promise<AdminContent>;
}

export interface AdminSettingsRepository {
  get(): Promise<AdminSettings>;
  update(input: Partial<AdminSettings>): Promise<AdminSettings>;
  reset(): Promise<void>;
  exportJson(): Promise<string>;
  importJson(json: string): Promise<void>;
  snapshot(): Promise<AdminMockDatabase>;
}

export type AdminUserInput = Omit<AdminUser, "id" | "createdAt">;
export type AdminUserRepository = CrudRepository<
  AdminUser,
  AdminUserInput,
  Partial<AdminUserInput>
>;

export interface AdminAuditRepository {
  list(): Promise<AdminAuditLog[]>;
}

export interface DashboardMetrics {
  revenueMinor: number;
  deliveredCount: number;
  averageOrderValueMinor: number;
  totalOrders: number;
  pendingConfirmationCount: number;
  preparingCount: number;
  shippedCount: number;
  cancelledCount: number;
  lowStockCount: number;
  statusBreakdown: Array<{ status: AdminOrderStatus; count: number }>;
  recentOrders: AdminOrder[];
  topProducts: Array<{ productId: string; name: string; quantity: number; revenueMinor: number }>;
  lowStockRows: InventoryRow[];
  salesByDay: Array<{ date: string; revenueMinor: number }>;
}

export interface AdminDashboardRepository {
  metrics(): Promise<DashboardMetrics>;
}
