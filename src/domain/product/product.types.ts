export interface Money {
  amountMinor: number;
  currency: "TND";
}

export type ProductAvailability = "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";

export type CurtainMaterial = "velours" | "satin" | "lin" | "jacquard" | "polyester";

export type OpacityLevel = "tamisant_leger" | "tamisant" | "obscurcissant" | "occultant";

export type CurtainHeader = "oeillets" | "rail" | "galon_fronceur" | "passants";

export type CurtainSellingMode = "single_panel" | "pair" | "pack" | "ready_made";

export type ColorFamily =
  | "white"
  | "beige"
  | "grey"
  | "black"
  | "brown"
  | "red"
  | "pink"
  | "yellow"
  | "orange"
  | "green"
  | "blue"
  | "purple"
  | "metallic";

export interface ProductColor {
  id: string;
  name: string;
  slug: string;
  family: ColorFamily;
  hex: string;
}

export interface ProductVariant {
  id: string;
  sku: string;

  colorId: string;
  widthCm: number;
  heightCm: number;
  curtainHeader: CurtainHeader;

  price: Money;
  compareAtPrice?: Money;

  availability: ProductAvailability;
  availableQuantity: number;

  imageUrl: string;
  secondaryImageUrl?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  reference: string;

  category: "rideaux";
  material: CurtainMaterial;
  opacityLevel: OpacityLevel;
  sellingMode: CurtainSellingMode;

  shortDescription: string;
  imageAlt: string;

  variants: ProductVariant[];
  colors: ProductColor[];

  isThermal: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;

  createdAt: string;
  recommendationScore: number;

  isDemo: true;
}

export type CatalogSort =
  | "recommended"
  | "newest"
  | "best_sellers"
  | "price_asc"
  | "price_desc"
  | "discount";
