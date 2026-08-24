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
  | "accessoires"
  | "mobilier_interieur"
  | "plantes_decoration";

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
  | "magnetique"
  | "bois_massif"
  | "rotin"
  | "cannage"
  | "metal_laque"
  | "verre"
  | "marbre"
  | "ceramique"
  | "terre_cuite"
  | "cuir_synthetique"
  | "fibre_naturelle"
  | "plante_naturelle"
  | "plante_synthetique";

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
  "noir_mat" | "argent" | "dore" | "bronze" | "blanc" | "bois_naturel" | "beige" | "taupe";

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

/**
 * Profil logistique. Les meubles volumineux et les plantes fragiles ne suivent pas
 * le forfait de livraison standard : le montant est confirmé après la commande.
 */
export type ShippingProfile = "standard" | "fragile" | "volumineux" | "hors_norme";

/** Mobilier d'intérieur. */
export type FurnitureType =
  | "canape"
  | "fauteuil"
  | "chaise"
  | "table_basse"
  | "table_appoint"
  | "meuble_tv"
  | "buffet"
  | "etagere"
  | "console"
  | "pouf"
  | "tete_de_lit"
  | "meridienne"
  | "banc";

export type FurnitureRoom = "salon" | "chambre" | "salle_a_manger" | "bureau" | "entree";

export type FurnitureStyle =
  "mediterraneen" | "contemporain" | "artisanal" | "minimaliste" | "boheme";

export type FurnitureAssembly = "livre_monte" | "montage_simple" | "montage_requis";

/** Plantes et décoration végétale. */
export type PlantNature = "artificielle" | "naturelle" | "stabilisee";

export type PlantType =
  | "plante_posee"
  | "grande_plante"
  | "plante_suspendue"
  | "arbre_artificiel"
  | "composition"
  | "cache_pot";

export type PlantSize = "petite" | "moyenne" | "grande";

export type PlantLightNeed = "faible" | "moderee" | "vive_indirecte" | "plein_soleil";

export type PlantCareLevel = "sans_entretien" | "facile" | "modere" | "exigeant";

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

  /** Axes mobilier. */
  depthCm?: number;
  seatCount?: number;
  /** Axes plantes : hauteur du sujet et diamètre du pot livré. */
  plantHeightCm?: number;
  potDiameterCm?: number;
  plantSize?: PlantSize;

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
  /** Chemin public canonique, fourni par l'API quand le produit est rattaché à une catégorie active. */
  canonicalPath?: string;

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

  /** Mobilier d'intérieur. */
  furnitureType?: FurnitureType;
  furnitureRooms?: FurnitureRoom[];
  furnitureStyle?: FurnitureStyle;
  furnitureAssembly?: FurnitureAssembly;

  /** Plantes et décoration végétale. */
  plantNature?: PlantNature;
  plantType?: PlantType;
  plantLightNeed?: PlantLightNeed;
  plantCareLevel?: PlantCareLevel;
  petFriendly?: boolean;
  potIncluded?: boolean;

  /** Profil logistique : par défaut « standard » quand non renseigné. */
  shippingProfile?: ShippingProfile;

  shortDescription: string;
  longDescription: string;
  imageAlt: string;

  images: ProductImage[];
  variants: ProductVariant[];
  colors: ProductColor[];
  details: ProductDetails;
  /** Attributs catalogue dynamiques renvoyés par l'API. */
  attributes?: Record<string, unknown>;

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

  /** Indique si la fiche provient encore d’un jeu de données de démonstration. */
  isDemo: boolean;
}

/** Option de variante prête à afficher (panier, commande, suivi). */
export interface ProductOptionDisplay {
  label: string;
  value: string;
}

export type CatalogSort =
  "recommended" | "newest" | "best_sellers" | "price_asc" | "price_desc" | "discount";
