/**
 * Modèle de données du back-office (mock).
 * Tous les montants sont stockés en millimes (1 DT = 1000 millimes).
 * Le backend futur devient la source de vérité de ces structures.
 */

export type ProductPublicationStatus = "draft" | "published" | "archived";

export type AdminSellingMode =
  "single_panel" | "pair" | "pack" | "per_meter" | "ready_made" | "custom_quote" | "accessory";

export type AdminAvailability = "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";

export interface AdminVariant {
  id: string;
  sku: string;
  colorId: string;
  colorLabel: string;
  widthCm: number;
  heightCm: number;
  curtainHeader: string;
  eyeletColor?: string;
  lining?: string;
  priceMinor: number;
  compareAtPriceMinor?: number;
  costMinor?: number;
  stock: number;
  lowStockThreshold: number;
  availability: AdminAvailability;
  imageUrl?: string;
  isActive: boolean;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  reference: string;
  categoryId: string;
  subCategoryId?: string;
  sellingMode: AdminSellingMode;
  shortDescription: string;
  longDescription: string;
  brand?: string;
  tags: string[];
  rooms: string[];
  style?: string;
  material?: string;
  opacityLevel?: string;
  status: ProductPublicationStatus;
  imageUrl?: string;
  images: string[];
  variants: AdminVariant[];
  seoTitle: string;
  seoDescription: string;
  promoStartAt?: string;
  promoEndAt?: string;
  publicSlug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  description: string;
  imageUrl?: string;
  seoTitle: string;
  seoDescription: string;
}

export type AdminAttributeFieldType = "select" | "multiselect" | "color" | "number" | "boolean";

export interface AdminAttributeValue {
  id: string;
  label: string;
  slug: string;
  hex?: string;
  family?: string;
  order: number;
  isActive: boolean;
}

export interface AdminAttribute {
  id: string;
  name: string;
  key: string;
  fieldType: AdminAttributeFieldType;
  isFilterable: boolean;
  isVariantAxis: boolean;
  order: number;
  values: AdminAttributeValue[];
}

export interface StockMovement {
  id: string;
  variantId: string;
  productId: string;
  type: "increase" | "decrease" | "set";
  quantity: number;
  reason: string;
  createdAt: string;
  userId?: string;
}

export type AdminOrderStatus =
  | "received"
  | "pending_confirmation"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "returned";

export type AdminPaymentStatus = "pending" | "collected" | "refunded";

export interface AdminOrderItem {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
}

export interface AdminOrderEvent {
  id: string;
  at: string;
  status: AdminOrderStatus;
  label: string;
  userId?: string;
}

export interface AdminOrderNote {
  id: string;
  at: string;
  author: string;
  body: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: AdminOrderStatus;
  paymentStatus: AdminPaymentStatus;
  paymentMethod: "cash_on_delivery";
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryMethod: "home_delivery" | "store_pickup";
  governorate: string;
  city: string;
  addressLine: string;
  landmark?: string;
  deliveryNote?: string;
  items: AdminOrderItem[];
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  totalMinor: number;
  timeline: AdminOrderEvent[];
  notes: AdminOrderNote[];
}

export interface AdminCustomerAddress {
  id: string;
  governorate: string;
  city: string;
  addressLine: string;
  landmark?: string;
}

export interface AdminCustomer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  governorate: string;
  tags: string[];
  internalNotes: string;
  addresses: AdminCustomerAddress[];
  createdAt: string;
}

export type PromotionType = "automatic" | "coupon";
export type DiscountType = "percentage" | "fixed_amount" | "free_shipping";

export interface AdminPromotion {
  id: string;
  name: string;
  code?: string;
  type: PromotionType;
  discountType: DiscountType;
  /** Pourcentage (1-100) ou montant en millimes selon `discountType`. */
  value: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  minimumOrderMinor: number;
  productIds: string[];
  categoryIds: string[];
  usageLimit?: number;
  usageCount: number;
  priority: number;
  isStackable: boolean;
}

export interface AdminContentSection {
  id: string;
  key: string;
  label: string;
  isEnabled: boolean;
  order: number;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  productIds: string[];
  categoryIds: string[];
}

export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
  isHighlighted: boolean;
  parentId?: string;
  group: "main" | "footer";
}

export interface AdminEditorialPage {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  body: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
}

export interface AdminMedia {
  id: string;
  name: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  mimeType: string;
  createdAt: string;
  usage: string;
}

export interface AdminContent {
  homeSections: AdminContentSection[];
  navigation: AdminNavItem[];
  pages: AdminEditorialPage[];
  media: AdminMedia[];
}

export interface AdminSettings {
  store: {
    name: string;
    currency: string;
    language: string;
    timezone: string;
    address: string;
  };
  shipping: {
    standardFeeMinor: number;
    freeShippingThresholdMinor: number;
    estimatedDeliveryLabel: string;
    storePickupEnabled: boolean;
    pickupAddress: string;
  };
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
    openingHours: string;
  };
  social: { facebook: string; instagram: string; tiktok: string };
  seo: { defaultTitle: string; defaultDescription: string; ogImageUrl: string };
  features: {
    checkout: boolean;
    favorites: boolean;
    reviews: boolean;
    customMade: boolean;
    professionals: boolean;
    orderTracking: boolean;
    customerAccounts: boolean;
    onlinePayment: boolean;
  };
}

export type AdminRoleId =
  "super_admin" | "catalog_manager" | "orders_manager" | "content_editor" | "read_only";

export type AdminPermission =
  | "dashboard.read"
  | "products.read"
  | "products.create"
  | "products.update"
  | "products.delete"
  | "categories.manage"
  | "attributes.manage"
  | "inventory.manage"
  | "orders.read"
  | "orders.update"
  | "customers.read"
  | "promotions.manage"
  | "content.manage"
  | "settings.manage"
  | "users.manage"
  | "audit.read";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: AdminRoleId;
  isActive: boolean;
  createdAt: string;
  lastSeenAt?: string;
}

export type AuditAction = "create" | "update" | "delete" | "status_change" | "adjustment";

export interface AdminAuditLog {
  id: string;
  at: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  details: string;
}

export interface AdminMockDatabase {
  version: 1;
  products: AdminProduct[];
  categories: AdminCategory[];
  attributes: AdminAttribute[];
  stockMovements: StockMovement[];
  orders: AdminOrder[];
  customers: AdminCustomer[];
  promotions: AdminPromotion[];
  content: AdminContent;
  settings: AdminSettings;
  users: AdminUser[];
  auditLogs: AdminAuditLog[];
}
