export interface Money {
  amountMinor: number;
  currency: "TND";
}

export type ProductAvailability = "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";

export type CurtainMaterial = "velours" | "satin" | "lin" | "jacquard" | "polyester";

export type OpacityLevel = "tamisant_leger" | "tamisant" | "obscurcissant" | "occultant";

export type CurtainHeader = "oeillets" | "rail" | "galon_fronceur" | "passants";

export type CurtainSellingMode = "single_panel" | "pair" | "pack" | "ready_made";

/** Finition métallique des œillets (uniquement pour les têtes à œillets). */
export type EyeletColor = "argent" | "dore" | "noir";

/** Doublure optionnelle du panneau. */
export type CurtainLining = "sans_doublure" | "thermique";

export type ProductImageType = "front" | "lifestyle" | "fabric_detail" | "header_detail";

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

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  type: ProductImageType;
  /** Renseigné quand l'image illustre un coloris précis. */
  colorId?: string;
}

export interface ProductDetails {
  composition: string;
  weightGsm: number;
  care: string[];
  features: string[];
  installationNotes: string[];
  originNote: string;
}

export interface ProductVariant {
  id: string;
  sku: string;

  colorId: string;
  widthCm: number;
  heightCm: number;
  curtainHeader: CurtainHeader;
  /** Défini uniquement quand curtainHeader === "oeillets". */
  eyeletColor?: EyeletColor;
  lining: CurtainLining;

  price: Money;
  compareAtPrice?: Money;

  availability: ProductAvailability;
  availableQuantity: number;

  imageUrl: string;
  secondaryImageUrl?: string;
  /** Images de la galerie associées à cette déclinaison, par ordre d'affichage. */
  imageIds: string[];
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
  longDescription: string;
  imageAlt: string;

  images: ProductImage[];
  variants: ProductVariant[];
  colors: ProductColor[];
  details: ProductDetails;

  seo: {
    title: string;
    description: string;
  };

  isThermal: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;

  createdAt: string;
  recommendationScore: number;

  isDemo: true;
}

export type CatalogSort =
  "recommended" | "newest" | "best_sellers" | "price_asc" | "price_desc" | "discount";
