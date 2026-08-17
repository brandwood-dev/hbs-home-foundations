import type { Cart } from "@/domain/cart/cart.types";
import { CartError } from "@/domain/cart/cart.errors";
import type { Product } from "@/domain/product/product.types";
import type { AddCartItemInput, CartRepository } from "@/repositories/interfaces/CartRepository";
import type { ProductRepository } from "@/repositories/interfaces/ProductRepository";
import {
  readPersistedCart,
  writePersistedCart,
} from "@/repositories/local/cart-storage";
import { buildCart, reconcilePersistedItems } from "@/services/cart/cart-reconciliation";
import {
  addItemToItems,
  maxQuantityForVariant,
  removeItemFromItems,
  updateItemQuantity,
} from "@/services/cart/cart.service";
import { parseCartLineId } from "@/services/cart/cart-calculations";

/**
 * Panier persisté dans le stockage local du navigateur.
 * Les données produit ne sont jamais dupliquées : elles proviennent du ProductRepository.
 */
export class LocalCartRepository implements CartRepository {
  constructor(private readonly products: ProductRepository) {}

  private async productsById(ids: string[]): Promise<Map<string, Product>> {
    const unique = [...new Set(ids)];
    const found = await this.products.getByIds(unique);
    return new Map(found.map((product) => [product.id, product]));
  }

  async getCart(): Promise<Cart> {
    const persisted = readPersistedCart();
    const map = await this.productsById(persisted.items.map((item) => item.productId));
    const reconciled = reconcilePersistedItems(persisted.items, map);

    const changed =
      reconciled.length !== persisted.items.length ||
      reconciled.some((item, index) => item.quantity !== persisted.items[index]?.quantity);
    if (changed) writePersistedCart(reconciled);

    return buildCart(reconciled, map);
  }

  async addItem(input: AddCartItemInput): Promise<Cart> {
    const product = await this.products.getById(input.productId);
    if (!product) throw new CartError("product_not_found", "Produit introuvable");

    const persisted = readPersistedCart();
    const { items } = addItemToItems(persisted.items, product, input.variantId, input.quantity);
    const saved = writePersistedCart(items);
    const map = await this.productsById(saved.items.map((item) => item.productId));
    return buildCart(saved.items, map);
  }

  async updateItem(lineId: string, quantity: number): Promise<Cart> {
    const parsed = parseCartLineId(lineId);
    if (!parsed) throw new CartError("line_not_found", "Ligne introuvable");

    const product = await this.products.getById(parsed.productId);
    const max = product ? maxQuantityForVariant(product, parsed.variantId) : 0;

    const persisted = readPersistedCart();
    const items = updateItemQuantity(persisted.items, lineId, quantity, max);
    const saved = writePersistedCart(items);
    const map = await this.productsById(saved.items.map((item) => item.productId));
    return buildCart(saved.items, map);
  }

  async removeItem(lineId: string): Promise<Cart> {
    const persisted = readPersistedCart();
    const saved = writePersistedCart(removeItemFromItems(persisted.items, lineId));
    const map = await this.productsById(saved.items.map((item) => item.productId));
    return buildCart(saved.items, map);
  }

  async clearCart(): Promise<Cart> {
    writePersistedCart([]);
    return buildCart([], new Map());
  }
}
