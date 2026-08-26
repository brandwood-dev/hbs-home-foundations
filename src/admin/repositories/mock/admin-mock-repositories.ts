import {
  clone,
  exportDb,
  getDb,
  importDb,
  logActivity,
  mutateDb,
  resetDb,
} from "@/admin/mock/admin-store";
import type {
  AdminAttribute,
  AdminAuditLog,
  AdminCategory,
  AdminContent,
  AdminEditorialPage,
  AdminMedia,
  AdminCustomer,
  AdminCustomerAddress,
  AdminMockDatabase,
  AdminOrder,
  AdminOrderAddress,
  AdminOrderContact,
  AdminOrderEvent,
  AdminOrderStatus,
  AdminProduct,
  AdminPromotion,
  AdminSettings,
  AdminUser,
  AdminVariant,
  StockMovement,
} from "@/admin/types/admin.types";
import type {
  AdminAttributeInput,
  AdminAttributeRepository,
  AdminAuditRepository,
  AdminCategoryInput,
  AdminCategoryImageUpload,
  AdminCategoryRepository,
  AdminContentRepository,
  AdminEditorialPageInput,
  AdminEditorialPagePatch,
  AdminEditorialPageRepository,
  AdminMediaInput,
  AdminMediaPatch,
  AdminMediaRepository,
  AdminCustomerAddressInput,
  AdminCustomerDetail,
  AdminCustomerListParams,
  AdminCustomerRepository,
  AdminCustomerRow,
  AdminDashboardPeriod,
  AdminDashboardRepository,
  AdminInventoryRepository,
  AdminOrderCounters,
  AdminOrderListParams,
  AdminOrderRepository,
  AdminProductInput,
  AdminProductRepository,
  AdminPromotionInput,
  AdminPromotionRepository,
  AdminSettingsRepository,
  AdminUserInput,
  AdminUserRepository,
  CancelAdminOrderInput,
  DashboardMetrics,
  InventoryRow,
  MergeAdminCustomersInput,
  PaginatedAdminCustomers,
  PaginatedAdminOrders,
  ReturnAdminOrderInput,
  StockAdjustmentInput,
  StockSettingsInput,
  UpdateAdminCustomerInput,
  UpdateAdminOrderShippingInput,
  UpdateAdminOrderStatusInput,
  UpdateAdminPaymentStatusInput,
} from "@/admin/repositories/interfaces";
import { adminId, normalizeKey } from "@/admin/utils/admin.utils";
import { ORDER_STATUS_LABELS, canTransition, transitionError } from "@/admin/services/order-status";
import {
  findStockShortages,
  isTrackedLine,
  stockShortageMessage,
} from "@/admin/services/orders/admin-order-inventory";
import {
  getOrderShippingProfile,
  getShippingStatus,
  isShippingToConfirm,
} from "@/admin/services/orders/admin-order-shipping";
import { applyShippingFee } from "@/admin/services/orders/admin-order-calculations";
import {
  PAYMENT_STATUS_LABELS,
  getAllowedPaymentTransitions,
  paymentRequiresReason,
  paymentTransitionError,
} from "@/admin/services/orders/admin-order-payment";
import {
  assertEmail,
  assertStatusTransition,
  canEditOrderDetails,
  normalizeTunisianPhone,
  sanitizeNoteText,
} from "@/admin/services/orders/admin-order-validation";
import { calculateCustomerMetrics } from "@/admin/services/customers/admin-customer-metrics";
import { findPotentialCustomerDuplicates } from "@/admin/services/customers/admin-customer-duplicates";
import { sanitizeCustomerNote } from "@/admin/services/customers/admin-customer-normalization";

/** Latence simulée : les écrans exercent leurs états de chargement. */
function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nowIso(): string {
  return new Date().toISOString();
}

function assertUniqueSkus(variants: AdminVariant[]): void {
  const seen = new Set<string>();
  const combos = new Set<string>();
  for (const variant of variants) {
    const sku = variant.sku.trim().toUpperCase();
    if (!sku) throw new Error("Chaque variante doit avoir un SKU.");
    if (seen.has(sku)) throw new Error(`SKU en doublon : ${variant.sku}`);
    seen.add(sku);

    const combo = [
      variant.colorId,
      variant.widthCm,
      variant.heightCm,
      variant.curtainHeader,
      variant.eyeletColor ?? "-",
      variant.lining ?? "-",
      variant.packQuantity ?? "-",
      JSON.stringify(variant.options ?? {}),
    ].join("|");
    if (combos.has(combo)) throw new Error("Deux variantes ont exactement la même combinaison.");
    combos.add(combo);

    if (variant.stock < 0) throw new Error("Le stock ne peut pas être négatif.");
    if (variant.lowStockThreshold < 0) throw new Error("Le seuil ne peut pas être négatif.");
    if (variant.priceMinor < 0) throw new Error("Le prix ne peut pas être négatif.");
    if (variant.packQuantity != null && variant.packQuantity < 1) {
      throw new Error("La quantité du pack doit être supérieure ou égale à 1.");
    }
    if (variant.compareAtPriceMinor != null && variant.compareAtPriceMinor < variant.priceMinor) {
      throw new Error("L'ancien prix ne peut pas être inférieur au prix actuel.");
    }
  }
}

function assertProductUniqueness(db: AdminMockDatabase, product: AdminProduct): void {
  if (!product.reference.trim()) throw new Error("La référence produit est obligatoire.");
  const clash = db.products.find(
    (item) =>
      item.id !== product.id &&
      (item.slug === product.slug ||
        normalizeKey(item.reference) === normalizeKey(product.reference)),
  );
  if (clash) {
    throw new Error(
      clash.slug === product.slug
        ? `Le slug « ${product.slug} » est déjà utilisé.`
        : `La référence « ${product.reference} » est déjà utilisée.`,
    );
  }
  const skus = new Set<string>();
  for (const other of db.products) {
    if (other.id === product.id) continue;
    for (const variant of other.variants) skus.add(variant.sku.trim().toUpperCase());
  }
  for (const variant of product.variants) {
    if (skus.has(variant.sku.trim().toUpperCase())) {
      throw new Error(`SKU déjà utilisé par un autre produit : ${variant.sku}`);
    }
  }
  assertUniqueSkus(product.variants);
}

export class MockAdminProductRepository implements AdminProductRepository {
  async list(): Promise<AdminProduct[]> {
    return delay(clone(getDb().products));
  }

  async getById(id: string): Promise<AdminProduct | null> {
    return delay(clone(getDb().products.find((item) => item.id === id) ?? null));
  }

  async create(input: AdminProductInput): Promise<AdminProduct> {
    const product: AdminProduct = {
      ...clone(input),
      id: adminId("prd"),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    mutateDb((db) => {
      assertProductUniqueness(db, product);
      db.products.unshift(product);
    });
    logActivity({
      action: "create",
      resourceType: "product",
      resourceId: product.id,
      details: `Produit créé : ${product.name}`,
    });
    return delay(clone(product));
  }

  async update(id: string, input: Partial<AdminProductInput>): Promise<AdminProduct> {
    const updated = mutateDb((db) => {
      const index = db.products.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Produit introuvable.");
      const next: AdminProduct = {
        ...(db.products[index] as AdminProduct),
        ...clone(input),
        id,
        updatedAt: nowIso(),
      };
      assertProductUniqueness(db, next);
      db.products[index] = next;
      return next;
    });
    logActivity({
      action: "update",
      resourceType: "product",
      resourceId: id,
      details: `Produit modifié : ${updated.name}`,
    });
    return delay(clone(updated));
  }

  async delete(id: string): Promise<void> {
    mutateDb((db) => {
      db.products = db.products.filter((item) => item.id !== id);
    });
    logActivity({
      action: "delete",
      resourceType: "product",
      resourceId: id,
      details: "Produit supprimé",
    });
    await delay(null);
  }

  async duplicate(id: string): Promise<AdminProduct> {
    const copy = mutateDb((db) => {
      const source = db.products.find((item) => item.id === id);
      if (!source) throw new Error("Produit introuvable.");
      const suffix = Date.now().toString(36).slice(-4);
      const next: AdminProduct = {
        ...clone(source),
        id: adminId("prd"),
        name: `${source.name} (copie)`,
        slug: `${source.slug}-copie-${suffix}`,
        reference: `${source.reference}-C${suffix.toUpperCase()}`,
        status: "draft",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        variants: source.variants.map((variant, index) => ({
          ...clone(variant),
          id: adminId("var"),
          sku: `${variant.sku}-C${suffix.toUpperCase()}${index}`,
        })),
      };
      db.products.unshift(next);
      return next;
    });
    logActivity({
      action: "create",
      resourceType: "product",
      resourceId: copy.id,
      details: `Produit dupliqué : ${copy.name}`,
    });
    return delay(clone(copy));
  }

  async setStatus(id: string, status: AdminProduct["status"]): Promise<AdminProduct> {
    return this.update(id, { status });
  }

  async isUsedInOrders(id: string): Promise<boolean> {
    const db = getDb();
    return delay(db.orders.some((order) => order.items.some((item) => item.productId === id)));
  }
}

export class MockAdminCategoryRepository implements AdminCategoryRepository {
  async list(): Promise<AdminCategory[]> {
    return delay(clone(getDb().categories).sort((a, b) => a.order - b.order));
  }

  async getById(id: string): Promise<AdminCategory | null> {
    return delay(clone(getDb().categories.find((item) => item.id === id) ?? null));
  }

  async uploadImage(file: File, name: string, alt: string): Promise<AdminCategoryImageUpload> {
    void name;
    void alt;
    return delay({
      mediaAssetId: adminId("media"),
      storagePath: `mock/categories/${file.name}`,
      publicUrl: URL.createObjectURL(file),
      mimeType: "image/webp",
      width: 1,
      height: 1,
    });
  }

  async create(input: AdminCategoryInput): Promise<AdminCategory> {
    const category: AdminCategory = { ...clone(input), id: adminId("cat") };
    mutateDb((db) => {
      if (db.categories.some((item) => item.slug === category.slug)) {
        throw new Error(`Le slug « ${category.slug} » existe déjà.`);
      }
      db.categories.push(category);
    });
    logActivity({
      action: "create",
      resourceType: "category",
      resourceId: category.id,
      details: `Catégorie créée : ${category.name}`,
    });
    return delay(clone(category));
  }

  async update(id: string, input: Partial<AdminCategoryInput>): Promise<AdminCategory> {
    const updated = mutateDb((db) => {
      const index = db.categories.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Catégorie introuvable.");
      const next = { ...(db.categories[index] as AdminCategory), ...clone(input), id };
      if (db.categories.some((item) => item.id !== id && item.slug === next.slug)) {
        throw new Error(`Le slug « ${next.slug} » existe déjà.`);
      }
      db.categories[index] = next;
      return next;
    });
    logActivity({
      action: "update",
      resourceType: "category",
      resourceId: id,
      details: `Catégorie modifiée : ${updated.name}`,
    });
    return delay(clone(updated));
  }

  async delete(id: string): Promise<void> {
    if (await this.isUsed(id)) throw new Error("Catégorie utilisée : impossible de la supprimer.");
    mutateDb((db) => {
      db.categories = db.categories.filter((item) => item.id !== id);
    });
    logActivity({
      action: "delete",
      resourceType: "category",
      resourceId: id,
      details: "Catégorie supprimée",
    });
    await delay(null);
  }

  async isUsed(id: string): Promise<boolean> {
    const db = getDb();
    return (
      db.products.some((product) => product.categoryId === id || product.subCategoryId === id) ||
      db.categories.some((category) => category.parentId === id)
    );
  }

  async move(id: string, direction: "up" | "down"): Promise<void> {
    mutateDb((db) => {
      const current = db.categories.find((item) => item.id === id);
      if (!current) return;
      const sorted = db.categories
        .filter((item) => item.parentId === current.parentId)
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
      const index = sorted.findIndex((item) => item.id === id);
      const target = direction === "up" ? index - 1 : index + 1;
      if (index === -1 || target < 0 || target >= sorted.length) return;
      const moved = sorted.splice(index, 1)[0];
      if (!moved) return;
      sorted.splice(target, 0, moved);
      sorted.forEach((category, order) => {
        category.order = order;
      });
    });
    await delay(null);
  }
}

export class MockAdminAttributeRepository implements AdminAttributeRepository {
  async list(): Promise<AdminAttribute[]> {
    return delay(clone(getDb().attributes).sort((a, b) => a.order - b.order));
  }

  async getById(id: string): Promise<AdminAttribute | null> {
    return delay(clone(getDb().attributes.find((item) => item.id === id) ?? null));
  }

  async create(input: AdminAttributeInput): Promise<AdminAttribute> {
    const attribute: AdminAttribute = { ...clone(input), id: adminId("attr") };
    mutateDb((db) => {
      assertAttribute(db.attributes, attribute);
      db.attributes.push(attribute);
    });
    logActivity({
      action: "create",
      resourceType: "attribute",
      resourceId: attribute.id,
      details: `Attribut créé : ${attribute.name}`,
    });
    return delay(clone(attribute));
  }

  async update(id: string, input: Partial<AdminAttributeInput>): Promise<AdminAttribute> {
    const updated = mutateDb((db) => {
      const index = db.attributes.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Attribut introuvable.");
      const next = { ...(db.attributes[index] as AdminAttribute), ...clone(input), id };
      assertAttribute(db.attributes, next);
      db.attributes[index] = next;
      return next;
    });
    logActivity({
      action: "update",
      resourceType: "attribute",
      resourceId: id,
      details: `Attribut modifié : ${updated.name}`,
    });
    return delay(clone(updated));
  }

  async delete(id: string): Promise<void> {
    mutateDb((db) => {
      db.attributes = db.attributes.filter((item) => item.id !== id);
    });
    logActivity({
      action: "delete",
      resourceType: "attribute",
      resourceId: id,
      details: "Attribut supprimé",
    });
    await delay(null);
  }
}

/** Empêche les doublons de clés techniques et de valeurs (accents, casse, ligatures). */
function assertAttribute(all: AdminAttribute[], attribute: AdminAttribute): void {
  const key = normalizeKey(attribute.key);
  if (!key) throw new Error("La clé technique est obligatoire.");
  if (all.some((item) => item.id !== attribute.id && normalizeKey(item.key) === key)) {
    throw new Error(`La clé « ${attribute.key} » existe déjà.`);
  }
  const seen = new Set<string>();
  for (const value of attribute.values) {
    const normalized = normalizeKey(value.label);
    if (seen.has(normalized)) throw new Error(`Valeur en doublon : ${value.label}`);
    seen.add(normalized);
  }
}

function toInventoryRows(db: AdminMockDatabase): InventoryRow[] {
  return db.products.flatMap((product) =>
    product.variants.map((variant) => ({
      productId: product.id,
      productName: product.name,
      categoryId: product.categoryId,
      variant: clone(variant),
      updatedAt: product.updatedAt,
    })),
  );
}

export function isLowStock(variant: AdminVariant): boolean {
  return variant.stock > 0 && variant.stock <= variant.lowStockThreshold;
}

export class MockAdminInventoryRepository implements AdminInventoryRepository {
  async list(): Promise<InventoryRow[]> {
    return delay(toInventoryRows(getDb()));
  }

  async adjust(input: StockAdjustmentInput): Promise<InventoryRow> {
    const row = mutateDb((db) => {
      const product = db.products.find((item) => item.id === input.productId);
      const variant = product?.variants.find((item) => item.id === input.variantId);
      if (!product || !variant) throw new Error("Variante introuvable.");
      if (!Number.isInteger(input.quantity) || input.quantity < 0) {
        throw new Error("La quantité doit être un entier positif.");
      }

      const previous = variant.stock;
      const next =
        input.type === "set"
          ? input.quantity
          : input.type === "increase"
            ? variant.stock + input.quantity
            : variant.stock - input.quantity;
      if (next < 0) throw new Error("Le stock ne peut pas être négatif.");

      variant.stock = next;
      if (input.lowStockThreshold != null) variant.lowStockThreshold = input.lowStockThreshold;
      if (input.availability) variant.availability = input.availability;
      else if (next === 0) variant.availability = "out_of_stock";
      else if (next <= variant.lowStockThreshold) variant.availability = "low_stock";
      else variant.availability = "in_stock";

      product.updatedAt = nowIso();

      const movement: StockMovement = {
        id: adminId("mov"),
        variantId: variant.id,
        productId: product.id,
        type: input.type,
        quantity: input.quantity,
        reason: input.reason,
        ...(input.note ? { note: input.note } : {}),
        previousStock: previous,
        resultingStock: next,
        createdAt: nowIso(),
        userId: "usr_1",
      };
      db.stockMovements.unshift(movement);

      return {
        productId: product.id,
        productName: product.name,
        categoryId: product.categoryId,
        variant: clone(variant),
        updatedAt: product.updatedAt,
      } satisfies InventoryRow;
    });
    logActivity({
      action: "adjustment",
      resourceType: "inventory",
      resourceId: input.variantId,
      details: `Stock ajusté (${input.reason})`,
    });
    return delay(row);
  }

  async updateSettings(input: StockSettingsInput): Promise<InventoryRow> {
    if (input.lowStockThreshold < 0) throw new Error("Le seuil ne peut pas être négatif.");
    const row = mutateDb((db) => {
      const product = db.products.find((item) => item.id === input.productId);
      const variant = product?.variants.find((item) => item.id === input.variantId);
      if (!product || !variant) throw new Error("Variante introuvable.");
      variant.lowStockThreshold = input.lowStockThreshold;
      if (input.availability) variant.availability = input.availability;
      product.updatedAt = nowIso();
      return {
        productId: product.id,
        productName: product.name,
        categoryId: product.categoryId,
        variant: clone(variant),
        updatedAt: product.updatedAt,
      } satisfies InventoryRow;
    });
    logActivity({
      action: "update",
      resourceType: "inventory",
      resourceId: input.variantId,
      details: `Seuil de faible stock : ${input.lowStockThreshold}`,
    });
    return delay(row);
  }

  async movements(variantId?: string): Promise<StockMovement[]> {
    const all = clone(getDb().stockMovements);
    return delay(variantId ? all.filter((item) => item.variantId === variantId) : all);
  }
}

const ACTOR = { userId: "usr_1", userName: "Hana Ben Salah" };

function pushEvent(order: AdminOrder, event: Omit<AdminOrderEvent, "id" | "at">): void {
  order.timeline.push({ id: adminId("evt"), at: nowIso(), ...ACTOR, ...event });
  order.updatedAt = nowIso();
}

function recomputeAvailability(variant: AdminVariant): void {
  if (variant.trackInventory === false || variant.availability === "made_to_order") return;
  if (variant.stock <= 0) variant.availability = "out_of_stock";
  else if (variant.stock <= variant.lowStockThreshold) variant.availability = "low_stock";
  else variant.availability = "in_stock";
}

/** Déduction/restauration idempotente du stock d'une commande. */
function moveStock(
  db: AdminMockDatabase,
  order: AdminOrder,
  direction: "deduct" | "restore",
): string[] {
  const ids: string[] = [];
  for (const item of order.items) {
    const product = db.products.find((entry) => entry.id === item.productId);
    if (!isTrackedLine(item, product)) continue;
    const variant = product?.variants.find((entry) => entry.id === item.variantId);
    if (!variant || !product) continue;
    const previousStock = variant.stock;
    variant.stock =
      direction === "deduct"
        ? Math.max(0, previousStock - item.quantity)
        : previousStock + item.quantity;
    recomputeAvailability(variant);
    product.updatedAt = nowIso();
    const movement: StockMovement = {
      id: adminId("mov"),
      variantId: variant.id,
      productId: product.id,
      type: direction === "deduct" ? "decrease" : "increase",
      quantity: item.quantity,
      reason: direction === "deduct" ? "order_confirmation" : "order_cancellation",
      note: `Commande ${order.orderNumber}`,
      previousStock,
      resultingStock: variant.stock,
      createdAt: nowIso(),
      userId: ACTOR.userId,
    };
    db.stockMovements.unshift(movement);
    ids.push(movement.id);
  }
  return ids;
}

function deductStock(db: AdminMockDatabase, order: AdminOrder): void {
  if (order.inventoryState?.deductedAt) return;
  const shortages = findStockShortages(order, db.products);
  if (shortages.length > 0) throw new Error(stockShortageMessage(shortages));
  const ids = moveStock(db, order, "deduct");
  order.inventoryState = {
    ...(order.inventoryState ?? {}),
    deductedAt: nowIso(),
    deductionMovementIds: ids,
  };
  pushEvent(order, {
    status: order.status,
    kind: "inventory",
    label: "Stock déduit",
    summary: `${ids.length} ligne(s) déduite(s) du stock.`,
  });
}

function restoreStock(db: AdminMockDatabase, order: AdminOrder): void {
  if (!order.inventoryState?.deductedAt) return;
  if (order.inventoryState.restoredAt) return;
  const ids = moveStock(db, order, "restore");
  order.inventoryState = {
    ...order.inventoryState,
    restoredAt: nowIso(),
    restorationMovementIds: ids,
  };
  pushEvent(order, {
    status: order.status,
    kind: "inventory",
    label: "Stock restauré",
    summary: `${ids.length} ligne(s) remise(s) en stock.`,
  });
}

function findOrder(db: AdminMockDatabase, id: string): AdminOrder {
  const order = db.orders.find((item) => item.id === id);
  if (!order) throw new Error("Commande introuvable.");
  return order;
}

/** Recherche privée : jamais persistée, jamais loggée. */
function matchesOrderSearch(order: AdminOrder, query: string): boolean {
  const needle = normalizeKey(query);
  if (!needle) return true;
  const phone = order.customerPhone.replace(/\D/g, "");
  return (
    normalizeKey(order.orderNumber).includes(needle) ||
    normalizeKey(order.customerName).includes(needle) ||
    normalizeKey(order.customerEmail ?? "").includes(needle) ||
    phone.includes(needle.replace(/\D/g, "")) ||
    order.items.some(
      (item) =>
        normalizeKey(item.sku).includes(needle) ||
        normalizeKey(item.productName).includes(needle) ||
        normalizeKey(item.productReference ?? "").includes(needle),
    )
  );
}

function inRange(value: string, from?: string, to?: string): boolean {
  if (from && value < from) return false;
  if (to && value > `${to}\uffff`) return false;
  return true;
}

export class MockAdminOrderRepository implements AdminOrderRepository {
  async list(
    params: AdminOrderListParams,
    privateSearchQuery?: string,
  ): Promise<PaginatedAdminOrders> {
    const all = clone(getDb().orders);
    const governorates = [...new Set(all.map((order) => order.governorate))].sort();

    let rows = all.filter((order) => {
      if (params.status?.length && !params.status.includes(order.status)) return false;
      if (params.paymentStatus?.length && !params.paymentStatus.includes(order.paymentStatus))
        return false;
      if (
        params.shippingStatus?.length &&
        !params.shippingStatus.includes(getShippingStatus(order))
      )
        return false;
      if (
        params.shippingProfiles?.length &&
        !params.shippingProfiles.includes(getOrderShippingProfile(order))
      )
        return false;
      if (params.deliveryMethod?.length && !params.deliveryMethod.includes(order.deliveryMethod))
        return false;
      if (params.governorates?.length && !params.governorates.includes(order.governorate))
        return false;
      if (!inRange(order.createdAt, params.dateFrom, params.dateTo)) return false;
      return true;
    });

    if (privateSearchQuery?.trim()) {
      rows = rows.filter((order) => matchesOrderSearch(order, privateSearchQuery));
    }

    const counters: AdminOrderCounters = {
      total: rows.length,
      pendingConfirmation: rows.filter(
        (order) => order.status === "pending_confirmation" || order.status === "received",
      ).length,
      confirmed: rows.filter((order) => order.status === "confirmed").length,
      preparing: rows.filter((order) => order.status === "preparing").length,
      shipped: rows.filter((order) => order.status === "shipped").length,
      delivered: rows.filter((order) => order.status === "delivered").length,
      cancelled: rows.filter((order) => order.status === "cancelled").length,
      shippingToConfirm: rows.filter((order) => isShippingToConfirm(order)).length,
      paymentPending: rows.filter((order) => order.paymentStatus === "pending").length,
    };

    rows.sort((a, b) => {
      switch (params.sort) {
        case "oldest":
          return a.createdAt.localeCompare(b.createdAt);
        case "total_desc":
          return b.totalMinor - a.totalMinor;
        case "total_asc":
          return a.totalMinor - b.totalMinor;
        case "status":
          return a.status.localeCompare(b.status) || b.createdAt.localeCompare(a.createdAt);
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });

    const pageSize = Math.max(1, params.pageSize);
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = Math.min(Math.max(1, params.page), pageCount);
    const start = (page - 1) * pageSize;

    return delay({
      rows: rows.slice(start, start + pageSize),
      total: rows.length,
      page,
      pageSize,
      pageCount,
      counters,
      governorates,
    });
  }

  async getById(orderId: string): Promise<AdminOrder | null> {
    return delay(clone(getDb().orders.find((item) => item.id === orderId) ?? null));
  }

  async updateStatus(input: UpdateAdminOrderStatusInput): Promise<AdminOrder> {
    const order = mutateDb((db) => {
      const found = findOrder(db, input.orderId);
      const from = found.status;
      assertStatusTransition(found, input.status, input.reason);

      if (input.status === "confirmed") deductStock(db, found);
      found.status = input.status;

      if (input.status === "shipped") {
        found.shipment = {
          shippingStatus: getShippingStatus(found),
          ...(found.shipment ?? {}),
          ...(input.carrierName ? { carrierName: input.carrierName } : {}),
          ...(input.trackingNumber ? { trackingNumber: input.trackingNumber } : {}),
          shippedAt: input.shippedAt ?? nowIso(),
        };
      }
      if (input.status === "delivered") {
        found.shipment = {
          shippingStatus: getShippingStatus(found),
          ...(found.shipment ?? {}),
          deliveredAt: input.deliveredAt ?? nowIso(),
        };
        if (input.paymentCollected !== false) found.paymentStatus = "collected";
      }
      if (input.status === "return_requested") {
        found.returnInfo = {
          ...(found.returnInfo ?? {}),
          requestedAt: nowIso(),
          ...(input.reason ? { reason: input.reason } : {}),
        };
      }

      pushEvent(found, {
        status: input.status,
        kind: "status",
        fromStatus: from,
        toStatus: input.status,
        label: `${ORDER_STATUS_LABELS[from]} → ${ORDER_STATUS_LABELS[input.status]}`,
        ...(input.reason ? { reason: input.reason } : {}),
        ...(input.note ? { note: input.note } : {}),
      });
      return found;
    });

    logActivity({
      action: "status_change",
      resourceType: "order",
      resourceId: input.orderId,
      details: `Commande ${order.orderNumber} → ${ORDER_STATUS_LABELS[input.status]}`,
    });
    return delay(clone(order));
  }

  async updatePaymentStatus(input: UpdateAdminPaymentStatusInput): Promise<AdminOrder> {
    const order = mutateDb((db) => {
      const found = findOrder(db, input.orderId);
      const paymentError = paymentTransitionError(found, input.paymentStatus);
      if (paymentError) throw new Error(paymentError);

      if (paymentRequiresReason(input.paymentStatus) && !input.reason?.trim()) {
        throw new Error("Un motif est obligatoire pour un remboursement.");
      }
      const from = found.paymentStatus;
      found.paymentStatus = input.paymentStatus;
      pushEvent(found, {
        status: found.status,
        kind: "payment",
        label: `Paiement : ${PAYMENT_STATUS_LABELS[from]} → ${PAYMENT_STATUS_LABELS[input.paymentStatus]}`,
        ...(input.reason ? { reason: input.reason } : {}),
        ...(input.note ? { note: input.note } : {}),
      });
      return found;
    });
    logActivity({
      action: "update",
      resourceType: "order",
      resourceId: input.orderId,
      details: `Paiement ${order.orderNumber} → ${PAYMENT_STATUS_LABELS[input.paymentStatus]}`,
    });
    return delay(clone(order));
  }

  async updateShipping(input: UpdateAdminOrderShippingInput): Promise<AdminOrder> {
    if (input.shippingFeeMinor < 0)
      throw new Error("Les frais de livraison doivent être positifs.");
    const order = mutateDb((db) => {
      const found = findOrder(db, input.orderId);
      found.shipment = {
        ...(found.shipment ?? { shippingStatus: "calculated" }),
        shippingStatus: "calculated",
        shippingFeeMinor: input.shippingFeeMinor,
        ...(input.carrierName ? { carrierName: input.carrierName } : {}),
      };
      applyShippingFee(found, input.shippingFeeMinor);
      pushEvent(found, {
        status: found.status,
        kind: "shipping_fee",
        label: "Frais de livraison définis",
        summary: `${(input.shippingFeeMinor / 1000).toFixed(3)} DT`,
        ...(input.note ? { note: input.note } : {}),
      });
      return found;
    });
    logActivity({
      action: "update",
      resourceType: "order",
      resourceId: input.orderId,
      details: `Frais de livraison définis pour ${order.orderNumber}`,
    });
    return delay(clone(order));
  }

  async updateContact(orderId: string, contact: AdminOrderContact): Promise<AdminOrder> {
    const order = mutateDb((db) => {
      const found = findOrder(db, orderId);
      if (!canEditOrderDetails(found)) {
        throw new Error("Les coordonnées ne sont plus modifiables après expédition.");
      }
      const name = contact.customerName.trim();
      if (!name) throw new Error("Le nom du client est obligatoire.");
      found.customerName = name;
      found.customerPhone = normalizeTunisianPhone(contact.customerPhone);
      const email = assertEmail(contact.customerEmail ?? "");
      if (email) found.customerEmail = email;
      else delete found.customerEmail;
      pushEvent(found, { status: found.status, kind: "contact", label: "Coordonnées modifiées" });
      return found;
    });
    logActivity({
      action: "update",
      resourceType: "order",
      resourceId: orderId,
      details: `Coordonnées modifiées (${order.orderNumber})`,
    });
    return delay(clone(order));
  }

  async updateAddress(orderId: string, address: AdminOrderAddress): Promise<AdminOrder> {
    const order = mutateDb((db) => {
      const found = findOrder(db, orderId);
      if (!canEditOrderDetails(found)) {
        throw new Error("L'adresse n'est plus modifiable après expédition.");
      }
      if (!address.governorate.trim() || !address.city.trim() || !address.addressLine.trim()) {
        throw new Error("Gouvernorat, ville et adresse sont obligatoires.");
      }
      found.governorate = address.governorate.trim();
      found.city = address.city.trim();
      found.addressLine = address.addressLine.trim();
      if (address.postalCode?.trim()) found.postalCode = address.postalCode.trim();
      if (address.landmark?.trim()) found.landmark = address.landmark.trim();
      if (address.deliveryNote?.trim()) found.deliveryNote = address.deliveryNote.trim();
      pushEvent(found, { status: found.status, kind: "address", label: "Adresse modifiée" });
      return found;
    });
    logActivity({
      action: "update",
      resourceType: "order",
      resourceId: orderId,
      details: `Adresse modifiée (${order.orderNumber})`,
    });
    return delay(clone(order));
  }

  async addNote(orderId: string, text: string): Promise<AdminOrder> {
    const body = sanitizeNoteText(text);
    const order = mutateDb((db) => {
      const found = findOrder(db, orderId);
      found.notes.unshift({
        id: adminId("note"),
        at: nowIso(),
        author: ACTOR.userName,
        userId: ACTOR.userId,
        body,
      });
      pushEvent(found, { status: found.status, kind: "note", label: "Note interne ajoutée" });
      return found;
    });
    return delay(clone(order));
  }

  async cancelOrder(input: CancelAdminOrderInput): Promise<AdminOrder> {
    if (!input.reason.trim()) throw new Error("Un motif d'annulation est obligatoire.");
    const order = mutateDb((db) => {
      const found = findOrder(db, input.orderId);
      assertStatusTransition(found, "cancelled", input.reason);
      const from = found.status;
      found.status = "cancelled";
      found.cancellationReason = input.reason.trim();
      if (input.restoreStock) restoreStock(db, found);
      if (input.refundPayment && found.paymentStatus === "collected") {
        found.paymentStatus = "refunded";
      }
      pushEvent(found, {
        status: "cancelled",
        kind: "status",
        fromStatus: from,
        toStatus: "cancelled",
        label: "Commande annulée",
        reason: input.reason.trim(),
        ...(input.note ? { note: input.note } : {}),
      });
      return found;
    });
    logActivity({
      action: "status_change",
      resourceType: "order",
      resourceId: input.orderId,
      details: `Commande ${order.orderNumber} annulée`,
    });
    return delay(clone(order));
  }

  async returnOrder(input: ReturnAdminOrderInput): Promise<AdminOrder> {
    if (!input.reason.trim()) throw new Error("Un motif de retour est obligatoire.");
    const order = mutateDb((db) => {
      const found = findOrder(db, input.orderId);
      if (input.action === "request") {
        assertStatusTransition(found, "return_requested", input.reason);
        found.status = "return_requested";
        found.returnInfo = { requestedAt: nowIso(), reason: input.reason.trim() };
        pushEvent(found, {
          status: found.status,
          kind: "status",
          toStatus: "return_requested",
          label: "Retour demandé",
          reason: input.reason.trim(),
        });
        return found;
      }

      const accepted = input.action === "accept";
      const next: AdminOrderStatus = accepted ? "returned" : "delivered";
      assertStatusTransition(found, next, input.reason);
      found.status = next;
      found.returnInfo = {
        ...(found.returnInfo ?? {}),
        resolvedAt: nowIso(),
        resolution: accepted ? "accepted" : "refused",
        reason: input.reason.trim(),
        ...(input.conditionReason ? { conditionReason: input.conditionReason } : {}),
        restocked: Boolean(accepted && input.restock),
      };
      if (accepted && input.restock) restoreStock(db, found);
      if (accepted && input.refundPayment !== false && found.paymentStatus === "collected") {
        found.paymentStatus = "refunded";
      }
      pushEvent(found, {
        status: next,
        kind: "status",
        toStatus: next,
        label: accepted ? "Retour accepté" : "Retour refusé",
        reason: input.reason.trim(),
        ...(input.note ? { note: input.note } : {}),
      });
      return found;
    });
    logActivity({
      action: "status_change",
      resourceType: "order",
      resourceId: input.orderId,
      details: `Retour ${input.action} — ${order.orderNumber}`,
    });
    return delay(clone(order));
  }
}

function matchesCustomerSearch(customer: AdminCustomer, query: string): boolean {
  const needle = normalizeKey(query);
  if (!needle) return true;
  const digits = needle.replace(/\D/g, "");
  return (
    normalizeKey(`${customer.firstName} ${customer.lastName}`).includes(needle) ||
    normalizeKey(customer.email ?? "").includes(needle) ||
    (digits.length > 0 && customer.phone.replace(/\D/g, "").includes(digits))
  );
}

function findCustomer(db: AdminMockDatabase, id: string): AdminCustomer {
  const customer = db.customers.find((item) => item.id === id);
  if (!customer) throw new Error("Client introuvable.");
  return customer;
}

export class MockAdminCustomerRepository implements AdminCustomerRepository {
  async list(
    params: AdminCustomerListParams,
    privateSearchQuery?: string,
  ): Promise<PaginatedAdminCustomers> {
    const db = getDb();
    const all = clone(db.customers).filter((customer) => !customer.mergedIntoCustomerId);
    const orders = clone(db.orders);
    const governorates = [...new Set(all.map((customer) => customer.governorate))].sort();
    const tags = [...new Set(all.flatMap((customer) => customer.tags))].sort();

    let rows: AdminCustomerRow[] = all.map((customer) => ({
      ...customer,
      metrics: calculateCustomerMetrics(orders.filter((o) => o.customerId === customer.id)),
      hasPotentialDuplicate: findPotentialCustomerDuplicates(customer, all).some(
        (match) => match.strong,
      ),
    }));

    rows = rows.filter((row) => {
      if (params.governorates?.length && !params.governorates.includes(row.governorate))
        return false;
      if (params.hasOrders && row.metrics.totalOrders === 0) return false;
      if (params.hasDeliveredOrders && row.metrics.deliveredOrders === 0) return false;
      if (params.minSpentMinor && row.metrics.totalSpentMinor < params.minSpentMinor) return false;
      if (params.tags?.length && !params.tags.some((tag) => row.tags.includes(tag))) return false;
      if (params.onlyPotentialDuplicates && !row.hasPotentialDuplicate) return false;
      if (params.lastOrderFrom || params.lastOrderTo) {
        if (!row.metrics.lastOrderAt) return false;
        if (!inRange(row.metrics.lastOrderAt, params.lastOrderFrom, params.lastOrderTo))
          return false;
      }
      return true;
    });

    if (privateSearchQuery?.trim()) {
      rows = rows.filter((row) => matchesCustomerSearch(row, privateSearchQuery));
    }

    rows.sort((a, b) => {
      switch (params.sort) {
        case "name_asc":
          return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "fr");
        case "spent_desc":
          return b.metrics.totalSpentMinor - a.metrics.totalSpentMinor;
        case "orders_desc":
          return b.metrics.totalOrders - a.metrics.totalOrders;
        case "aov_desc":
          return b.metrics.averageOrderValueMinor - a.metrics.averageOrderValueMinor;
        default:
          return (b.metrics.lastOrderAt ?? "").localeCompare(a.metrics.lastOrderAt ?? "");
      }
    });

    const pageSize = Math.max(1, params.pageSize);
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = Math.min(Math.max(1, params.page), pageCount);
    const start = (page - 1) * pageSize;

    return delay({
      rows: rows.slice(start, start + pageSize),
      total: rows.length,
      page,
      pageSize,
      pageCount,
      governorates,
      tags,
    });
  }

  async getById(customerId: string): Promise<AdminCustomerDetail | null> {
    const db = getDb();
    const customer = db.customers.find((item) => item.id === customerId);
    if (!customer) return delay(null);
    const orders = clone(db.orders.filter((order) => order.customerId === customerId)).sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt),
    );
    const duplicates = findPotentialCustomerDuplicates(customer, clone(db.customers)).map(
      (match) => match.customer,
    );
    return delay({
      ...clone(customer),
      metrics: calculateCustomerMetrics(orders),
      hasPotentialDuplicate: duplicates.length > 0,
      orders,
      duplicates,
    });
  }

  async update(customerId: string, input: UpdateAdminCustomerInput): Promise<AdminCustomer> {
    const updated = mutateDb((db) => {
      const customer = findCustomer(db, customerId);
      if (input.firstName !== undefined) {
        if (!input.firstName.trim()) throw new Error("Le prénom est obligatoire.");
        customer.firstName = input.firstName.trim();
      }
      if (input.lastName !== undefined) {
        if (!input.lastName.trim()) throw new Error("Le nom est obligatoire.");
        customer.lastName = input.lastName.trim();
      }
      if (input.phone !== undefined) customer.phone = normalizeTunisianPhone(input.phone);
      if (input.email !== undefined) {
        const email = assertEmail(input.email);
        if (email) customer.email = email;
        else delete customer.email;
      }
      if (input.governorate !== undefined) customer.governorate = input.governorate;
      if (input.preferredChannel !== undefined) customer.preferredChannel = input.preferredChannel;
      customer.updatedAt = nowIso();
      return customer;
    });
    logActivity({
      action: "update",
      resourceType: "customer",
      resourceId: customerId,
      details: `Fiche client modifiée : ${updated.firstName} ${updated.lastName}`,
    });
    return delay(clone(updated));
  }

  async addAddress(customerId: string, address: AdminCustomerAddressInput): Promise<AdminCustomer> {
    const updated = mutateDb((db) => {
      const customer = findCustomer(db, customerId);
      const isFirst = customer.addresses.length === 0;
      customer.addresses.push({
        ...clone(address),
        id: adminId("addr"),
        isDefault: isFirst || Boolean(address.isDefault),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      if (address.isDefault || isFirst) {
        for (const entry of customer.addresses) {
          entry.isDefault = entry.id === customer.addresses.at(-1)?.id;
        }
      }
      return customer;
    });
    return delay(clone(updated));
  }

  async updateAddress(
    customerId: string,
    addressId: string,
    input: AdminCustomerAddressInput,
  ): Promise<AdminCustomer> {
    const updated = mutateDb((db) => {
      const customer = findCustomer(db, customerId);
      const index = customer.addresses.findIndex((entry) => entry.id === addressId);
      if (index === -1) throw new Error("Adresse introuvable.");
      const current = customer.addresses[index] as AdminCustomerAddress;
      customer.addresses[index] = {
        ...current,
        ...clone(input),
        id: addressId,
        updatedAt: nowIso(),
      };
      return customer;
    });
    return delay(clone(updated));
  }

  async deleteAddress(customerId: string, addressId: string): Promise<AdminCustomer> {
    const updated = mutateDb((db) => {
      const customer = findCustomer(db, customerId);
      customer.addresses = customer.addresses.filter((entry) => entry.id !== addressId);
      if (customer.addresses.length > 0 && !customer.addresses.some((entry) => entry.isDefault)) {
        (customer.addresses[0] as AdminCustomerAddress).isDefault = true;
      }
      return customer;
    });
    return delay(clone(updated));
  }

  async setDefaultAddress(customerId: string, addressId: string): Promise<AdminCustomer> {
    const updated = mutateDb((db) => {
      const customer = findCustomer(db, customerId);
      if (!customer.addresses.some((entry) => entry.id === addressId)) {
        throw new Error("Adresse introuvable.");
      }
      for (const entry of customer.addresses) entry.isDefault = entry.id === addressId;
      return customer;
    });
    return delay(clone(updated));
  }

  async updateTags(customerId: string, tags: string[]): Promise<AdminCustomer> {
    const updated = mutateDb((db) => {
      const customer = findCustomer(db, customerId);
      customer.tags = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
      customer.updatedAt = nowIso();
      return customer;
    });
    return delay(clone(updated));
  }

  async addNote(customerId: string, text: string): Promise<AdminCustomer> {
    const body = sanitizeCustomerNote(text);
    const updated = mutateDb((db) => {
      const customer = findCustomer(db, customerId);
      customer.notes = [
        { id: adminId("cnote"), text: body, createdAt: nowIso(), ...ACTOR },
        ...(customer.notes ?? []),
      ];
      return customer;
    });
    return delay(clone(updated));
  }

  async findPotentialDuplicates(customerId: string): Promise<AdminCustomer[]> {
    const db = getDb();
    const customer = db.customers.find((item) => item.id === customerId);
    if (!customer) return delay([]);
    return delay(
      findPotentialCustomerDuplicates(customer, clone(db.customers)).map((match) => match.customer),
    );
  }

  /** Fusion : le client secondaire est archivé, jamais supprimé. */
  async mergeCustomers(input: MergeAdminCustomersInput): Promise<AdminCustomer> {
    if (input.primaryCustomerId === input.secondaryCustomerId) {
      throw new Error("Impossible de fusionner un client avec lui-même.");
    }
    const merged = mutateDb((db) => {
      const primary = findCustomer(db, input.primaryCustomerId);
      const secondary = findCustomer(db, input.secondaryCustomerId);
      if (secondary.mergedIntoCustomerId) throw new Error("Ce client est déjà fusionné.");

      if (input.keepPhoneFrom === "secondary") primary.phone = secondary.phone;
      if (input.keepEmailFrom === "secondary" && secondary.email) primary.email = secondary.email;

      const known = new Set(
        primary.addresses.map((entry) =>
          normalizeKey(`${entry.addressLine} ${entry.city} ${entry.governorate}`),
        ),
      );
      for (const address of secondary.addresses) {
        const key = normalizeKey(`${address.addressLine} ${address.city} ${address.governorate}`);
        if (known.has(key)) continue;
        known.add(key);
        primary.addresses.push({ ...clone(address), id: adminId("addr"), isDefault: false });
      }

      primary.tags = [...new Set([...primary.tags, ...secondary.tags])];
      primary.notes = [...(primary.notes ?? []), ...(secondary.notes ?? [])].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
      primary.updatedAt = nowIso();

      for (const order of db.orders) {
        if (order.customerId === secondary.id) order.customerId = primary.id;
      }

      secondary.mergedIntoCustomerId = primary.id;
      secondary.mergedAt = nowIso();
      return primary;
    });
    logActivity({
      action: "update",
      resourceType: "customer",
      resourceId: input.primaryCustomerId,
      details: `Fusion du client ${input.secondaryCustomerId} vers ${input.primaryCustomerId}`,
    });
    return delay(clone(merged));
  }
}

export class MockAdminPromotionRepository implements AdminPromotionRepository {
  async list(): Promise<AdminPromotion[]> {
    return delay(clone(getDb().promotions));
  }

  async getById(id: string): Promise<AdminPromotion | null> {
    return delay(clone(getDb().promotions.find((item) => item.id === id) ?? null));
  }

  async create(input: AdminPromotionInput): Promise<AdminPromotion> {
    const promotion: AdminPromotion = { ...clone(input), id: adminId("promo"), usageCount: 0 };
    mutateDb((db) => {
      assertPromotion(db.promotions, promotion);
      db.promotions.push(promotion);
    });
    logActivity({
      action: "create",
      resourceType: "promotion",
      resourceId: promotion.id,
      details: `Promotion créée : ${promotion.name}`,
    });
    return delay(clone(promotion));
  }

  async update(id: string, input: Partial<AdminPromotionInput>): Promise<AdminPromotion> {
    const updated = mutateDb((db) => {
      const index = db.promotions.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Promotion introuvable.");
      const next = { ...(db.promotions[index] as AdminPromotion), ...clone(input), id };
      assertPromotion(db.promotions, next);
      db.promotions[index] = next;
      return next;
    });
    logActivity({
      action: "update",
      resourceType: "promotion",
      resourceId: id,
      details: `Promotion modifiée : ${updated.name}`,
    });
    return delay(clone(updated));
  }

  async delete(id: string): Promise<void> {
    mutateDb((db) => {
      db.promotions = db.promotions.filter((item) => item.id !== id);
    });
    logActivity({
      action: "delete",
      resourceType: "promotion",
      resourceId: id,
      details: "Promotion supprimée",
    });
    await delay(null);
  }
}

function assertPromotion(all: AdminPromotion[], promotion: AdminPromotion): void {
  if (promotion.code) {
    const code = promotion.code.trim().toUpperCase();
    if (all.some((item) => item.id !== promotion.id && item.code?.trim().toUpperCase() === code)) {
      throw new Error(`Le code « ${promotion.code} » existe déjà.`);
    }
  }
  if (promotion.discountType === "percentage" && (promotion.value < 1 || promotion.value > 100)) {
    throw new Error("Le pourcentage doit être compris entre 1 et 100.");
  }
  if (promotion.discountType === "fixed_amount" && promotion.value <= 0) {
    throw new Error("Le montant doit être positif.");
  }
  if (Date.parse(promotion.endAt) <= Date.parse(promotion.startAt)) {
    throw new Error("La date de fin doit être postérieure à la date de début.");
  }
}

export class MockAdminContentRepository implements AdminContentRepository {
  async get(): Promise<AdminContent> {
    return delay(clone(getDb().content));
  }

  async update(input: Partial<AdminContent>): Promise<AdminContent> {
    const content = mutateDb((db) => {
      db.content = { ...db.content, ...clone(input) };
      return db.content;
    });
    logActivity({
      action: "update",
      resourceType: "content",
      resourceId: "content",
      details: "Contenu modifié",
    });
    return delay(clone(content));
  }
}

export class MockAdminEditorialPageRepository implements AdminEditorialPageRepository {
  async list(): Promise<AdminEditorialPage[]> {
    return (await new MockAdminContentRepository().get()).pages.filter(
      (page) => page.status !== "archived",
    );
  }

  async get(id: string): Promise<AdminEditorialPage | null> {
    return (
      (await new MockAdminContentRepository().get()).pages.find((page) => page.id === id) ?? null
    );
  }

  async create(input: AdminEditorialPageInput): Promise<AdminEditorialPage> {
    const now = nowIso();
    const item: AdminEditorialPage = {
      id: adminId("page"),
      title: input.title.trim(),
      slug: input.slug.trim(),
      status: "draft",
      body: input.body ?? "",
      seoTitle: input.seoTitle ?? "",
      seoDescription: input.seoDescription ?? "",
      updatedAt: now,
      version: 1,
      publishedAt: null,
      blocks: (input.blocks ?? []).map((block, index) => ({
        id: adminId(`block_${index}`),
        sortOrder: block.sortOrder,
        blockType: block.blockType,
        payload: clone(block.payload),
        media: null,
      })),
    };
    await new MockAdminContentRepository().update({
      pages: [...(await this.list()), item],
    });
    return clone(item);
  }

  async update(id: string, input: AdminEditorialPagePatch): Promise<AdminEditorialPage> {
    const current = await this.get(id);
    if (!current) throw new Error("Page introuvable.");
    const item: AdminEditorialPage = {
      ...current,
      ...(input.slug === undefined ? {} : { slug: input.slug }),
      ...(input.title === undefined ? {} : { title: input.title }),
      ...(input.body === undefined ? {} : { body: input.body }),
      seoTitle: input.seoTitle === undefined ? current.seoTitle : (input.seoTitle ?? ""),
      seoDescription:
        input.seoDescription === undefined ? current.seoDescription : (input.seoDescription ?? ""),
      blocks:
        input.blocks === undefined
          ? (current.blocks ?? [])
          : input.blocks.map((block, index) => ({
              id: adminId(`block_${index}`),
              sortOrder: block.sortOrder,
              blockType: block.blockType,
              payload: clone(block.payload),
              media: null,
            })),
      version: (current.version ?? 1) + 1,
      updatedAt: nowIso(),
    };
    await new MockAdminContentRepository().update({
      pages: (await this.list()).map((page) => (page.id === id ? item : page)),
    });
    return clone(item);
  }

  async publish(id: string): Promise<AdminEditorialPage> {
    const current = await this.get(id);
    if (!current) throw new Error("Page introuvable.");
    const item = {
      ...current,
      status: "published" as const,
      publishedAt: nowIso(),
      version: (current.version ?? 1) + 1,
      updatedAt: nowIso(),
    };
    await new MockAdminContentRepository().update({
      pages: (await this.list()).map((page) => (page.id === id ? item : page)),
    });
    return clone(item);
  }

  async archive(id: string): Promise<AdminEditorialPage> {
    const item = await this.update(id, {});
    item.status = "archived";
    await new MockAdminContentRepository().update({
      pages: (await this.list()).filter((page) => page.id !== id).concat(item),
    });
    return item;
  }
}

export class MockAdminMediaRepository implements AdminMediaRepository {
  async list(): Promise<AdminMedia[]> {
    return (await new MockAdminContentRepository().get()).media;
  }

  async create(input: AdminMediaInput): Promise<AdminMedia> {
    const item: AdminMedia = {
      ...clone(input),
      id: `med_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await new MockAdminContentRepository().update({
      media: [...(await this.list()), item],
    });
    return item;
  }

  async update(id: string, input: AdminMediaPatch): Promise<AdminMedia> {
    const current = (await this.list()).find((item) => item.id === id);
    if (!current) throw new Error("Média introuvable.");
    const item = { ...current, ...clone(input) };
    await new MockAdminContentRepository().update({
      media: (await this.list()).map((candidate) => (candidate.id === id ? item : candidate)),
    });
    return item;
  }

  async delete(id: string): Promise<void> {
    await this.update(id, { status: "archived" });
  }
}

export class MockAdminSettingsRepository implements AdminSettingsRepository {
  async get(): Promise<AdminSettings> {
    return delay(clone(getDb().settings));
  }

  async update(input: Partial<AdminSettings>): Promise<AdminSettings> {
    const settings = mutateDb((db) => {
      db.settings = { ...db.settings, ...clone(input) };
      return db.settings;
    });
    logActivity({
      action: "update",
      resourceType: "settings",
      resourceId: "settings",
      details: "Paramètre modifié",
    });
    return delay(clone(settings));
  }

  async reset(): Promise<void> {
    resetDb();
    await delay(null);
  }

  async exportJson(): Promise<string> {
    return delay(exportDb());
  }

  async importJson(json: string): Promise<void> {
    importDb(json);
    await delay(null);
  }

  async snapshot(): Promise<AdminMockDatabase> {
    return delay(clone(getDb()));
  }
}

export class MockAdminUserRepository implements AdminUserRepository {
  async list(): Promise<AdminUser[]> {
    return delay(clone(getDb().users));
  }

  async getById(id: string): Promise<AdminUser | null> {
    return delay(clone(getDb().users.find((item) => item.id === id) ?? null));
  }

  async create(input: AdminUserInput): Promise<AdminUser> {
    const user: AdminUser = { ...clone(input), id: adminId("usr"), createdAt: nowIso() };
    mutateDb((db) => {
      if (db.users.some((item) => item.email.toLowerCase() === user.email.toLowerCase())) {
        throw new Error("Cet e-mail est déjà utilisé.");
      }
      db.users.push(user);
    });
    logActivity({
      action: "create",
      resourceType: "user",
      resourceId: user.id,
      details: `Utilisateur créé : ${user.fullName}`,
    });
    return delay(clone(user));
  }

  async update(id: string, input: Partial<AdminUserInput>): Promise<AdminUser> {
    const updated = mutateDb((db) => {
      const index = db.users.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Utilisateur introuvable.");
      const next = { ...(db.users[index] as AdminUser), ...clone(input), id };
      db.users[index] = next;
      return next;
    });
    return delay(clone(updated));
  }

  async delete(id: string): Promise<void> {
    mutateDb((db) => {
      db.users = db.users.filter((item) => item.id !== id);
    });
    await delay(null);
  }
}

export class MockAdminAuditRepository implements AdminAuditRepository {
  async list(): Promise<AdminAuditLog[]> {
    return delay(clone(getDb().auditLogs));
  }
}

export class MockAdminDashboardRepository implements AdminDashboardRepository {
  async metrics(period: AdminDashboardPeriod = {}): Promise<DashboardMetrics> {
    const db = getDb();
    const orders = db.orders.filter((order) => {
      const date = order.createdAt.slice(0, 10);
      return (
        (!period.dateFrom || date >= period.dateFrom) && (!period.dateTo || date <= period.dateTo)
      );
    });
    const delivered = orders.filter((order) => order.status === "delivered");

    // Chiffre d'affaires = somme des sous-totaux produits des commandes livrées.
    const revenueMinor = delivered.reduce((total, order) => total + order.subtotalMinor, 0);
    const deliveredCount = delivered.length;

    const countBy = (status: AdminOrderStatus) =>
      orders.filter((order) => order.status === status).length;

    const statuses: AdminOrderStatus[] = [
      "received",
      "pending_confirmation",
      "confirmed",
      "preparing",
      "shipped",
      "delivered",
      "cancelled",
      "return_requested",
      "returned",
    ];

    const sold = new Map<string, { name: string; quantity: number; revenueMinor: number }>();
    for (const order of delivered) {
      for (const item of order.items) {
        const entry = sold.get(item.productId) ?? {
          name: item.productName,
          quantity: 0,
          revenueMinor: 0,
        };
        entry.quantity += item.quantity;
        entry.revenueMinor += item.lineTotalMinor;
        sold.set(item.productId, entry);
      }
    }

    const lowStockRows = toInventoryRows(db).filter(
      (row) => row.variant.stock === 0 || isLowStock(row.variant),
    );

    const byDay = new Map<string, number>();
    for (const order of delivered) {
      const day = order.createdAt.slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + order.subtotalMinor);
    }

    return delay({
      revenueMinor,
      deliveredCount,
      averageOrderValueMinor: deliveredCount > 0 ? Math.round(revenueMinor / deliveredCount) : 0,
      totalOrders: orders.length,
      pendingConfirmationCount: countBy("pending_confirmation"),
      preparingCount: countBy("preparing"),
      shippedCount: countBy("shipped"),
      cancelledCount: countBy("cancelled"),
      lowStockCount: lowStockRows.length,
      statusBreakdown: statuses.map((status) => ({ status, count: countBy(status) })),
      recentOrders: clone(orders)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 8),
      topProducts: [...sold.entries()]
        .map(([productId, value]) => ({ productId, ...value }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 6),
      lowStockRows: lowStockRows.slice(0, 8),
      salesByDay: [...byDay.entries()]
        .map(([date, value]) => ({ date, revenueMinor: value }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14),
    });
  }
}
