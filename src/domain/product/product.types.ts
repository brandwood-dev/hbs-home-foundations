export interface Money {
  amountMinor: number;
  currency: "TND";
}

/** Univers catalogue. Chaque catégorie possède ses propres axes de variantes. */
export type ProductCategory =
  | "rideaux"
  | "voilages"
  | "stores"
  | "coussins"
  | "galettes_de_chaise"
  | "accessoires";

export type ProductAvailability = "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";

/** Matière générale : textile d'ameublement et matériaux d'accessoires. */
export type ProductMaterial =
  | "velours"
  | "satin"
  | "lin"
  | "jacquard"
  | "polyester"
  | "voile"
  | "melange_lin"
  | "jacquard_leger"
  | "toile_technique"
  | "bambou"
  | "coton"
  | "boucle"
  | "fourrure_synthetique"
  | "mousse"
  | "metal"
  | "acier"
  | "aluminium"
  | "bois"
  | "textile"
  | "corde"
  | "magnetique";

/** Sous-ensemble textile historique — conservé pour les rideaux, voilages et stores. */
export type CurtainMaterial = Extract<
  ProductMaterial,
  | "velours"
  | "satin"
  | "lin"
  | "jacquard"
  | "polyester"
  | "voile"
  | "melange_lin"
  | "jacquard_leger"
  | "toile_technique"
  | "bambou"
>;

/** Coussins. */
export type CushionShape = "carre" | "rectangulaire" | "rond";
export type CushionContent = "housse_seule" | "avec_garnissage" | "pack";
export type CushionClosure = "zip" | "enveloppe" | "sans_fermeture";

/** Galettes de chaise. */
export type ChairPadShape = "carree" | "ronde";
export type ChairPadFastening = "liens" | "elastique" | "sans_attache";

/** Accessoires. */
export type AccessoryType =
  | "tringle_extensible"
  | "tringle_fixe"
  | "rail"
  | "support"
  | "embout"
  | "anneau"
  | "crochet"
  | "raccord"
  | "embrasse"
  | "attache_magnetique"
  | "accessoire_pose";

export type AccessoryMaterial = Extract<
  ProductMaterial,
  "metal" | "acier" | "aluminium" | "bois" | "textile" | "corde" | "magnetique"
>;

export type AccessoryFinish =
  | "noir_mat"
  | "argent"
  | "dore"
  | "bronze"
  | "blanc"
  | "bois_naturel"
  | "beige"
  | "taupe";

export type AccessoryMountingType = "mur" | "plafond" | "mur_et_plafond";

export type AccessoryCompatibility =
  | "rideaux_oeillets"
  | "voilages_oeillets"
  | "rail"
  | "tringle_16_19_mm"
  | "tringle_20_25_mm"
  | "tringle_25_28_mm"
  | "montage_mural"
  | "montage_plafond";

export type OpacityLevel =
  "transparent" | "tamisant_leger" | "tamisant" | "obscurcissant" | "occultant";

export type CurtainHeader = "oeillets" | "rail" | "galon_fronceur" | "passants";

export type CurtainSellingMode = "single_panel" | "pair" | "pack" | "ready_made";

/** Motif du tissu — structurant surtout pour les voilages. */
export type ProductPattern = "uni" | "brode" | "raye" | "imprime" | "jacquard";

/** Familles de stores proposées. */
export type BlindType = "enrouleur" | "jour_nuit" | "occultant" | "tamisant" | "bambou";

/** Mode de pose d'un store. */
export type BlindMountingType = "mur" | "plafond" | "sans_percage";

/** Côté de la chaînette ou de la manœuvre. */
export type BlindControlSide = "gauche" | "droite";

/** Finition du coffre et du mécanisme. */
export type BlindMechanismColor = "blanc" | "gris" | "noir";

/** Finition métallique des œillets (uniquement pour les têtes à œillets). */
export type EyeletColor = "argent" | "dore" | "noir";

/** Doublure optionnelle du panneau. */
export type CurtainLining = "sans_doublure" | "thermique";

export type ProductImageType =
  "front" | "lifestyle" | "fabric_detail" | "header_detail" | "mechanism_detail";

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

  /** Axes rideaux et voilages. */
  curtainHeader?: CurtainHeader;
  /** Défini uniquement quand curtainHeader === "oeillets". */
  eyeletColor?: EyeletColor;
  lining?: CurtainLining;

  /** Axes stores. */
  blindMountingType?: BlindMountingType;
  blindControlSide?: BlindControlSide;
  blindMechanismColor?: BlindMechanismColor;

  /** Libellé de dimension affiché quand largeur × hauteur ne suffit pas. */
  sizeLabel?: string;

  /** Axes coussins. */
  cushionContent?: CushionContent;
  cushionClosure?: CushionClosure;

  /** Axes galettes de chaise. */
  chairPadFastening?: ChairPadFastening;
  thicknessCm?: number;

  /** Axes accessoires. */
  accessoryFinish?: AccessoryFinish;
  accessoryMountingType?: AccessoryMountingType;
  minLengthCm?: number;
  maxLengthCm?: number;
  diameterMm?: number;

  /** Nombre d'unités vendues ensemble (pack, paire, lot). */
  packQuantity?: number;

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

  category: ProductCategory;
  material: ProductMaterial;
  /** Renseigné pour les catégories textiles de fenêtre uniquement. */
  opacityLevel?: OpacityLevel;
  sellingMode: CurtainSellingMode;

  /** Motif du tissu, renseigné pour les rideaux et voilages. */
  pattern?: ProductPattern;
  /** Famille de store, renseignée uniquement pour la catégorie "stores". */
  blindType?: BlindType;
  /** Modèle conçu pour les baies vitrées et grandes largeurs. */
  isLargeWidth: boolean;

  /** Coussins. */
  cushionShape?: CushionShape;
  removableCover?: boolean;
  machineWashable?: boolean;

  /** Galettes de chaise. */
  chairPadShape?: ChairPadShape;

  /** Accessoires. */
  accessoryType?: AccessoryType;
  accessoryMaterial?: AccessoryMaterial;
  accessoryCompatibilities?: AccessoryCompatibility[];

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

/** Option de variante prête à afficher (panier, commande, suivi). */
export interface ProductOptionDisplay {
  label: string;
  value: string;
}

export type CatalogSort =
  "recommended" | "newest" | "best_sellers" | "price_asc" | "price_desc" | "discount";
