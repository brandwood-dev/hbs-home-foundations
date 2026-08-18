import type { Product } from "@/domain/product/product.types";
import { demoProducts } from "@/fixtures/products.fixture";
import { demoStores } from "@/fixtures/stores.fixture";
import { demoVoilages } from "@/fixtures/voilages.fixture";

/** Catalogue complet toutes catégories confondues. */
export const demoCatalog = [...demoProducts, ...demoVoilages, ...demoStores];
import type {
  CatalogScope,
  PaginatedProducts,
  ProductListParams,
  ProductRepository,
} from "@/repositories/interfaces/ProductRepository";
import { filterProducts, matchesScope } from "@/services/catalog/catalog.filters";
import { paginate } from "@/services/catalog/catalog.pagination";
import { sortProducts } from "@/services/catalog/catalog.sort";
import { getRelatedProducts } from "@/services/product/product-recommendations";

/**
 * In-memory catalogue backed by demo fixtures.
 * Mirrors the contract the future HTTP API will implement.
 */
export class MockProductRepository implements ProductRepository {
  private readonly products: Product[];

  constructor(products: Product[] = demoCatalog) {
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

  async getById(id: string): Promise<Product | null> {
    return this.products.find((product) => product.id === id) ?? null;
  }

  async getByIds(ids: string[]): Promise<Product[]> {
    const wanted = new Set(ids);
    return this.products.filter((product) => wanted.has(product.id));
  }

  async listScope(scope?: CatalogScope): Promise<Product[]> {
    return this.products.filter((product) => matchesScope(product, scope));
  }

  async listRelated(slug: string, limit = 4): Promise<Product[]> {
    const base = await this.getBySlug(slug);
    if (!base) return [];
    return getRelatedProducts(base, this.products, limit);
  }
}
