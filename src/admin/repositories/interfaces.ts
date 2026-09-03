import type {
  AdminAttribute,
  AdminAuditLog,
  AdminCategory,
  AdminContent,
  AdminCustomer,
  AdminCustomerAddress,
  AdminEditorialPage,
  AdminArticle,
  AdminMockDatabase,
  AdminMedia,
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

export interface AdminPageParams {
  page: number;
  pageSize: number;
}

export interface PaginatedAdminItems<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export type AdminProductInput = Omit<AdminProduct, "id" | "createdAt" | "updatedAt">;

export interface AdminProductRepository extends CrudRepository<
  AdminProduct,
  AdminProductInput,
  Partial<AdminProductInput>
> {
  listPage?(params: AdminProductListParams): Promise<PaginatedAdminItems<AdminProduct>>;
  duplicate(id: string): Promise<AdminProduct>;
  setStatus(id: string, status: AdminProduct["status"]): Promise<AdminProduct>;
  /** Un produit référencé par une commande ne peut plus être supprimé. */
  isUsedInOrders(id: string): Promise<boolean>;
}

export interface AdminProductListParams extends AdminPageParams {
  query?: string;
  status?: AdminProduct["status"];
  category?: string;
  stock?: "low" | "out";
}

export type AdminCategoryInput = Omit<AdminCategory, "id">;
export interface AdminCategoryImageUpload {
  mediaAssetId: string;
  storagePath: string;
  publicUrl: string;
  mimeType: "image/webp";
  width: number;
  height: number;
}
export interface AdminCategoryRepository extends CrudRepository<
  AdminCategory,
  AdminCategoryInput,
  Partial<AdminCategoryInput>
> {
  uploadImage(file: File, name: string, alt: string): Promise<AdminCategoryImageUpload>;
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

export type AdminHomeSectionKey = "hero" | "promo_banner" | "shop_the_look";

export interface AdminHomeMediaReference {
  id: string;
  publicUrl: string;
  alt: string;
}

export interface AdminHomeHotspot {
  id: string;
  productId: string;
  xPercent: number;
  yPercent: number;
  label: string | null;
  sortOrder: number;
  product: { id: string; slug: string; name: string } | null;
}

export interface AdminHomeSection {
  id: string;
  sectionKey: AdminHomeSectionKey;
  sortOrder: number;
  isEnabled: boolean;
  payload: Record<string, unknown>;
  media: AdminHomeMediaReference | null;
  mobileMedia: AdminHomeMediaReference | null;
  hotspots: AdminHomeHotspot[];
}

export interface AdminHomeRevision {
  id: string;
  status: "draft" | "published" | "archived";
  version: number;
  publishedAt: string | null;
  updatedAt: string;
  sections: AdminHomeSection[];
}

export interface AdminHomeContent {
  draft: AdminHomeRevision | null;
  published: AdminHomeRevision | null;
}

export interface AdminHomeHotspotInput {
  productId: string;
  xPercent: number;
  yPercent: number;
  label?: string | null;
  sortOrder: number;
}

export interface AdminHomeSectionInput {
  sectionKey: AdminHomeSectionKey;
  sortOrder: number;
  isEnabled?: boolean;
  payload?: Record<string, unknown>;
  mediaAssetId?: string | null;
  mobileMediaAssetId?: string | null;
  hotspots?: AdminHomeHotspotInput[];
}

export interface AdminHomeDraftInput {
  sections: AdminHomeSectionInput[];
  expectedVersion?: number;
}

export interface AdminHomeContentRepository {
  get(sectionKey?: AdminHomeSectionKey): Promise<AdminHomeContent>;
  update(input: AdminHomeDraftInput): Promise<AdminHomeRevision>;
  updateSection(
    sectionKey: AdminHomeSectionKey,
    input: AdminHomeSectionInput & { expectedVersion?: number },
  ): Promise<AdminHomeRevision>;
  publish(): Promise<AdminHomeRevision>;
  publishSection(sectionKey: AdminHomeSectionKey): Promise<AdminHomeRevision>;
  archive(): Promise<AdminHomeRevision>;
  archiveSection(sectionKey: AdminHomeSectionKey): Promise<AdminHomeRevision>;
}

export interface AdminEditorialPageInput {
  slug: string;
  title: string;
  body?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  blocks?: Array<{
    sortOrder: number;
    blockType: string;
    payload: Record<string, unknown>;
    mediaAssetId?: string | null;
  }>;
}

export type AdminEditorialPagePatch = Partial<AdminEditorialPageInput> & {
  expectedVersion?: number;
};

export interface AdminEditorialPageRepository {
  list(): Promise<AdminEditorialPage[]>;
  get(id: string): Promise<AdminEditorialPage | null>;
  create(input: AdminEditorialPageInput): Promise<AdminEditorialPage>;
  update(id: string, input: AdminEditorialPagePatch): Promise<AdminEditorialPage>;
  publish(id: string): Promise<AdminEditorialPage>;
  archive(id: string): Promise<AdminEditorialPage>;
}

export type AdminArticleInput = {
  slug: string;
  categoryId: string;
  title: string;
  excerpt: string;
  bodyBlocks: Array<Record<string, unknown>>;
  coverMediaAssetId: string | null;
  readingTimeMinutes?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isFeatured?: boolean;
  homeSortOrder?: number;
  authorName?: string;
};

export type AdminArticlePatch = Partial<AdminArticleInput> & { expectedVersion?: number };

export interface AdminArticleRepository {
  listCategories(): Promise<
    Array<{ id: string; slug: string; name: string; description: string; sortOrder: number }>
  >;
  list(params?: {
    query?: string;
    status?: AdminArticle["status"];
    categoryId?: string;
  }): Promise<AdminArticle[]>;
  listPage?(params: AdminArticleListParams): Promise<PaginatedAdminItems<AdminArticle>>;
  get(id: string): Promise<AdminArticle | null>;
  create(input: AdminArticleInput): Promise<AdminArticle>;
  update(id: string, input: AdminArticlePatch): Promise<AdminArticle>;
  publish(id: string): Promise<AdminArticle>;
  archive(id: string): Promise<AdminArticle>;
  delete(id: string): Promise<void>;
  duplicate(id: string): Promise<AdminArticle>;
}

export interface AdminArticleListParams extends AdminPageParams {
  query?: string;
  status?: AdminArticle["status"];
  categoryId?: string;
}

export type AdminMediaInput = Omit<AdminMedia, "id" | "createdAt">;
export type AdminMediaPatch = Partial<AdminMediaInput>;

export interface AdminMediaRepository {
  list(): Promise<AdminMedia[]>;
  listPage?(params: AdminMediaListParams): Promise<PaginatedAdminItems<AdminMedia>>;
  create(input: AdminMediaInput): Promise<AdminMedia>;
  update(id: string, input: AdminMediaPatch): Promise<AdminMedia>;
  delete(id: string): Promise<void>;
}

export interface AdminMediaListParams extends AdminPageParams {
  query?: string;
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
export interface AdminUserRepository extends CrudRepository<
  AdminUser,
  AdminUserInput,
  Partial<AdminUserInput>
> {
  listPage?(params: AdminUserListParams): Promise<PaginatedAdminItems<AdminUser>>;
  /** Optional because legacy mocks predate multi-role access management. */
  revokeRole?(id: string, role: string): Promise<AdminUser>;
}

export interface AdminUserListParams extends AdminPageParams {
  query?: string;
  status?: AdminUser["status"];
}

export interface AdminAuditRepository {
  list(params?: {
    action?: string;
    resourceType?: string;
    outcome?: "success" | "denied" | "failure";
    actorUserId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AdminAuditLog[]>;
  listPage?(params: AdminAuditListParams): Promise<PaginatedAdminItems<AdminAuditLog>>;
}

export interface AdminAuditListParams extends AdminPageParams {
  query?: string;
  action?: string;
  resourceType?: string;
  outcome?: "success" | "denied" | "failure";
  actorUserId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminDashboardPeriod {
  /** Inclusive ISO calendar date in the Admin timezone. */
  dateFrom?: string;
  /** Inclusive ISO calendar date in the Admin timezone. */
  dateTo?: string;
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
  metrics(period?: AdminDashboardPeriod): Promise<DashboardMetrics>;
}
