import {
  HEADER_LABELS,
  LINING_LABELS,
  EYELET_COLOR_LABELS,
  SELLING_MODE_LABELS,
} from "@/domain/product/product.constants";
import type {
  Cart,
  CartItemStatus,
  PersistedCartItem,
  ResolvedCartItem,
} from "@/domain/cart/cart.types";
import type { Product, ProductVariant } from "@/domain/product/product.types";
import {
  calculateCartItemCount,
  calculateCartLineTotal,
  calculateCartTotals,
  createCartLineId,
} from "@/services/cart/cart-calculations";

const MISSING_IMAGE_ALT = "Article indisponible";

function unavailableLine(
  item: PersistedCartItem,
  status: Extract<CartItemStatus, "product_missing" | "variant_missing">,
  product?: Product,
): ResolvedCartItem {
  return {
    lineId: createCartLineId(item.productId, item.variantId),
    productId: item.productId,
    productSlug: product?.slug ?? "",
    productName: product?.name ?? "Article indisponible",
    productReference: product?.reference ?? "",
    variantId: item.variantId,
    sku: "",
    quantity: item.quantity,
    unitPriceMinor: 0,
    lineTotalMinor: 0,
    priceAtAddMinor: item.priceAtAddMinor,
    priceChanged: false,
    imageUrl: product?.images[0]?.url ?? "",
    imageAlt: product?.imageAlt ?? MISSING_IMAGE_ALT,
    sellingUnitLabel: product ? SELLING_MODE_LABELS[product.sellingMode] : "—",
    availability: "out_of_stock",
    availableQuantity: 0,
    status,
    canPurchase: false,
  };
}

function variantImage(product: Product, variant: ProductVariant) {
  const byId = new Map(product.images.map((image) => [image.id, image]));
  const first = variant.imageIds.map((id) => byId.get(id)).find((image) => image != null);
  return {
    url: first?.url ?? variant.imageUrl ?? product.images[0]?.url ?? "",
    alt: first?.alt ?? product.imageAlt,
  };
}

/** Résout une ligne persistée à partir de l'état actuel du catalogue. */
export function resolveCartItem(item: PersistedCartItem, product: Product | null): ResolvedCartItem {
  if (!product) return unavailableLine(item, "product_missing");

  const variant = product.variants.find((candidate) => candidate.id === item.variantId);
  if (!variant) return unavailableLine(item, "variant_missing", product);

  const outOfStock = variant.availability === "out_of_stock";
  const maxQuantity = outOfStock ? 0 : Math.max(1, variant.availableQuantity || 1);
  const quantity = outOfStock ? item.quantity : Math.min(item.quantity, maxQuantity);
  const adjusted = !outOfStock && quantity !== item.quantity;

  const unitPriceMinor = variant.price.amountMinor;
  const priceChanged = item.priceAtAddMinor > 0 && item.priceAtAddMinor !== unitPriceMinor;

  let status: CartItemStatus = "available";
  if (outOfStock) status = "out_of_stock";
  else if (adjusted) status = "quantity_adjusted";
  else if (priceChanged) status = "price_changed";
  else if (variant.availability === "low_stock") status = "low_stock";

  const color = product.colors.find((candidate) => candidate.id === variant.colorId);
  const image = variantImage(product, variant);

  return {
    lineId: createCartLineId(product.id, variant.id),
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
    productReference: product.reference,
    variantId: variant.id,
    sku: variant.sku,
    quantity,
    unitPriceMinor,
    ...(variant.compareAtPrice && variant.compareAtPrice.amountMinor > unitPriceMinor
      ? { compareAtPriceMinor: variant.compareAtPrice.amountMinor }
      : {}),
    lineTotalMinor: calculateCartLineTotal(unitPriceMinor, quantity),
    priceAtAddMinor: item.priceAtAddMinor,
    priceChanged,
    imageUrl: image.url,
    imageAlt: image.alt,
    ...(color ? { colorLabel: color.name } : {}),
    widthCm: variant.widthCm,
    heightCm: variant.heightCm,
    curtainHeaderLabel: HEADER_LABELS[variant.curtainHeader],
    ...(variant.eyeletColor ? { eyeletColorLabel: EYELET_COLOR_LABELS[variant.eyeletColor] } : {}),
    liningLabel: LINING_LABELS[variant.lining],
    sellingUnitLabel: SELLING_MODE_LABELS[product.sellingMode],
    availability: variant.availability,
    availableQuantity: outOfStock ? 0 : maxQuantity,
    status,
    canPurchase: !outOfStock,
  };
}

export function buildCart(
  items: PersistedCartItem[],
  productsById: Map<string, Product>,
): Cart {
  const resolved = items.map((item) => resolveCartItem(item, productsById.get(item.productId) ?? null));
  const purchasable = resolved.filter((item) => item.canPurchase);

  return {
    items: resolved,
    itemCount: calculateCartItemCount(purchasable),
    lineCount: resolved.length,
    totals: calculateCartTotals(purchasable),
    hasUnavailableItems: resolved.some((item) => !item.canPurchase),
    hasPriceChanges: resolved.some((item) => item.priceChanged),
  };
}

/** Lignes persistées corrigées après réconciliation (quantités ajustées, lignes fantômes). */
export function reconcilePersistedItems(
  items: PersistedCartItem[],
  productsById: Map<string, Product>,
): PersistedCartItem[] {
  return items.map((item) => {
    const product = productsById.get(item.productId);
    const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
    if (!variant || variant.availability === "out_of_stock") return item;
    const max = Math.max(1, variant.availableQuantity || 1);
    return item.quantity > max ? { ...item, quantity: max } : item;
  });
}

export function emptyCart(): Cart {
  return buildCart([], new Map());
}
