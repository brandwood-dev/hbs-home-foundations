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

  materials?: CurtainMaterial[];
  colors?: string[];
  opacityLevels?: OpacityLevel[];
  curtainHeaders?: CurtainHeader[];

  widths?: number[];
  heights?: number[];

  availability?: ProductAvailability[];

  minPriceMinor?: number;
  maxPriceMinor?: number;

  sellingMode?: CurtainSellingMode[];
  onlyNew?: boolean;
  onlyBestSellers?: boolean;
  onlyDiscounted?: boolean;
  onlyThermal?: boolean;

  sort: CatalogSort;
}

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
  /** Full catalogue scope used to compute facets (before user filters). */
  listAll(scope?: Pick<ProductListParams, "materials" | "opacityLevels" | "curtainHeaders" | "sellingMode" | "onlyThermal">): Promise<Product[]>;
}
