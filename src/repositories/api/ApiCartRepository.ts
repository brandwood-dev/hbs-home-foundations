import type { Cart, CartItemStatus, ResolvedCartItem } from "@/domain/cart/cart.types";
import type {
  ProductAvailability,
  ProductCategory,
  ShippingProfile,
} from "@/domain/product/product.types";
import { HbsApiClient } from "@/api/client";
import type { AddCartItemInput, CartRepository } from "@/repositories/interfaces/CartRepository";

interface ApiCartLine {
  lineId: string;
  productId: string;
  productSlug: string;
  productName: string;
  productReference: string;
  variantId: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
  compareAtPriceMinor: number | null;
  lineTotalMinor: number;
  priceAtAddMinor: number;
  priceChanged: boolean;
  imageUrl: string;
  imageAlt: string;
  category: string;
  colorLabel: string | null;
  widthCm: number | null;
  heightCm: number | null;
  selectedOptions: { label: string; value: string }[];
  sellingUnitLabel: string;
  shippingProfile: string | null;
  availability: string;
  availableQuantity: number;
  status: string;
  canPurchase: boolean;
}

interface ApiCartPromotion {
  code: string;
  valid: boolean;
  discountMinor: number;
  discountType: "percentage" | "fixed_amount" | null;
  discountValue: number | null;
  reason: "minimum_subtotal" | "expired" | "usage_limit" | "inactive" | null;
}

interface ApiCartResponse {
  cartId: string;
  currency: "TND";
  expiresAt: string;
  items: ApiCartLine[];
  itemCount: number;
  lineCount: number;
  totals: {
    subtotalMinor: number;
    discountMinor: number;
    shippingMinor: number;
    totalEstimatedMinor: number;
    freeShippingThresholdMinor: number;
    amountUntilFreeShippingMinor: number;
    hasFreeShipping: boolean;
    requiresShippingQuote: boolean;
  };
  promotion: ApiCartPromotion | null;
  hasUnavailableItems: boolean;
  hasPriceChanges: boolean;
}

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

function availability(value: string): ProductAvailability {
  const values: readonly ProductAvailability[] = [
    "in_stock",
    "low_stock",
    "out_of_stock",
    "made_to_order",
  ];
  return values.includes(value as ProductAvailability)
    ? (value as ProductAvailability)
    : "out_of_stock";
}

function shippingProfile(value: string | null): ShippingProfile | undefined {
  if (
    value === "standard" ||
    value === "fragile" ||
    value === "volumineux" ||
    value === "hors_norme"
  )
    return value;
  return undefined;
}

function status(value: string): CartItemStatus {
  const values: readonly CartItemStatus[] = [
    "available",
    "low_stock",
    "out_of_stock",
    "variant_missing",
    "product_missing",
    "price_changed",
    "quantity_adjusted",
  ];
  return values.includes(value as CartItemStatus) ? (value as CartItemStatus) : "product_missing";
}

function mapCart(response: ApiCartResponse): Cart {
  const items: ResolvedCartItem[] = response.items.map((item) => {
    const profile = shippingProfile(item.shippingProfile);
    return {
      lineId: item.lineId,
      productId: item.productId,
      productSlug: item.productSlug,
      productName: item.productName,
      productReference: item.productReference,
      variantId: item.variantId,
      sku: item.sku,
      quantity: item.quantity,
      unitPriceMinor: item.unitPriceMinor,
      ...(item.compareAtPriceMinor !== null
        ? { compareAtPriceMinor: item.compareAtPriceMinor }
        : {}),
      lineTotalMinor: item.lineTotalMinor,
      priceAtAddMinor: item.priceAtAddMinor,
      priceChanged: item.priceChanged,
      imageUrl: item.imageUrl,
      imageAlt: item.imageAlt,
      category: category(item.category),
      ...(item.colorLabel ? { colorLabel: item.colorLabel } : {}),
      ...(item.widthCm !== null ? { widthCm: item.widthCm } : {}),
      ...(item.heightCm !== null ? { heightCm: item.heightCm } : {}),
      ...(item.selectedOptions.length > 0 ? { selectedOptions: item.selectedOptions } : {}),
      sellingUnitLabel: item.sellingUnitLabel,
      ...(profile ? { shippingProfile: profile } : {}),
      availability: availability(item.availability),
      availableQuantity: item.availableQuantity,
      status: status(item.status),
      canPurchase: item.canPurchase,
    };
  });

  return {
    items,
    itemCount: response.itemCount,
    lineCount: response.lineCount,
    totals: {
      subtotalMinor: response.totals.subtotalMinor,
      shippingMinor: response.totals.shippingMinor,
      totalEstimatedMinor: response.totals.totalEstimatedMinor,
      freeShippingThresholdMinor: response.totals.freeShippingThresholdMinor,
      amountUntilFreeShippingMinor: response.totals.amountUntilFreeShippingMinor,
      hasFreeShipping: response.totals.hasFreeShipping,
      requiresShippingQuote: response.totals.requiresShippingQuote,
      ...(response.totals.discountMinor > 0
        ? { discountMinor: response.totals.discountMinor }
        : {}),
    },
    hasUnavailableItems: response.hasUnavailableItems,
    hasPriceChanges: response.hasPriceChanges,
    ...(response.promotion ? { promotion: response.promotion } : {}),
  };
}

export class ApiCartRepository implements CartRepository {
  constructor(private readonly apiClient: HbsApiClient = new HbsApiClient()) {}

  async getCart(): Promise<Cart> {
    return mapCart(await this.apiClient.get<ApiCartResponse>("/api/v1/cart"));
  }

  async addItem(input: AddCartItemInput): Promise<Cart> {
    return mapCart(await this.apiClient.post<ApiCartResponse>("/api/v1/cart/items", input));
  }

  async updateItem(lineId: string, quantity: number): Promise<Cart> {
    return mapCart(
      await this.apiClient.patch<ApiCartResponse>(
        `/api/v1/cart/items/${encodeURIComponent(lineId)}`,
        { quantity },
      ),
    );
  }

  async removeItem(lineId: string): Promise<Cart> {
    return mapCart(
      await this.apiClient.delete<ApiCartResponse>(
        `/api/v1/cart/items/${encodeURIComponent(lineId)}`,
      ),
    );
  }

  async clearCart(): Promise<Cart> {
    return mapCart(await this.apiClient.delete<ApiCartResponse>("/api/v1/cart"));
  }

  async applyPromotion(code: string): Promise<Cart> {
    return mapCart(
      await this.apiClient.post<ApiCartResponse>("/api/v1/cart/promotion", {
        code: code.trim(),
      }),
    );
  }

  async removePromotion(): Promise<Cart> {
    return mapCart(await this.apiClient.delete<ApiCartResponse>("/api/v1/cart/promotion"));
  }
}
