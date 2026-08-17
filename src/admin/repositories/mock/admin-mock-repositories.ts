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
} from "@/admin/types/admin.types";
import type {
  AdminAttributeInput,
  AdminAttributeRepository,
  AdminAuditRepository,
  AdminCategoryInput,
  AdminCategoryRepository,
  AdminContentRepository,
  AdminCustomerRepository,
  AdminDashboardRepository,
  AdminInventoryRepository,
  AdminOrderRepository,
  AdminProductInput,
  AdminProductRepository,
  AdminPromotionInput,
  AdminPromotionRepository,
  AdminSettingsRepository,
  AdminUserInput,
  AdminUserRepository,
  CustomerStats,
  DashboardMetrics,
  InventoryRow,
  StockAdjustmentInput,
} from "@/admin/repositories/interfaces";
import { adminId, normalizeKey } from "@/admin/utils/admin.utils";
import { canTransition, transitionError } from "@/admin/services/order-status";

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
    ].join("|");
    if (combos.has(combo)) throw new Error("Deux variantes ont exactement la même combinaison.");
    combos.add(combo);

    if (variant.stock < 0) throw new Error("Le stock ne peut pas être négatif.");
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
}

export class MockAdminCategoryRepository implements AdminCategoryRepository {
  async list(): Promise<AdminCategory[]> {
    return delay(clone(getDb().categories).sort((a, b) => a.order - b.order));
  }

  async getById(id: string): Promise<AdminCategory | null> {
    return delay(clone(getDb().categories.find((item) => item.id === id) ?? null));
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
      const sorted = [...db.categories].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((item) => item.id === id);
      const target = direction === "up" ? index - 1 : index + 1;
      if (index === -1 || target < 0 || target >= sorted.length) return;
      const current = sorted[index] as AdminCategory;
      const swap = sorted[target] as AdminCategory;
      const order = current.order;
      current.order = swap.order;
      swap.order = order;
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

  async movements(variantId?: string): Promise<StockMovement[]> {
    const all = clone(getDb().stockMovements);
    return delay(variantId ? all.filter((item) => item.variantId === variantId) : all);
  }
}

export class MockAdminOrderRepository implements AdminOrderRepository {
  async list(): Promise<AdminOrder[]> {
    return delay(clone(getDb().orders).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  async getById(id: string): Promise<AdminOrder | null> {
    return delay(clone(getDb().orders.find((item) => item.id === id) ?? null));
  }

  async updateStatus(id: string, status: AdminOrderStatus): Promise<AdminOrder> {
    const order = mutateDb((db) => {
      const found = db.orders.find((item) => item.id === id);
      if (!found) throw new Error("Commande introuvable.");
      if (!canTransition(found.status, status))
        throw new Error(transitionError(found.status, status));
      found.status = status;
      found.updatedAt = nowIso();
      if (status === "delivered") found.paymentStatus = "collected";
      if (status === "returned") found.paymentStatus = "refunded";
      found.timeline.push({ id: adminId("evt"), at: nowIso(), status, label: `Statut mis à jour` });
      return found;
    });
    logActivity({
      action: "status_change",
      resourceType: "order",
      resourceId: id,
      details: `Commande ${order.orderNumber} → ${status}`,
    });
    return delay(clone(order));
  }

  async updatePaymentStatus(id: string, status: AdminOrder["paymentStatus"]): Promise<AdminOrder> {
    const order = mutateDb((db) => {
      const found = db.orders.find((item) => item.id === id);
      if (!found) throw new Error("Commande introuvable.");
      found.paymentStatus = status;
      found.updatedAt = nowIso();
      return found;
    });
    return delay(clone(order));
  }

  async addNote(id: string, body: string): Promise<AdminOrder> {
    const order = mutateDb((db) => {
      const found = db.orders.find((item) => item.id === id);
      if (!found) throw new Error("Commande introuvable.");
      found.notes.unshift({ id: adminId("note"), at: nowIso(), author: "Hana Ben Salah", body });
      return found;
    });
    return delay(clone(order));
  }
}

function statsFor(orders: AdminOrder[]): CustomerStats {
  const delivered = orders.filter((order) => order.status === "delivered");
  const totalSpentMinor = delivered.reduce((total, order) => total + order.subtotalMinor, 0);
  const last = orders
    .map((order) => order.createdAt)
    .sort()
    .at(-1);
  return {
    orderCount: orders.length,
    deliveredCount: delivered.length,
    totalSpentMinor,
    averageOrderValueMinor:
      delivered.length > 0 ? Math.round(totalSpentMinor / delivered.length) : 0,
    ...(last ? { lastOrderAt: last } : {}),
  };
}

export class MockAdminCustomerRepository implements AdminCustomerRepository {
  async list() {
    const db = getDb();
    return delay(
      clone(db.customers).map((customer) => ({
        ...customer,
        stats: statsFor(db.orders.filter((order) => order.customerId === customer.id)),
      })),
    );
  }

  async getById(id: string) {
    const db = getDb();
    const customer = db.customers.find((item) => item.id === id);
    if (!customer) return delay(null);
    const orders = clone(db.orders.filter((order) => order.customerId === id));
    return delay({ ...clone(customer), stats: statsFor(orders), orders });
  }

  async update(id: string, input: Partial<AdminCustomer>): Promise<AdminCustomer> {
    const updated = mutateDb((db) => {
      const index = db.customers.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Client introuvable.");
      const next = { ...(db.customers[index] as AdminCustomer), ...clone(input), id };
      db.customers[index] = next;
      return next;
    });
    return delay(clone(updated));
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
  async metrics(): Promise<DashboardMetrics> {
    const db = getDb();
    const orders = db.orders;
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
