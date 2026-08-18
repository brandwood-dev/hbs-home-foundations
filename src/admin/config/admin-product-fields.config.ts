import type { AdminProductCategoryKey, AdminSellingMode } from "@/admin/types/admin.types";
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
  /** Champ mappé sur une propriété racine de `AdminProduct` (sinon `attributes`). */
  mappedTo?: "material" | "opacityLevel" | "style" | "rooms";
}

const opt = (value: string, label: string) => ({ value, label });

const FIELDS: AdminProductField[] = [
  { key: "material", label: "Matière", kind: "text", mappedTo: "material" },
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
  { key: "style", label: "Style", kind: "text", mappedTo: "style" },
  { key: "rooms", label: "Pièces recommandées", kind: "tags", mappedTo: "rooms" },
  { key: "pattern", label: "Motif", kind: "text" },
  { key: "composition", label: "Composition", kind: "text" },
  { key: "fabric_weight", label: "Poids du tissu (g/m²)", kind: "number" },
  { key: "care", label: "Entretien", kind: "textarea" },
  { key: "installation", label: "Installation", kind: "textarea" },
  { key: "included_items", label: "Éléments inclus", kind: "tags" },
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
      opt("tringle", "Tringle"),
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
    options: [
      opt("canape", "Canapé"),
      opt("fauteuil", "Fauteuil"),
      opt("meridienne", "Méridienne"),
      opt("chaise", "Chaise"),
      opt("table", "Table"),
      opt("pouf", "Pouf"),
      opt("banc", "Banc"),
      opt("rangement", "Rangement"),
      opt("tete_de_lit", "Tête de lit"),
    ],
  },
  { key: "upholstery", label: "Revêtement", kind: "text" },
  { key: "frame_material", label: "Matière de structure", kind: "text" },
  { key: "leg_material", label: "Matière des pieds", kind: "text" },
  { key: "features", label: "Fonctionnalités", kind: "tags" },
  { key: "seat_comfort", label: "Confort d'assise", kind: "text" },
  { key: "number_of_seats", label: "Nombre de places", kind: "number" },
  {
    key: "assembly_level",
    label: "Montage",
    kind: "select",
    options: [
      opt("aucun", "Aucun montage"),
      opt("simple", "Montage simple"),
      opt("complet", "Montage complet"),
    ],
  },
  { key: "assembly_time", label: "Temps de montage (min)", kind: "number" },
  {
    key: "shipping_profile",
    label: "Profil de livraison",
    kind: "select",
    options: [
      opt("standard", "Standard"),
      opt("volumineux", "Volumineux"),
      opt("sur_devis", "Livraison sur devis"),
    ],
  },
  { key: "free_shipping_eligible", label: "Éligible livraison offerte", kind: "boolean" },
  { key: "width_cm", label: "Largeur (cm)", kind: "number" },
  { key: "depth_cm", label: "Profondeur (cm)", kind: "number" },
  { key: "height_cm", label: "Hauteur totale (cm)", kind: "number" },
  { key: "seat_width_cm", label: "Largeur d'assise (cm)", kind: "number" },
  { key: "seat_depth_cm", label: "Profondeur d'assise (cm)", kind: "number" },
  { key: "seat_height_cm", label: "Hauteur d'assise (cm)", kind: "number" },
  { key: "back_height_cm", label: "Hauteur du dossier (cm)", kind: "number" },
  { key: "armrest_height_cm", label: "Hauteur des accoudoirs (cm)", kind: "number" },
  { key: "weight_kg", label: "Poids (kg)", kind: "number" },
  { key: "max_load_kg", label: "Charge maximale (kg)", kind: "number" },
  { key: "storage_volume_l", label: "Volume de rangement (L)", kind: "number" },
  { key: "package_count", label: "Nombre de colis", kind: "number" },
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
    [
      "material",
      "opacity",
      "pattern",
      "style",
      "rooms",
      "large_width",
      "composition",
      "fabric_weight",
      "care",
      "installation",
      "included_items",
    ],
    { requiredFields: ["material"] },
  ),
  voilages: config("voilages", [
    "material",
    "opacity",
    "pattern",
    "style",
    "rooms",
    "large_width",
    "composition",
    "fabric_weight",
    "care",
    "installation",
    "included_items",
  ]),
  stores: config(
    "stores",
    ["blind_type", "opacity", "mechanism", "care", "installation", "included_items", "rooms"],
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
      "included_items",
    ],
    { sellingModes: ["accessory", "pack"], supportsCustomQuote: false },
  ),
  mobilier_interieur: config(
    "mobilier_interieur",
    [
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
      "included_items",
      "care",
      "shipping_profile",
      "free_shipping_eligible",
      "width_cm",
      "depth_cm",
      "height_cm",
      "seat_width_cm",
      "seat_depth_cm",
      "seat_height_cm",
      "back_height_cm",
      "armrest_height_cm",
      "weight_kg",
      "max_load_kg",
      "storage_volume_l",
      "package_count",
    ],
    { sellingModes: ["ready_made", "custom_quote", "pack"], requiredFields: ["furniture_type"] },
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

/** Champs réellement affichés : certaines valeurs dépendent d'un autre champ. */
export function visibleProductFields(
  category: AdminProductCategoryKey,
  values: Record<string, unknown>,
): AdminProductField[] {
  const config = adminProductCategoryConfigs[category];
  const nature = values["plant_nature"];
  return config.productFields
    .map((key) => ADMIN_PRODUCT_FIELDS[key])
    .filter((field): field is AdminProductField => Boolean(field))
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
