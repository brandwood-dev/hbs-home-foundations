import type { Product } from "@/domain/product/product.types";
import { demoProducts } from "@/fixtures/products.fixture";
import type {
  CatalogScope,
  PaginatedProducts,
  ProductListParams,
  ProductRepository,
} from "@/repositories/interfaces/ProductRepository";
import { filterProducts, matchesScope } from "@/services/catalog/catalog.filters";
import { paginate } from "@/services/catalog/catalog.pagination";
import { sortProducts } from "@/services/catalog/catalog.sort";

/**
 * In-memory catalogue backed by demo fixtures.
 * Mirrors the contract the future HTTP API will implement.
 */
export class MockProductRepository implements ProductRepository {
  private readonly products: Product[];

  constructor(products: Product[] = demoProducts) {
    this.products = products;
  }

  async list(params: ProductListParams): Promise<PaginatedProducts> {
    const filtered = filterProducts(this.products, params);
    const sorted = sortProducts(filtered, params.sort);
    return paginate(sorted, params.page, params.pageSize);
  }

  async getBySlug(slug: string): Promise<Product | null> {
    return this.products.find((product) => product.slug === slug) ?? null;
  }

  async listScope(scope?: CatalogScope): Promise<Product[]> {
    return this.products.filter((product) => matchesScope(product, scope));
  }
}
