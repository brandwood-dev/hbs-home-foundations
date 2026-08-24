import type {
  AccessoryFinish,
  AccessoryType,
  BlindControlSide,
  BlindMountingType,
  BlindType,
  CatalogSort,
  CurtainHeader,
  ChairPadFastening,
  CurtainSellingMode,
  CushionContent,
  OpacityLevel,
  Product,
  ProductMaterial,
  ProductAvailability,
  ProductCategory,
  ProductPattern,
  FurnitureRoom,
  FurnitureStyle,
  FurnitureType,
  PlantCareLevel,
  PlantLightNeed,
  PlantNature,
  PlantSize,
  PlantType,
} from "@/domain/product/product.types";

export interface ProductListParams {
  page: number;
  pageSize: number;

  /** Optional server-side catalogue search text. */
  query?: string | undefined;

  categories?: ProductCategory[] | undefined;
  /** Normalized taxonomy slugs selected by a dynamic category page. */
  categorySlugs?: string[] | undefined;

  materials?: ProductMaterial[] | undefined;
  colors?: string[] | undefined;
  opacityLevels?: OpacityLevel[] | undefined;
  curtainHeaders?: CurtainHeader[] | undefined;
  patterns?: ProductPattern[] | undefined;

  blindTypes?: BlindType[] | undefined;
  /** Coussins, galettes et accessoires. */
  shapes?: string[] | undefined;
  cushionContents?: CushionContent[] | undefined;
  chairPadFastenings?: ChairPadFastening[] | undefined;
  accessoryTypes?: AccessoryType[] | undefined;
  accessoryFinishes?: AccessoryFinish[] | undefined;
  mountings?: BlindMountingType[] | undefined;
  controlSides?: BlindControlSide[] | undefined;

  /** Mobilier d'intérieur. */
  furnitureTypes?: FurnitureType[] | undefined;
  furnitureRooms?: FurnitureRoom[] | undefined;
  furnitureStyles?: FurnitureStyle[] | undefined;

  /** Plantes et décoration végétale. */
  plantNatures?: PlantNature[] | undefined;
  plantTypes?: PlantType[] | undefined;
  plantSizes?: PlantSize[] | undefined;
  plantCareLevels?: PlantCareLevel[] | undefined;
  plantLightNeeds?: PlantLightNeed[] | undefined;

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
  onlyLargeWidth?: boolean | undefined;

  sort: CatalogSort;
}

/** Subset of params imposed by a sub-route (locked context). */
export type CatalogScope = Pick<
  ProductListParams,
  | "categories"
  | "categorySlugs"
  | "materials"
  | "opacityLevels"
  | "curtainHeaders"
  | "patterns"
  | "blindTypes"
  | "shapes"
  | "accessoryTypes"
  | "mountings"
  | "furnitureTypes"
  | "furnitureRooms"
  | "furnitureStyles"
  | "plantNatures"
  | "plantTypes"
  | "plantSizes"
  | "sellingMode"
  | "onlyThermal"
  | "onlyLargeWidth"
>;

export interface PaginatedProducts {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  categoryCounts?: Partial<Record<ProductCategory, number>>;
}

export interface ProductRepository {
  list(params: ProductListParams): Promise<PaginatedProducts>;
  getBySlug(slug: string): Promise<Product | null>;
  /** Résolution par identifiant — utilisé par le panier. */
  getById(id: string): Promise<Product | null>;
  /** Résolution groupée — utilisé par le panier pour reconstruire les lignes. */
  getByIds(ids: string[]): Promise<Product[]>;
  /** Products of the current route scope, before the user filters — used for facets. */
  listScope(scope?: CatalogScope): Promise<Product[]>;
  /** Products similar to the given one — used on the product detail page. */
  listRelated(slug: string, limit?: number): Promise<Product[]>;
}
