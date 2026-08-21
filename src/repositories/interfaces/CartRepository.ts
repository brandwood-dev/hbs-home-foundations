import type { Cart } from "@/domain/cart/cart.types";

export interface AddCartItemInput {
  productId: string;
  variantId: string;
  quantity: number;
}

/**
 * Contrat unique du panier. Le futur ApiCartRepository devra l'implémenter
 * à l'identique pour que l'interface utilisateur reste inchangée.
 */
export interface CartRepository {
  getCart(): Promise<Cart>;
  addItem(input: AddCartItemInput): Promise<Cart>;
  updateItem(lineId: string, quantity: number): Promise<Cart>;
  removeItem(lineId: string): Promise<Cart>;
  clearCart(): Promise<Cart>;
  applyPromotion(code: string): Promise<Cart>;
  removePromotion(): Promise<Cart>;
}
