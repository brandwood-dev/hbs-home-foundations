import type {
  CatalogSort,
  ColorFamily,
  CurtainHeader,
  CurtainMaterial,
  CurtainSellingMode,
  OpacityLevel,
  ProductAvailability,
} from "@/domain/product/product.types";

export const MATERIAL_LABELS: Record<CurtainMaterial, string> = {
  velours: "Velours",
  satin: "Satin",
  lin: "Lin",
  jacquard: "Jacquard",
  polyester: "Polyester",
};

export const OPACITY_LABELS: Record<OpacityLevel, string> = {
  tamisant_leger: "Tamisant léger",
  tamisant: "Tamisant",
  obscurcissant: "Obscurcissant",
  occultant: "Occultant",
};

export const HEADER_LABELS: Record<CurtainHeader, string> = {
  oeillets: "Œillets",
  rail: "Rail",
  galon_fronceur: "Galon fronceur",
  passants: "Passants",
};

export const SELLING_MODE_LABELS: Record<CurtainSellingMode, string> = {
  single_panel: "Panneau seul",
  pair: "Paire",
  pack: "Pack",
  ready_made: "Prêt à poser",
};

export const AVAILABILITY_LABELS: Record<ProductAvailability, string> = {
  in_stock: "En stock",
  low_stock: "Faible stock",
  out_of_stock: "Indisponible",
  made_to_order: "Sur commande",
};

export const COLOR_FAMILY_LABELS: Record<ColorFamily, string> = {
  white: "Blanc et ivoire",
  beige: "Beige et grège",
  grey: "Gris",
  black: "Noir",
  brown: "Marron et camel",
  red: "Rouge et bordeaux",
  pink: "Rose",
  yellow: "Jaune et moutarde",
  orange: "Orange et terracotta",
  green: "Vert",
  blue: "Bleu",
  purple: "Violet",
  metallic: "Métallisé",
};

export const COLOR_FAMILY_SWATCHES: Record<ColorFamily, string> = {
  white: "#F4F1EA",
  beige: "#D9C8AE",
  grey: "#9C9C99",
  black: "#22211F",
  brown: "#7A5334",
  red: "#8C2B2B",
  pink: "#D89AA6",
  yellow: "#D4A game".replace(" game", "23A"),
  orange: "#C2683C",
  green: "#4F6B4A",
  blue: "#3A5A78",
  purple: "#6B4A73",
  metallic: "#B9A88A",
};

export const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "recommended", label: "Produits recommandés" },
  { value: "newest", label: "Nouveautés" },
  { value: "best_sellers", label: "Meilleures ventes" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "discount", label: "Promotions" },
];

export const SORT_VALUES = SORT_OPTIONS.map((option) => option.value);

export const DEFAULT_PAGE_SIZE = 12;
