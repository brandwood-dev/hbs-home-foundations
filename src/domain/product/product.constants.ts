import type {
  BlindControlSide,
  BlindMechanismColor,
  BlindMountingType,
  BlindType,
  CatalogSort,
  ColorFamily,
  CurtainHeader,
  CurtainLining,
  AccessoryCompatibility,
  AccessoryFinish,
  AccessoryMountingType,
  AccessoryType,
  ChairPadFastening,
  ChairPadShape,
  CurtainSellingMode,
  CushionClosure,
  CushionContent,
  CushionShape,
  EyeletColor,
  OpacityLevel,
  ProductAvailability,
  ProductCategory,
  ProductMaterial,
  ProductPattern,
  FurnitureAssembly,
  FurnitureRoom,
  FurnitureStyle,
  FurnitureType,
  PlantCareLevel,
  PlantLightNeed,
  PlantNature,
  PlantSize,
  PlantType,
  ShippingProfile,
} from "@/domain/product/product.types";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  rideaux: "Rideaux",
  voilages: "Voilages",
  stores: "Stores",
  coussins: "Coussins",
  galettes_de_chaise: "Galettes de chaise",
  accessoires: "Accessoires",
  mobilier_interieur: "Mobilier d'intérieur",
  plantes_decoration: "Plantes et décoration",
};

export const CATEGORY_PATHS: Record<ProductCategory, string> = {
  rideaux: "/rideaux",
  voilages: "/voilages",
  stores: "/stores",
  coussins: "/coussins",
  galettes_de_chaise: "/galettes-de-chaise",
  accessoires: "/accessoires",
  mobilier_interieur: "/mobilier",
  plantes_decoration: "/plantes",
};

export const MATERIAL_LABELS: Record<ProductMaterial, string> = {
  coton: "Coton",
  boucle: "Bouclette",
  fourrure_synthetique: "Fausse fourrure",
  mousse: "Mousse",
  metal: "Métal",
  acier: "Acier",
  acier_inoxydable: "Acier inoxydable",
  aluminium: "Aluminium",
  bois: "Bois",
  textile: "Textile",
  corde: "Corde",
  magnetique: "Aimant",
  velours: "Velours",
  satin: "Satin",
  lin: "Lin",
  jacquard: "Jacquard",
  polyester: "Polyester",
  voile: "Voile",
  melange_lin: "Mélange lin",
  jacquard_leger: "Jacquard léger",
  toile_technique: "Toile technique",
  bambou: "Bambou",
  bois_massif: "Bois massif",
  rotin: "Rotin",
  cannage: "Cannage",
  metal_laque: "Métal laqué",
  verre: "Verre",
  marbre: "Marbre",
  ceramique: "Céramique",
  terre_cuite: "Terre cuite",
  cuir_synthetique: "Cuir synthétique",
  fibre_naturelle: "Fibre naturelle",
  plante_naturelle: "Plante naturelle",
  plante_synthetique: "Feuillage artificiel",
};

export const OPACITY_LABELS: Record<OpacityLevel, string> = {
  transparent: "Transparent",
  tamisant_leger: "Tamisant léger",
  tamisant: "Tamisant",
  obscurcissant: "Obscurcissant",
  occultant: "Occultant",
};

export const PATTERN_LABELS: Record<ProductPattern, string> = {
  uni: "Uni",
  brode: "Brodé",
  raye: "Rayé",
  imprime: "Imprimé",
  jacquard: "Jacquard",
};

export const BLIND_TYPE_LABELS: Record<BlindType, string> = {
  enrouleur: "Store enrouleur",
  jour_nuit: "Store jour/nuit",
  occultant: "Store occultant",
  tamisant: "Store tamisant",
  bambou: "Store en bambou",
};

export const BLIND_MOUNTING_LABELS: Record<BlindMountingType, string> = {
  mur: "Pose murale",
  plafond: "Pose plafond",
  sans_percage: "Sans perçage",
};

export const BLIND_MOUNTING_DESCRIPTIONS: Record<BlindMountingType, string> = {
  mur: "Supports vissés au mur, au-dessus de l'encadrement.",
  plafond: "Supports fixés au plafond, pour couvrir toute la hauteur.",
  sans_percage: "Supports à clipser sur le battant, sans percer.",
};

export const BLIND_CONTROL_SIDE_LABELS: Record<BlindControlSide, string> = {
  gauche: "Manœuvre à gauche",
  droite: "Manœuvre à droite",
};

export const BLIND_MECHANISM_COLOR_LABELS: Record<BlindMechanismColor, string> = {
  blanc: "Mécanisme blanc",
  gris: "Mécanisme gris",
  noir: "Mécanisme noir",
};

export const BLIND_MECHANISM_COLOR_SWATCHES: Record<BlindMechanismColor, string> = {
  blanc: "#F5F4F1",
  gris: "#9C9C99",
  noir: "#2B2A28",
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
  yellow: "#D4A23A",
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

export const EYELET_COLOR_LABELS: Record<EyeletColor, string> = {
  argent: "Œillets argentés",
  dore: "Œillets dorés",
  noir: "Œillets noirs",
};

export const EYELET_COLOR_SWATCHES: Record<EyeletColor, string> = {
  argent: "#C9CBCC",
  dore: "#C0A062",
  noir: "#2B2A28",
};

export const LINING_LABELS: Record<CurtainLining, string> = {
  sans_doublure: "Sans doublure",
  thermique: "Doublure thermique",
};

export const LINING_DESCRIPTIONS: Record<CurtainLining, string> = {
  sans_doublure: "Tombé plus léger, lumière filtrée par le tissu seul.",
  thermique: "Isole du froid et de la chaleur, renforce l'occultation.",
};

export const HEADER_DESCRIPTIONS: Record<CurtainHeader, string> = {
  oeillets: "Se glisse directement sur une tringle, plis larges et réguliers.",
  rail: "Se fixe sur un rail plafond, idéal pour les grandes largeurs.",
  galon_fronceur: "Ruban à froncer ajustable, plis souples faits main.",
  passants: "Passants en tissu, style léger et naturel.",
};

export const CUSHION_SHAPE_LABELS: Record<CushionShape, string> = {
  carre: "Carré",
  rectangulaire: "Rectangulaire",
  rond: "Rond",
};

export const CUSHION_CONTENT_LABELS: Record<CushionContent, string> = {
  housse_seule: "Housse seule",
  avec_garnissage: "Avec garnissage",
  pack: "Lot de 2",
};

export const CUSHION_CONTENT_DESCRIPTIONS: Record<CushionContent, string> = {
  housse_seule: "Housse déhoussable seule, garnissage non inclus.",
  avec_garnissage: "Housse livrée avec son coussin de garnissage.",
  pack: "Deux housses identiques pour habiller un canapé.",
};

export const CUSHION_CLOSURE_LABELS: Record<CushionClosure, string> = {
  zip: "Fermeture zip",
  enveloppe: "Fermeture enveloppe",
  sans_fermeture: "Sans fermeture",
};

export const CHAIR_PAD_SHAPE_LABELS: Record<ChairPadShape, string> = {
  carree: "Galette carrée",
  ronde: "Galette ronde",
};

export const CHAIR_PAD_FASTENING_LABELS: Record<ChairPadFastening, string> = {
  liens: "Attaches à nouer",
  elastique: "Élastique",
  sans_attache: "Sans attache",
};

export const ACCESSORY_TYPE_LABELS: Record<AccessoryType, string> = {
  tringle_extensible: "Tringle extensible",
  tringle_fixe: "Tringle fixe",
  rail: "Rail",
  support: "Support",
  embout: "Embout",
  anneau: "Anneaux",
  crochet: "Crochets",
  raccord: "Raccord",
  embrasse: "Embrasse",
  attache_magnetique: "Attache magnétique",
  accessoire_pose: "Accessoire de pose",
};

export const ACCESSORY_FINISH_LABELS: Record<AccessoryFinish, string> = {
  noir_mat: "Noir mat",
  argent: "Argent",
  dore: "Doré",
  bronze: "Bronze",
  blanc: "Blanc",
  bois_naturel: "Bois naturel",
  beige: "Beige",
  taupe: "Taupe",
};

export const ACCESSORY_FINISH_SWATCHES: Record<AccessoryFinish, string> = {
  noir_mat: "#2B2A28",
  argent: "#C9CBCC",
  dore: "#C0A062",
  bronze: "#8A6A45",
  blanc: "#F5F4F1",
  bois_naturel: "#B08B57",
  beige: "#D9C8AE",
  taupe: "#8C8073",
};

export const ACCESSORY_MOUNTING_LABELS: Record<AccessoryMountingType, string> = {
  mur: "Pose murale",
  plafond: "Pose plafond",
  mur_et_plafond: "Mur ou plafond",
};

export const ACCESSORY_COMPATIBILITY_LABELS: Record<AccessoryCompatibility, string> = {
  rideaux_oeillets: "Rideaux à œillets",
  voilages_oeillets: "Voilages à œillets",
  rail: "Rails",
  tringle_16_19_mm: "Tringles Ø 16-19 mm",
  tringle_20_25_mm: "Tringles Ø 20-25 mm",
  tringle_25_28_mm: "Tringles Ø 25-28 mm",
  montage_mural: "Montage mural",
  montage_plafond: "Montage plafond",
};

export const SHIPPING_PROFILE_LABELS: Record<ShippingProfile, string> = {
  standard: "Livraison standard",
  fragile: "Colis fragile",
  volumineux: "Livraison volumineuse",
  hors_norme: "Livraison hors norme",
};

export const SHIPPING_PROFILE_NOTES: Record<ShippingProfile, string> = {
  standard: "Expédié sous 24 à 48 heures partout en Tunisie.",
  fragile: "Emballage renforcé, remise en main propre par le livreur.",
  volumineux: "Livraison sur rendez-vous, frais confirmés par téléphone avant expédition.",
  hors_norme: "Transport spécial, frais et créneau confirmés par notre service client.",
};

export const FURNITURE_TYPE_LABELS: Record<FurnitureType, string> = {
  canape: "Canapé",
  fauteuil: "Fauteuil",
  chaise: "Chaise",
  table_basse: "Table basse",
  table_appoint: "Table d'appoint",
  meuble_tv: "Meuble TV",
  buffet: "Buffet",
  etagere: "Étagère",
  console: "Console",
  pouf: "Pouf",
  tete_de_lit: "Tête de lit",
  meridienne: "Méridienne",
  banc: "Banc et banquette",
};

export const FURNITURE_ROOM_LABELS: Record<FurnitureRoom, string> = {
  salon: "Salon",
  chambre: "Chambre",
  salle_a_manger: "Salle à manger",
  bureau: "Bureau",
  entree: "Entrée",
};

export const FURNITURE_STYLE_LABELS: Record<FurnitureStyle, string> = {
  mediterraneen: "Méditerranéen",
  contemporain: "Contemporain",
  artisanal: "Artisanal",
  minimaliste: "Minimaliste",
  boheme: "Bohème",
};

export const FURNITURE_ASSEMBLY_LABELS: Record<FurnitureAssembly, string> = {
  livre_monte: "Livré monté",
  montage_simple: "Montage simple",
  montage_requis: "Montage requis",
};

export const PLANT_NATURE_LABELS: Record<PlantNature, string> = {
  artificielle: "Artificielle",
  naturelle: "Naturelle",
  stabilisee: "Stabilisée",
};

export const PLANT_TYPE_LABELS: Record<PlantType, string> = {
  plante_posee: "Plante à poser",
  grande_plante: "Grande plante",
  plante_suspendue: "Plante suspendue",
  arbre_artificiel: "Arbre artificiel",
  composition: "Composition",
  cache_pot: "Cache-pot",
};

export const PLANT_SIZE_LABELS: Record<PlantSize, string> = {
  petite: "Petite (moins de 60 cm)",
  moyenne: "Moyenne (60 à 120 cm)",
  grande: "Grande (plus de 120 cm)",
};

export const PLANT_LIGHT_LABELS: Record<PlantLightNeed, string> = {
  faible: "Lumière faible",
  moderee: "Lumière modérée",
  vive_indirecte: "Lumière vive indirecte",
  plein_soleil: "Plein soleil",
};

export const PLANT_CARE_LABELS: Record<PlantCareLevel, string> = {
  sans_entretien: "Sans entretien",
  facile: "Entretien facile",
  modere: "Entretien modéré",
  exigeant: "Entretien exigeant",
};
