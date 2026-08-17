import { MockProductRepository } from "@/repositories/mock/MockProductRepository";
import { MockOrderRepository } from "@/repositories/mock/MockOrderRepository";
import { LocalCartRepository } from "@/repositories/local/LocalCartRepository";
import type { ProductRepository } from "@/repositories/interfaces/ProductRepository";
import type { CartRepository } from "@/repositories/interfaces/CartRepository";
import type { OrderRepository } from "@/repositories/interfaces/OrderRepository";

let productRepository: ProductRepository | null = null;
let cartRepository: CartRepository | null = null;
let orderRepository: OrderRepository | null = null;

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

/** Commandes : MockOrderRepository aujourd'hui, ApiOrderRepository demain. */
export function getOrderRepository(): OrderRepository {
  if (!orderRepository) orderRepository = new MockOrderRepository(getProductRepository());
  return orderRepository;
}
