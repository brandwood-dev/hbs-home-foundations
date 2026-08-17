import { MAX_CART_LINE_QUANTITY } from "@/domain/cart/cart.constants";
import { CartError } from "@/domain/cart/cart.errors";
import type { PersistedCartItem } from "@/domain/cart/cart.types";
import type { Product } from "@/domain/product/product.types";
import { createCartLineId } from "@/services/cart/cart-calculations";

/** Règles métier du panier, pures et indépendantes du stockage. */

export function maxQuantityForVariant(product: Product, variantId: string): number {
  const variant = product.variants.find((candidate) => candidate.id === variantId);
  if (!variant || variant.availability === "out_of_stock") return 0;
  const stock = variant.availableQuantity > 0 ? variant.availableQuantity : MAX_CART_LINE_QUANTITY;
  return Math.min(stock, MAX_CART_LINE_QUANTITY);
}

export interface AddItemResult {
  items: PersistedCartItem[];
  /** true quand la quantité demandée a dû être réduite au stock disponible. */
  adjusted: boolean;
  finalQuantity: number;
}

export function addItemToItems(
  items: PersistedCartItem[],
  product: Product,
  variantId: string,
  quantity: number,
  now: string = new Date().toISOString(),
): AddItemResult {
  const variant = product.variants.find((candidate) => candidate.id === variantId);
  if (!variant) throw new CartError("variant_not_found", "Variante introuvable");
  if (variant.availability === "out_of_stock") {
    throw new CartError("variant_unavailable", "Variante indisponible");
  }

  const requested = Math.trunc(quantity);
  if (!Number.isFinite(requested) || requested < 1) {
    throw new CartError("invalid_quantity", "Quantité invalide");
  }

  const max = maxQuantityForVariant(product, variantId);
  const lineId = createCartLineId(product.id, variantId);
  const next = [...items];
  const index = next.findIndex(
    (item) => createCartLineId(item.productId, item.variantId) === lineId,
  );

  const existingQuantity = index >= 0 ? (next[index] as PersistedCartItem).quantity : 0;
  const wanted = existingQuantity + requested;
  const finalQuantity = Math.min(wanted, max);

  if (index >= 0) {
    const existing = next[index] as PersistedCartItem;
    next[index] = { ...existing, quantity: finalQuantity };
  } else {
    next.push({
      productId: product.id,
      variantId,
      quantity: finalQuantity,
      priceAtAddMinor: variant.price.amountMinor,
      addedAt: now,
    });
  }

  return { items: next, adjusted: finalQuantity < wanted, finalQuantity };
}

export function updateItemQuantity(
  items: PersistedCartItem[],
  lineId: string,
  quantity: number,
  maxQuantity: number,
): PersistedCartItem[] {
  const index = items.findIndex(
    (item) => createCartLineId(item.productId, item.variantId) === lineId,
  );
  if (index < 0) throw new CartError("line_not_found", "Ligne introuvable");

  const requested = Math.trunc(quantity);
  if (!Number.isFinite(requested)) throw new CartError("invalid_quantity", "Quantité invalide");
  if (requested < 1) return items.filter((_, position) => position !== index);

  const upper = Math.max(1, Math.min(maxQuantity || MAX_CART_LINE_QUANTITY, MAX_CART_LINE_QUANTITY));
  const next = [...items];
  const existing = next[index] as PersistedCartItem;
  next[index] = { ...existing, quantity: Math.min(requested, upper) };
  return next;
}

export function removeItemFromItems(
  items: PersistedCartItem[],
  lineId: string,
): PersistedCartItem[] {
  return items.filter((item) => createCartLineId(item.productId, item.variantId) !== lineId);
}
