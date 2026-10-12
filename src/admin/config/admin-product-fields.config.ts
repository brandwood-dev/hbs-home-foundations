import type { AdminProductCategoryKey, AdminSellingMode } from "@/admin/types/admin.types";
import {
  FURNITURE_ASSEMBLY_LABELS,
  FURNITURE_STYLE_LABELS,
  FURNITURE_TYPE_LABELS,
  SHIPPING_PROFILE_LABELS,
} from "@/domain/product/product.constants";
import {
  ADMIN_VARIANT_AXES_BY_CATEGORY,
  type AdminVariantAxisKey,
} from "@/admin/config/admin-variant-axes.config";

/** Champs spécifiques disponibles, déclarés une seule fois (formulaire data-driven). */
export interface AdminProductField {
  key: string;
  label: string;
  kind: "text" | "textarea" | "number" | "boolean" | "select" | "tags";
  options?: Array<{ value: string; label: string }>;
  hint?: string;
  /** Affiche le champ uniquement lorsque le type de mobilier le justifie. */
  visibleWhen?: (values: Record<string, unknown>) => boolean;
  /** Champ mappé sur une propriété racine de `AdminProduct` (sinon `attributes`). */
  mappedTo?: "material" | "opacityLevel" | "style" | "rooms";
}

const opt = (value: string, label: string) => ({ value, label });

const furnitureTypeOptions = Object.entries(FURNITURE_TYPE_LABELS).map(([value, label]) =>
  opt(value, label),
);
const furnitureStyleOptions = Object.entries(FURNITURE_STYLE_LABELS).map(([value, label]) =>
  opt(value, label),
);
const furnitureAssemblyOptions = Object.entries(FURNITURE_ASSEMBLY_LABELS).map(([value, label]) =>
  opt(value, label),
);
const shippingProfileOptions = Object.entries(SHIPPING_PROFILE_LABELS).map(([value, label]) =>
  opt(value, label),
);

const upholsteredFurnitureTypes = new Set([
  "canape",
  "fauteuil",
  "meridienne",
  "chaise",
  "pouf",
  "banc",
  "tete_de_lit",
]);
const storageFurnitureTypes = new Set(["meuble_tv", "buffet", "etagere", "console"]);

function selectedFurnitureType(values: Record<string, unknown>): string {
  return typeof values["furniture_type"] === "string" ? values["furniture_type"] : "";
}

function isUpholsteredFurniture(values: Record<string, unknown>): boolean {
  return upholsteredFurnitureTypes.has(selectedFurnitureType(values));
}

function isStorageFurniture(values: Record<string, unknown>): boolean {
  return storageFurnitureTypes.has(selectedFurnitureType(values));
}

const FIELDS: AdminProductField[] = [
  {
    key: "material",
    label: "Matière principale",
    kind: "select",
    mappedTo: "material",
    hint: "Utilisée pour le catalogue, les filtres et la fiche produit publique.",
  },
  {
    key: "opacity",
    label: "Niveau de lumière",
    kind: "select",
    mappedTo: "opacityLevel",
    options: [
      opt("tamisant_leger", "Tamisant léger"),
      opt("tamisant", "Tamisant"),
      opt("obscurcissant", "Obscurcissant"),
      opt("occultant", "Occultant"),
    ],
  },
  {
    key: "style",
    label: "Style",
    kind: "select",
    mappedTo: "style",
    options: furnitureStyleOptions,
  },
  { key: "rooms", label: "Pièces recommandées", kind: "tags", mappedTo: "rooms" },
  { key: "care", label: "Entretien", kind: "textarea" },
  { key: "installation", label: "Installation", kind: "textarea" },
  { key: "large_width", label: "Grande largeur", kind: "boolean" },
  {
    key: "blind_type",
    label: "Type de store",
    kind: "select",
    options: [
      opt("enrouleur", "Enrouleur"),
      opt("jour_nuit", "Jour/Nuit"),
      opt("bambou", "Bambou"),
      opt("occultant", "Occultant"),
      opt("venitien", "Vénitien"),
    ],
  },
  { key: "mechanism", label: "Mécanisme", kind: "text" },
  {
    key: "shape",
    label: "Forme",
    kind: "select",
    options: [
      opt("carre", "Carrée"),
      opt("rectangulaire", "Rectangulaire"),
      opt("ronde", "Ronde"),
      opt("cylindrique", "Cylindrique"),
    ],
  },
  { key: "removable_cover", label: "Déhoussable", kind: "boolean" },
  { key: "machine_washable", label: "Lavable en machine", kind: "boolean" },
  { key: "filling", label: "Contenu / garnissage", kind: "text" },
  { key: "closure", label: "Fermeture", kind: "text" },
  { key: "fastening", label: "Attache", kind: "text" },
  { key: "thickness_cm", label: "Épaisseur (cm)", kind: "number" },
  {
    key: "accessory_type",
    label: "Type d'accessoire",
    kind: "select",
    options: [
      opt("tringle_extensible", "Tringle extensible (1,5–3 m)"),
      opt("rail", "Rail"),
      opt("embrasse", "Embrasse"),
      opt("support", "Support"),
      opt("embout", "Embout"),
      opt("petite_piece", "Petite pièce"),
    ],
  },
  {
    key: "compatibilities",
    label: "Compatibilités",
    kind: "tags",
    hint: "Valeurs structurées : oeillets, ruflette, pattes, rail, tringle_28mm…",
  },
  { key: "finish", label: "Finition", kind: "text" },
  { key: "min_length_cm", label: "Longueur minimale (cm)", kind: "number" },
  { key: "max_length_cm", label: "Longueur maximale (cm)", kind: "number" },
  { key: "diameter_mm", label: "Diamètre (mm)", kind: "number" },
  {
    key: "furniture_type",
    label: "Type de mobilier",
    kind: "select",
    options: furnitureTypeOptions,
  },
  {
    key: "upholstery",
    label: "Revêtement",
    kind: "select",
    visibleWhen: isUpholsteredFurniture,
    options: [
      opt("lin", "Lin"),
      opt("velours", "Velours"),
      opt("boucle", "Bouclette"),
      opt("coton", "Coton"),
      opt("polyester", "Polyester"),
      opt("cuir", "Cuir ou simili cuir"),
      opt("cannage", "Cannage"),
      opt("sans_revetement", "Sans revêtement"),
      opt("autre", "Autre"),
    ],
  },
  {
    key: "frame_material",
    label: "Matière de structure",
    kind: "select",
    options: [
      opt("bois_massif", "Bois massif"),
      opt("bois_et_metal", "Bois et métal"),
      opt("metal", "Métal"),
      opt("acier_laque", "Acier laqué"),
      opt("panneaux_mdf", "Panneaux MDF ou aggloméré"),
      opt("rotin", "Rotin ou cannage"),
      opt("autre", "Autre"),
    ],
  },
  {
    key: "leg_material",
    label: "Matière des pieds",
    kind: "select",
    options: [
      opt("bois", "Bois"),
      opt("metal", "Métal"),
      opt("plastique", "Plastique"),
      opt("mixte", "Bois et métal"),
      opt("sans_pieds", "Sans pieds"),
      opt("autre", "Autre"),
    ],
  },
  {
    key: "features",
    label: "Fonctionnalités",
    kind: "tags",
    options: [
      opt("housse_dehoussable", "Housse déhoussable"),
      opt("assise_haute_resilience", "Assise haute résilience"),
      opt("accoudoir_reversible", "Accoudoir réversible"),
      opt("rangement_integre", "Rangement intégré"),
      opt("portes", "Portes"),
      opt("tiroirs", "Tiroirs"),
      opt("empilable", "Empilable"),
      opt("pliable", "Pliable"),
      opt("fixation_murale", "Fixation murale"),
      opt("livre_monte", "Livré monté"),
      opt("autre", "Autre"),
    ],
  },
  {
    key: "seat_comfort",
    label: "Confort d'assise",
    kind: "select",
    visibleWhen: isUpholsteredFurniture,
    options: [
      opt("ferme", "Ferme"),
      opt("equilibre", "Équilibré"),
      opt("moelleux", "Moelleux"),
      opt("tres_moelleux", "Très moelleux"),
      opt("autre", "Autre"),
    ],
  },
  {
    key: "number_of_seats",
    label: "Nombre de places",
    kind: "number",
    visibleWhen: isUpholsteredFurniture,
  },
  {
    key: "assembly_level",
    label: "Montage",
    kind: "select",
    options: furnitureAssemblyOptions,
  },
  {
    key: "assembly_time",
    label: "Temps de montage (min)",
    kind: "number",
    visibleWhen: (values) =>
      typeof values["assembly_level"] !== "string" || values["assembly_level"] !== "livre_monte",
  },
  {
    key: "shipping_profile",
    label: "Profil de livraison",
    kind: "select",
    options: shippingProfileOptions,
  },
  { key: "width_cm", label: "Largeur (cm)", kind: "number" },
  { key: "height_cm", label: "Hauteur totale (cm)", kind: "number" },
  {
    key: "storage_volume_l",
    label: "Volume de rangement (L)",
    kind: "number",
    visibleWhen: isStorageFurniture,
  },
  {
    key: "plant_nature",
    label: "Nature",
    kind: "select",
    options: [
      opt("artificielle", "Artificielle"),
      opt("naturelle", "Naturelle"),
      opt("stabilisee", "Stabilisée"),
    ],
  },
  { key: "plant_type", label: "Type de plante", kind: "text" },
  {
    key: "plant_size",
    label: "Taille",
    kind: "select",
    options: [opt("petite", "Petite"), opt("moyenne", "Moyenne"), opt("grande", "Grande")],
  },
  { key: "common_name", label: "Nom commun", kind: "text" },
  { key: "botanical_name", label: "Nom botanique", kind: "text" },
  { key: "plant_family", label: "Famille", kind: "text" },
  { key: "origin", label: "Origine", kind: "text" },
  { key: "light_need", label: "Exposition", kind: "text" },
  { key: "watering", label: "Arrosage", kind: "text" },
  { key: "pet_safe", label: "Sans risque pour les animaux", kind: "boolean" },
  { key: "toxicity_note", label: "Description de toxicité", kind: "textarea" },
  { key: "flowering", label: "Floraison", kind: "boolean" },
  { key: "trailing", label: "Retombante", kind: "boolean" },
  { key: "pot_included", label: "Pot inclus", kind: "boolean" },
  { key: "indoor_use", label: "Usage intérieur", kind: "boolean" },
  { key: "preservation", label: "Conditions de conservation", kind: "textarea" },
  { key: "fragile", label: "Fragile", kind: "boolean" },
];

export const ADMIN_PRODUCT_FIELDS: Record<string, AdminProductField> = Object.fromEntries(
  FIELDS.map((field) => [field.key, field]),
);

export interface AdminProductCategoryConfig {
  category: AdminProductCategoryKey;
  productFields: string[];
  variantAxes: AdminVariantAxisKey[];
  supportsInventory: boolean;
  supportsCompareAtPrice: boolean;
  supportsCustomQuote: boolean;
  sellingModes: AdminSellingMode[];
  requiredFields: string[];
}

/** Legacy furniture attributes retained in the catalogue but removed from the admin editor. */
export const MOBILIER_REMOVED_ATTRIBUTE_KEYS = [
  "free_shipping_eligible",
  "depth_cm",
  "seat_width_cm",
  "seat_depth_cm",
  "seat_height_cm",
  "back_height_cm",
  "armrest_height_cm",
  "weight_kg",
  "max_load_kg",
  "package_count",
] as const;

export function isAdminAttributeEnabledForCategory(
  category: AdminProductCategoryKey,
  key: string,
): boolean {
  return !(
    category === "mobilier_interieur" &&
    (MOBILIER_REMOVED_ATTRIBUTE_KEYS as readonly string[]).includes(key)
  );
}

const TEXTILE_MODES: AdminSellingMode[] = [
  "single_panel",
  "pair",
  "pack",
  "per_meter",
  "ready_made",
  "custom_quote",
];

function config(
  category: AdminProductCategoryKey,
  productFields: string[],
  overrides: Partial<AdminProductCategoryConfig> = {},
): AdminProductCategoryConfig {
  return {
    category,
    productFields,
    variantAxes: ADMIN_VARIANT_AXES_BY_CATEGORY[category],
    supportsInventory: true,
    supportsCompareAtPrice: true,
    supportsCustomQuote: true,
    sellingModes: TEXTILE_MODES,
    requiredFields: [],
    ...overrides,
  };
}

export const adminProductCategoryConfigs: Record<
  AdminProductCategoryKey,
  AdminProductCategoryConfig
> = {
  rideaux: config(
    "rideaux",
    ["material", "opacity", "rooms", "large_width", "care", "installation"],
    { requiredFields: ["material"] },
  ),
  voilages: config("voilages", [
    "material",
    "opacity",

    "rooms",
    "large_width",
    "care",
    "installation",
  ]),
  stores: config(
    "stores",
    ["blind_type", "opacity", "mechanism", "care", "installation", "rooms"],
    { sellingModes: ["ready_made", "custom_quote", "pack"] },
  ),
  coussins: config(
    "coussins",
    ["shape", "material", "removable_cover", "machine_washable", "filling", "closure", "rooms"],
    { sellingModes: ["single_panel", "pack", "ready_made"] },
  ),
  galettes_de_chaise: config(
    "galettes_de_chaise",
    [
      "shape",
      "material",
      "removable_cover",
      "machine_washable",
      "fastening",
      "thickness_cm",
      "rooms",
    ],
    { sellingModes: ["single_panel", "pack", "ready_made"] },
  ),
  accessoires: config(
    "accessoires",
    [
      "accessory_type",
      "material",
      "compatibilities",
      "installation",
      "finish",
      "min_length_cm",
      "max_length_cm",
      "diameter_mm",
    ],
    { sellingModes: ["accessory", "pack"], supportsCustomQuote: false },
  ),
  mobilier_interieur: config(
    "mobilier_interieur",
    [
      "material",
      "furniture_type",
      "rooms",
      "style",
      "upholstery",
      "frame_material",
      "leg_material",
      "features",
      "seat_comfort",
      "number_of_seats",
      "removable_cover",
      "assembly_level",
      "assembly_time",
      "care",
      "shipping_profile",
      "width_cm",
      "height_cm",
      "storage_volume_l",
    ],
    {
      sellingModes: ["ready_made", "custom_quote", "pack"],
      requiredFields: ["furniture_type", "material"],
    },
  ),
  plantes_decoration: config(
    "plantes_decoration",
    [
      "plant_nature",
      "plant_type",
      "plant_size",
      "rooms",
      "common_name",
      "botanical_name",
      "plant_family",
      "origin",
      "care",
      "light_need",
      "watering",
      "pet_safe",
      "toxicity_note",
      "preservation",
      "flowering",
      "trailing",
      "pot_included",
      "indoor_use",
      "shipping_profile",
      "fragile",
    ],
    { sellingModes: ["ready_made", "pack", "accessory"], requiredFields: ["plant_nature"] },
  ),
};

/**
 * Les catégories de catalogue sont éditables indépendamment de la famille
 * métier.  Certaines sous-catégories ont donc un formulaire plus précis que
 * la configuration par défaut de leur famille.
 */
export const TRINGLES_CATEGORY_SLUG = "accessoires-tringles";

function normalizeCatalogSlug(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .toLocaleLowerCase("fr")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, "-");
}

export function isTringlesCategorySlug(categorySlug: string | undefined): boolean {
  return normalizeCatalogSlug(categorySlug) === TRINGLES_CATEGORY_SLUG;
}

/** Configuration effective pour une famille + une sous-catégorie donnée. */
export function adminProductConfigForCategory(
  category: AdminProductCategoryKey,
  categorySlug?: string,
): AdminProductCategoryConfig {
  const base = adminProductCategoryConfigs[category];
  if (category !== "accessoires" || !isTringlesCategorySlug(categorySlug)) return base;

  return {
    ...base,
    // Les données historiques peuvent rester en base, mais ne sont plus
    // éditables ni envoyées pour les nouvelles tringles.
    productFields: base.productFields.filter(
      (key) => !["compatibilities", "finish", "diameter_mm"].includes(key),
    ),
    // Une tringle est caractérisée par son coloris et son type de fixation.
    variantAxes: ["color", "mounting"],
  };
}

/** Champs réellement affichés : certaines valeurs dépendent d'un autre champ. */
export function visibleProductFields(
  category: AdminProductCategoryKey,
  values: Record<string, unknown>,
  categorySlug?: string,
): AdminProductField[] {
  const config = adminProductConfigForCategory(category, categorySlug);
  const nature = values["plant_nature"];
  return config.productFields
    .map((key) => ADMIN_PRODUCT_FIELDS[key])
    .filter((field): field is AdminProductField => Boolean(field))
    .filter((field) => field.visibleWhen?.(values) ?? true)
    .filter((field) => {
      if (category !== "plantes_decoration") return true;
      if (nature === "artificielle") {
        return !["watering", "light_need", "pet_safe", "preservation", "botanical_name"].includes(
          field.key,
        );
      }
      if (nature === "stabilisee") return !["watering", "light_need"].includes(field.key);
      return field.key !== "preservation";
    });
}

export const SELLING_MODE_LABELS: Record<AdminSellingMode, string> = {
  single_panel: "Panneau seul",
  pair: "Paire",
  pack: "Pack",
  per_meter: "Au mètre",
  ready_made: "Prêt à poser",
  custom_quote: "Sur devis",
  accessory: "Accessoire",
};

export const SELLING_MODE_HINTS: Record<AdminSellingMode, string> = {
  single_panel: "Produit vendu à l'unité ou par pan.",
  pair: "Le prix correspond à une paire.",
  pack: "Renseignez le contenu et la quantité du pack.",
  per_meter: "Prix au mètre, avec longueurs minimale et maximale.",
  ready_made: "Produit fini, prêt à poser.",
  custom_quote: "Sans prix ni stock : demande de devis sur le site public.",
  accessory: "Accessoire vendu séparément.",
};
