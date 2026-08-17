import { MockProductRepository } from "@/repositories/mock/MockProductRepository";
import type { ProductRepository } from "@/repositories/interfaces/ProductRepository";

let productRepository: ProductRepository | null = null;

/**
 * Single entry point for data access.
 * Swap the implementation here when the real API is available.
 */
export function getProductRepository(): ProductRepository {
  if (!productRepository) productRepository = new MockProductRepository();
  return productRepository;
}
