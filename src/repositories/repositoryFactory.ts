import { MockProductRepository } from "@/repositories/mock/MockProductRepository";
import { LocalCartRepository } from "@/repositories/local/LocalCartRepository";
import type { ProductRepository } from "@/repositories/interfaces/ProductRepository";
import type { CartRepository } from "@/repositories/interfaces/CartRepository";

let productRepository: ProductRepository | null = null;
let cartRepository: CartRepository | null = null;

/**
 * Single entry point for data access.
 * Swap the implementation here when the real API is available.
 */
export function getProductRepository(): ProductRepository {
  if (!productRepository) productRepository = new MockProductRepository();
  return productRepository;
}

/** Panier : LocalCartRepository aujourd'hui, ApiCartRepository demain. */
export function getCartRepository(): CartRepository {
  if (!cartRepository) cartRepository = new LocalCartRepository(getProductRepository());
  return cartRepository;
}
