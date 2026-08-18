import type { AdminProductCategoryKey } from "@/admin/types/admin.types";

/** Axes de variantes disponibles, déclarés une seule fois et réutilisés par catégorie. */
export type AdminVariantAxisKey =
  | "color"
  | "dimensions"
  | "curtain_header"
  | "eyelet_color"
  | "lining"
  | "sheer_finish"
  | "mounting"
  | "control_side"
  | "mechanism_color"
  | "cushion_content"
  | "closure"
  | "fastening"
  | "thickness"
  | "accessory_finish"
  | "length"
  | "diameter"
  | "upholstery"
  | "orientation"
  | "plant_size"
  | "pot_color"
  | "pot_material"
  | "pot_included"
  | "pack_quantity";

export interface AdminVariantAxis {
  key: AdminVariantAxisKey;
  label: string;
  kind: "color" | "dimensions" | "select" | "number" | "text";
  options?: Array<{ value: string; label: string }>;
  hint?: string;
}

const option = (value: string, label: string) => ({ value, label });

export const ADMIN_VARIANT_AXES: Record<AdminVariantAxisKey, AdminVariantAxis> = {
  color: { key: "color", label: "Couleur", kind: "color" },
  dimensions: { key: "dimensions", label: "Dimensions", kind: "dimensions" },
  curtain_header: {
    key: "curtain_header",
    label: "Tête de rideau",
    kind: "select",
    options: [
      option("oeillets", "Œillets"),
      option("ruflette", "Ruflette"),
      option("pattes", "Pattes"),
      option("wave", "Wave"),
    ],
  },
  eyelet_color: {
    key: "eyelet_color",
    label: "Couleur des œillets",
    kind: "select",
    options: [option("argent", "Argent"), option("dore", "Doré"), option("noir", "Noir")],
    hint: "Disponible uniquement avec une tête à œillets.",
  },
  lining: {
    key: "lining",
    label: "Doublure",
    kind: "select",
    options: [option("sans_doublure", "Sans doublure"), option("thermique", "Thermique")],
  },
  sheer_finish: {
    key: "sheer_finish",
    label: "Finition",
    kind: "select",
    options: [option("ourlet_simple", "Ourlet simple"), option("plombe", "Ourlet plombé")],
  },
  mounting: {
    key: "mounting",
    label: "Fixation",
    kind: "select",
    options: [
      option("mur", "Murale"),
      option("plafond", "Plafond"),
      option("sans_percage", "Sans perçage"),
    ],
  },
  control_side: {
    key: "control_side",
    label: "Côté de commande",
    kind: "select",
    options: [option("gauche", "Gauche"), option("droite", "Droite")],
  },
  mechanism_color: {
    key: "mechanism_color",
    label: "Couleur du mécanisme",
    kind: "select",
    options: [option("blanc", "Blanc"), option("gris", "Gris"), option("noir", "Noir")],
  },
  cushion_content: {
    key: "cushion_content",
    label: "Contenu",
    kind: "select",
    options: [option("housse_seule", "Housse seule"), option("avec_garnissage", "Avec garnissage")],
  },
  closure: {
    key: "closure",
    label: "Fermeture",
    kind: "select",
    options: [option("zip", "Zip"), option("rabat", "Rabat"), option("boutons", "Boutons")],
  },
  fastening: {
    key: "fastening",
    label: "Attache",
    kind: "select",
    options: [option("liens", "Liens"), option("elastique", "Élastique"), option("sans", "Sans")],
  },
  thickness: { key: "thickness", label: "Épaisseur (cm)", kind: "number" },
  accessory_finish: {
    key: "accessory_finish",
    label: "Finition",
    kind: "select",
    options: [
      option("noir_mat", "Noir mat"),
      option("laiton", "Laiton"),
      option("chrome", "Chromé"),
      option("bois", "Bois"),
    ],
  },
  length: { key: "length", label: "Longueur (cm)", kind: "number" },
  diameter: { key: "diameter", label: "Diamètre (mm)", kind: "number" },
  upholstery: { key: "upholstery", label: "Revêtement", kind: "text" },
  orientation: {
    key: "orientation",
    label: "Orientation",
    kind: "select",
    options: [
      option("gauche", "Angle gauche"),
      option("droite", "Angle droite"),
      option("reversible", "Réversible"),
    ],
  },
  plant_size: {
    key: "plant_size",
    label: "Taille",
    kind: "select",
    options: [option("petite", "Petite"), option("moyenne", "Moyenne"), option("grande", "Grande")],
  },
  pot_color: { key: "pot_color", label: "Couleur du pot", kind: "text" },
  pot_material: { key: "pot_material", label: "Matière du pot", kind: "text" },
  pot_included: {
    key: "pot_included",
    label: "Pot inclus",
    kind: "select",
    options: [option("oui", "Oui"), option("non", "Non")],
  },
  pack_quantity: { key: "pack_quantity", label: "Quantité du lot", kind: "number" },
};

export const ADMIN_VARIANT_AXES_BY_CATEGORY: Record<
  AdminProductCategoryKey,
  AdminVariantAxisKey[]
> = {
  rideaux: ["color", "dimensions", "curtain_header", "eyelet_color", "lining"],
  voilages: ["color", "dimensions", "sheer_finish", "eyelet_color"],
  stores: ["color", "dimensions", "mounting", "control_side", "mechanism_color"],
  coussins: ["color", "dimensions", "cushion_content", "closure", "pack_quantity"],
  galettes_de_chaise: ["color", "dimensions", "fastening", "thickness", "pack_quantity"],
  accessoires: ["accessory_finish", "length", "diameter", "mounting", "pack_quantity"],
  mobilier_interieur: ["color", "upholstery", "orientation", "dimensions", "pack_quantity"],
  plantes_decoration: [
    "plant_size",
    "dimensions",
    "pot_color",
    "pot_material",
    "pot_included",
    "pack_quantity",
  ],
};
