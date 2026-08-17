import { z } from "zod";
import { CART_STORAGE_KEY, CART_STORAGE_VERSION } from "@/domain/cart/cart.constants";
import { CartError } from "@/domain/cart/cart.errors";
import type { PersistedCart, PersistedCartItem } from "@/domain/cart/cart.types";
import { migratePersistedCart } from "@/repositories/local/cart-migrations";

const persistedItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
  priceAtAddMinor: z.number().int().nonnegative(),
  addedAt: z.string().min(1),
});

export const persistedCartSchema = z.object({
  version: z.literal(CART_STORAGE_VERSION),
  updatedAt: z.string().min(1),
  items: z.array(persistedItemSchema),
});

export function createEmptyPersistedCart(): PersistedCart {
  return { version: CART_STORAGE_VERSION, updatedAt: new Date().toISOString(), items: [] };
}

/** Supprime les doublons éventuels en fusionnant les quantités. */
export function dedupeItems(items: PersistedCartItem[]): PersistedCartItem[] {
  const byLine = new Map<string, PersistedCartItem>();
  for (const item of items) {
    const key = `${item.productId}:${item.variantId}`;
    const existing = byLine.get(key);
    if (existing) {
      byLine.set(key, { ...existing, quantity: existing.quantity + item.quantity });
    } else {
      byLine.set(key, { ...item });
    }
  }
  return [...byLine.values()];
}

/** Analyse une chaîne brute et renvoie toujours un panier valide. */
export function parsePersistedCart(raw: string | null): PersistedCart {
  if (!raw) return createEmptyPersistedCart();
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return createEmptyPersistedCart();
  }

  const migrated = migratePersistedCart(json);
  const parsed = persistedCartSchema.safeParse(migrated);
  if (!parsed.success) return createEmptyPersistedCart();

  return { ...parsed.data, items: dedupeItems(parsed.data.items) };
}

function getStorage(): Storage {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new CartError("storage_unavailable", "localStorage indisponible");
  }
  return window.localStorage;
}

export function isStorageAvailable(): boolean {
  try {
    const storage = getStorage();
    const probe = `${CART_STORAGE_KEY}-probe`;
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function readPersistedCart(): PersistedCart {
  try {
    return parsePersistedCart(getStorage().getItem(CART_STORAGE_KEY));
  } catch (error) {
    if (error instanceof CartError) throw error;
    return createEmptyPersistedCart();
  }
}

export function writePersistedCart(items: PersistedCartItem[]): PersistedCart {
  const cart: PersistedCart = {
    version: CART_STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    items: dedupeItems(items).filter((item) => item.quantity > 0),
  };
  try {
    getStorage().setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    if (error instanceof CartError) throw error;
    throw new CartError("storage_write_failed", "Écriture du panier impossible");
  }
  return cart;
}
