/**
 * Modèle de données du back-office (mock).
 * Tous les montants sont stockés en millimes (1 DT = 1000 millimes).
 * Le backend futur devient la source de vérité de ces structures.
 */

export type ProductPublicationStatus = "draft" | "published" | "archived";

/** Clés de catégorie partagées avec le catalogue public (`src/domain/product`). */
export type AdminProductCategoryKey =
  | "rideaux"
  | "voilages"
  | "stores"
  | "coussins"
  | "galettes_de_chaise"
  | "accessoires"
  | "mobilier_interieur"
  | "plantes_decoration";

export const ADMIN_PRODUCT_CATEGORY_LABELS: Record<AdminProductCategoryKey, string> = {
  rideaux: "Rideaux",
  voilages: "Voilages",
  stores: "Stores",
  coussins: "Coussins",
  galettes_de_chaise: "Galettes de chaise",
  accessoires: "Accessoires",
  mobilier_interieur: "Mobilier d'intérieur",
  plantes_decoration: "Plantes et décoration",
};

/** Valeur d'un champ spécifique de catégorie (data-driven). */
export type AdminAttributeValueInput = string | number | boolean | string[];

export interface AdminProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  isPrimary: boolean;
  storagePath?: string;
  publicUrl?: string;
  type?: "front" | "lifestyle" | "fabric_detail" | "header_detail" | "mechanism_detail";
  colorId?: string;
  variantId?: string;
}

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
  isDefault?: boolean;
  /** Axes de variante spécifiques à la catégorie (data-driven). */
  options?: Record<string, string | number>;
  packQuantity?: number;
  /** Faux pour les produits sans suivi de stock (sur devis, services). */
  trackInventory?: boolean;
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
  /** Catégorie fonctionnelle partagée avec le frontend public. */
  category?: AdminProductCategoryKey;
  /** Champs spécifiques à la catégorie. */
  attributes?: Record<string, AdminAttributeValueInput>;
  imageAssets?: AdminProductImage[];
  seoIndexable?: boolean;
  seoOgImageUrl?: string;
  packContent?: string;
  packQuantity?: number;
  perMeter?: {
    pricePerMeterMinor: number;
    minLengthCm: number;
    maxLengthCm: number;
    stepCm: number;
  };
  customQuoteEnabled?: boolean;
  /** Publication dans les sélections de la page d'accueil. */
  isNew?: boolean;
  isBestSeller?: boolean;
  /** Promotion éditoriale ; les prix remisés restent portés par les variantes. */
  isOnSale?: boolean;
  isFeatured?: boolean;
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
  imageMediaAssetId?: string;
  seoTitle: string;
  seoDescription: string;
  showInNavigation?: boolean;
}

export type AdminAttributeFieldType =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "multiselect"
  | "single_select"
  | "multi_select"
  | "color"
  | "measurement";

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
  /** Catégories concernées ; vide = toutes. */
  /** Category slugs; empty means the attribute applies to every category. */
  categories?: string[];
  isRequired?: boolean;
  isActive?: boolean;
  /** Attribut nécessaire au frontend public : suppression interdite. */
  isSystem?: boolean;
}

export type StockAdjustmentMode = "increase" | "decrease" | "set";

export type StockMovementReason =
  | "order_confirmation"
  | "order_cancellation"
  | "purchase"
  | "sale_correction"
  | "customer_return"
  | "damaged"
  | "inventory_correction"
  | "manual_adjustment"
  | "other";

export interface StockMovement {
  id: string;
  variantId: string;
  productId: string;
  type: StockAdjustmentMode;
  quantity: number;
  reason: string;
  note?: string;
  previousStock?: number;
  resultingStock?: number;
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

/** Statut des frais de livraison : connus, ou à confirmer (mobilier, plantes…). */
export type AdminShippingStatus = "calculated" | "to_confirm";

/** Profil logistique Admin (mappé depuis les profils publics). */
export type AdminShippingProfile = "standard" | "fragile" | "bulky" | "oversized";

/** Option affichable figée au moment de la commande. */
export interface AdminOrderItemOption {
  label: string;
  value: string;
}

export interface AdminOrderItem {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  /** Snapshots additifs — immuables après création de la commande. */
  productReference?: string;
  productSlug?: string;
  imageUrl?: string;
  selectedOptions?: AdminOrderItemOption[];
  sellingUnitLabel?: string;
  shippingProfile?: AdminShippingProfile;
  eligibleForFreeShipping?: boolean;
  /** Faux pour les articles sans suivi de stock (sur devis, made to order). */
  trackInventory?: boolean;
}

export type AdminOrderEventKind =
  | "created"
  | "status"
  | "payment"
  | "shipping_fee"
  | "shipment"
  | "address"
  | "contact"
  | "note"
  | "inventory";

export interface AdminOrderEvent {
  id: string;
  at: string;
  status: AdminOrderStatus;
  label: string;
  userId?: string;
  /** Historique enrichi (append-only). */
  kind?: AdminOrderEventKind;
  fromStatus?: AdminOrderStatus;
  toStatus?: AdminOrderStatus;
  reason?: string;
  note?: string;
  summary?: string;
  userName?: string;
}

export interface AdminOrderNote {
  id: string;
  at: string;
  author: string;
  body: string;
  userId?: string;
}

export interface AdminShipmentInfo {
  carrierName?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  shippingFeeMinor?: number;
  shippingStatus: AdminShippingStatus;
  internalInstructions?: string;
}

/** Idempotence des mouvements de stock liés à une commande. */
export interface AdminOrderInventoryState {
  deductedAt?: string;
  restoredAt?: string;
  deductionMovementIds?: string[];
  restorationMovementIds?: string[];
}

export interface AdminOrderReturnInfo {
  id?: string;
  status?: "requested" | "accepted" | "refused";
  requestedAt?: string;
  reason?: string;
  note?: string;
  resolvedAt?: string;
  resolution?: "accepted" | "refused";
  restocked?: boolean;
  refundPayment?: boolean;
  conditionReason?: string;
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
  postalCode?: string;
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
  /** Champs additifs de la phase Admin 3. */
  shipment?: AdminShipmentInfo;
  inventoryState?: AdminOrderInventoryState;
  cancellationReason?: string;
  returnInfo?: AdminOrderReturnInfo;
}

export interface AdminOrderContact {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}

export interface AdminOrderAddress {
  governorate: string;
  city: string;
  postalCode?: string;
  addressLine: string;
  landmark?: string;
  deliveryNote?: string;
}

export interface AdminCustomerAddress {
  id: string;
  label?: string;
  governorate: string;
  city: string;
  postalCode?: string;
  addressLine: string;
  landmark?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCustomerNote {
  id: string;
  text: string;
  createdAt: string;
  userId?: string;
  userName?: string;
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
  /** Champs additifs de la phase Admin 3. */
  notes?: AdminCustomerNote[];
  preferredChannel?: "phone" | "email" | "whatsapp";
  mergedIntoCustomerId?: string;
  mergedAt?: string;
  updatedAt?: string;
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
  status: "draft" | "published" | "archived";
  body: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
  version?: number;
  publishedAt?: string | null;
  blocks?: AdminEditorialBlock[];
}

export interface AdminEditorialBlock {
  id?: string;
  sortOrder: number;
  blockType: string;
  payload: Record<string, unknown>;
  media?: { id: string; publicUrl: string; alt: string } | null;
}

export interface AdminArticleRevision {
  id: string;
  status: "draft" | "published" | "archived";
  version: number;
  title: string;
  excerpt: string;
  bodyBlocks: Array<Record<string, unknown>>;
  cover: {
    id?: string;
    publicUrl: string;
    alt: string;
    width: number | null;
    height: number | null;
  } | null;
  readingTimeMinutes: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminArticle {
  id: string;
  slug: string;
  status: "draft" | "published" | "archived";
  category: { id: string; slug: string; name: string; description: string; sortOrder: number };
  isFeatured: boolean;
  homeSortOrder: number;
  authorName: string;
  publishedAt: string | null;
  updatedAt: string;
  version: number;
  draft: AdminArticleRevision | null;
  published: AdminArticleRevision | null;
}

export interface AdminMedia {
  id: string;
  name: string;
  url: string;
  storagePath?: string;
  alt: string;
  width: number | null;
  height: number | null;
  mimeType: string;
  status: "draft" | "active" | "archived";
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
  /** Version renvoyée par l’API pour éviter les écrasements concurrents. */
  version?: number;
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
  /** Un utilisateur peut cumuler plusieurs rôles persistés. */
  roles?: AdminRoleId[];
  status?: "invited" | "active" | "suspended" | "revoked";
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
  outcome?: "success" | "denied" | "failure";
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
