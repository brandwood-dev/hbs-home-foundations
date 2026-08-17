import type {
  CatalogSort,
  CurtainHeader,
  CurtainMaterial,
  CurtainSellingMode,
  OpacityLevel,
  Product,
  ProductAvailability,
} from "@/domain/product/product.types";

export interface ProductListParams {
  page: number;
  pageSize: number;

  materials?: CurtainMaterial[] | undefined;
  colors?: string[] | undefined;
  opacityLevels?: OpacityLevel[] | undefined;
  curtainHeaders?: CurtainHeader[] | undefined;

  widths?: number[] | undefined;
  heights?: number[] | undefined;

  availability?: ProductAvailability[] | undefined;

  minPriceMinor?: number | undefined;
  maxPriceMinor?: number | undefined;

  sellingMode?: CurtainSellingMode[] | undefined;
  onlyNew?: boolean | undefined;
  onlyBestSellers?: boolean | undefined;
  onlyDiscounted?: boolean | undefined;
  onlyThermal?: boolean | undefined;

  sort: CatalogSort;
}

/** Subset of params imposed by a sub-route (locked context). */
export type CatalogScope = Pick<
  ProductListParams,
  "materials" | "opacityLevels" | "curtainHeaders" | "sellingMode" | "onlyThermal"
>;

export interface PaginatedProducts {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProductRepository {
  list(params: ProductListParams): Promise<PaginatedProducts>;
  getBySlug(slug: string): Promise<Product | null>;
  /** Products of the current route scope, before the user filters — used for facets. */
  listScope(scope?: CatalogScope): Promise<Product[]>;
  /** Products similar to the given one — used on the product detail page. */
  listRelated(slug: string, limit?: number): Promise<Product[]>;
}
