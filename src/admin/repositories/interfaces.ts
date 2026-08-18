import type {
  AdminAttribute,
  AdminAuditLog,
  AdminCategory,
  AdminContent,
  AdminCustomer,
  AdminMockDatabase,
  AdminOrder,
  AdminOrderStatus,
  AdminProduct,
  AdminPromotion,
  AdminSettings,
  AdminUser,
  AdminVariant,
  StockMovement,
  StockMovementReason,
} from "@/admin/types/admin.types";

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
  isUsed(id: string): Promise<boolean>;
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

export interface AdminOrderRepository {
  list(): Promise<AdminOrder[]>;
  getById(id: string): Promise<AdminOrder | null>;
  updateStatus(id: string, status: AdminOrderStatus): Promise<AdminOrder>;
  updatePaymentStatus(id: string, status: AdminOrder["paymentStatus"]): Promise<AdminOrder>;
  addNote(id: string, body: string): Promise<AdminOrder>;
}

export interface CustomerStats {
  orderCount: number;
  deliveredCount: number;
  totalSpentMinor: number;
  averageOrderValueMinor: number;
  lastOrderAt?: string;
}

export interface AdminCustomerRepository {
  list(): Promise<Array<AdminCustomer & { stats: CustomerStats }>>;
  getById(
    id: string,
  ): Promise<(AdminCustomer & { stats: CustomerStats; orders: AdminOrder[] }) | null>;
  update(id: string, input: Partial<AdminCustomer>): Promise<AdminCustomer>;
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
