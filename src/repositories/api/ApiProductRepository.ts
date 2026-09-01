import type {
  AccessoryCompatibility,
  AccessoryFinish,
  AccessoryMaterial,
  AccessoryMountingType,
  AccessoryType,
  BlindControlSide,
  BlindMechanismColor,
  BlindMountingType,
  BlindType,
  ChairPadFastening,
  ChairPadShape,
  ColorFamily,
  CurtainHeader,
  CurtainLining,
  CurtainSellingMode,
  CushionClosure,
  CushionContent,
  CushionShape,
  EyeletColor,
  FurnitureAssembly,
  FurnitureRoom,
  FurnitureStyle,
  FurnitureType,
  OpacityLevel,
  PlantCareLevel,
  PlantLightNeed,
  PlantNature,
  PlantSize,
  PlantType,
  Product,
  ProductAvailability,
  ProductCategory,
  ProductImageType,
  ProductMaterial,
  ProductPattern,
} from "@/domain/product/product.types";
import { COLORS } from "@/domain/product/product-colors";
import { HbsApiError, HbsApiClient } from "@/api/client";
import type {
  CatalogScope,
  PaginatedProducts,
  ProductListParams,
  ProductRepository,
} from "@/repositories/interfaces/ProductRepository";

interface ApiProductImage {
  id: string;
  url: string;
  alt: string;
  type: string;
  colorId?: string;
}

interface ApiProductVariant {
  id: string;
  sku: string;
  colorId: string;
  colorLabel?: string;
  colorHex?: string;
  colorFamily?: string;
  widthCm: number;
  heightCm: number;
  curtainHeader?: string;
  eyeletColor?: string;
  lining?: string;
  blindMountingType?: string;
  blindControlSide?: string;
  blindMechanismColor?: string;
  sizeLabel?: string;
  cushionContent?: string;
  cushionClosure?: string;
  chairPadFastening?: string;
  accessoryFinish?: string;
  accessoryMountingType?: string;
  minLengthCm?: number;
  maxLengthCm?: number;
  diameterMm?: number;
  depthCm?: number;
  seatCount?: number;
  plantHeightCm?: number;
  potDiameterCm?: number;
  plantSize?: string;
  packQuantity?: number;
  price: { amountMinor: number; currency: "TND" };
  compareAtPrice?: { amountMinor: number; currency: "TND" };
  availability: string;
  availableQuantity: number;
  imageUrl: string;
  secondaryImageUrl?: string;
  imageIds: string[];
}

interface ApiProductColor {
  id: string;
  name: string;
  slug: string;
  family: string;
  hex: string;
}

interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  reference: string;
  canonicalPath?: string;
  category: string;
  material: string;
  opacityLevel?: string;
  sellingMode: string;
  pattern?: string;
  blindType?: string;
  isLargeWidth: boolean;
  cushionShape?: string;
  removableCover?: boolean;
  machineWashable?: boolean;
  chairPadShape?: string;
  accessoryType?: string;
  accessoryMaterial?: string;
  accessoryCompatibilities?: string[];
  furnitureType?: string;
  furnitureRooms?: string[];
  furnitureStyle?: string;
  furnitureAssembly?: string;
  plantNature?: string;
  plantType?: string;
  plantLightNeed?: string;
  plantCareLevel?: string;
  petFriendly?: boolean;
  potIncluded?: boolean;
  shortDescription: string;
  longDescription: string;
  imageAlt: string;
  images: ApiProductImage[];
  variants: ApiProductVariant[];
  colors: ApiProductColor[];
  details: Record<string, unknown>;
  attributes: Record<string, unknown>;
  seo: { title: string; description: string };
  isThermal: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isOnSale?: boolean;
  createdAt: string;
  recommendationScore: number;
  isDemo: boolean;
}

interface ApiProductListResponse {
  items: ApiProduct[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  categoryCounts?: Record<string, number>;
}

interface ApiProductsByIdsResponse {
  items: ApiProduct[];
}

type ApiCatalogScope = Pick<
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

const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  "rideaux",
  "voilages",
  "stores",
  "coussins",
  "galettes_de_chaise",
  "accessoires",
  "mobilier_interieur",
  "plantes_decoration",
];

const PRODUCT_MATERIALS: readonly ProductMaterial[] = [
  "velours",
  "satin",
  "lin",
  "jacquard",
  "polyester",
  "voile",
  "melange_lin",
  "jacquard_leger",
  "toile_technique",
  "bambou",
  "coton",
  "boucle",
  "fourrure_synthetique",
  "mousse",
  "metal",
  "acier",
  "acier_inoxydable",
  "aluminium",
  "bois",
  "textile",
  "corde",
  "magnetique",
  "bois_massif",
  "rotin",
  "cannage",
  "metal_laque",
  "verre",
  "marbre",
  "ceramique",
  "terre_cuite",
  "cuir_synthetique",
  "fibre_naturelle",
  "plante_naturelle",
  "plante_synthetique",
];

const PRODUCT_AVAILABILITY: readonly ProductAvailability[] = [
  "in_stock",
  "low_stock",
  "out_of_stock",
  "made_to_order",
];

const CURTAINS_SELLING_MODE: readonly CurtainSellingMode[] = [
  "single_panel",
  "pair",
  "pack",
  "ready_made",
];

const OPACITY_LEVELS: readonly OpacityLevel[] = [
  "transparent",
  "tamisant_leger",
  "tamisant",
  "obscurcissant",
  "occultant",
];

const PRODUCT_PATTERNS: readonly ProductPattern[] = ["uni", "brode", "raye", "imprime", "jacquard"];

const BLIND_TYPES: readonly BlindType[] = [
  "enrouleur",
  "jour_nuit",
  "occultant",
  "tamisant",
  "bambou",
];

const CURTAIN_HEADERS: readonly CurtainHeader[] = [
  "oeillets",
  "rail",
  "galon_fronceur",
  "passants",
];

const CURTAIN_LINING: readonly CurtainLining[] = ["sans_doublure", "thermique"];

const CURTAIN_EYELET: readonly EyeletColor[] = ["argent", "dore", "noir"];

const BLIND_MOUNTING: readonly BlindMountingType[] = ["mur", "plafond", "sans_percage"];
const BLIND_CONTROL_SIDE: readonly BlindControlSide[] = ["gauche", "droite"];
const BLIND_MECHANISM: readonly BlindMechanismColor[] = ["blanc", "gris", "noir"];

const CUSHION_SHAPES: readonly CushionShape[] = ["carre", "rectangulaire", "rond"];
const CUSHION_CONTENTS: readonly CushionContent[] = ["housse_seule", "avec_garnissage", "pack"];
const CUSHION_CLOSURES: readonly CushionClosure[] = ["zip", "enveloppe", "sans_fermeture"];
const CHAIR_PAD_SHAPES: readonly ChairPadShape[] = ["carree", "ronde"];
const CHAIR_PAD_FASTENING: readonly ChairPadFastening[] = ["liens", "elastique", "sans_attache"];

const ACCESSORY_TYPES: readonly AccessoryType[] = [
  "tringle_extensible",
  "tringle_fixe",
  "rail",
  "support",
  "embout",
  "anneau",
  "crochet",
  "raccord",
  "embrasse",
  "attache_magnetique",
  "accessoire_pose",
];

const ACCESSORY_MATERIALS: readonly AccessoryMaterial[] = [
  "metal",
  "acier",
  "acier_inoxydable",
  "aluminium",
  "bois",
  "textile",
  "corde",
  "magnetique",
];

const ACCESSORY_FINISHES: readonly AccessoryFinish[] = [
  "noir_mat",
  "argent",
  "dore",
  "bronze",
  "blanc",
  "bois_naturel",
  "beige",
  "taupe",
];
const ACCESSORY_MOUNTING: readonly AccessoryMountingType[] = ["mur", "plafond", "mur_et_plafond"];

const ACCESSORY_COMPAT: readonly AccessoryCompatibility[] = [
  "rideaux_oeillets",
  "voilages_oeillets",
  "rail",
  "tringle_16_19_mm",
  "tringle_20_25_mm",
  "tringle_25_28_mm",
  "montage_mural",
  "montage_plafond",
];

const FURNITURE_TYPES: readonly FurnitureType[] = [
  "canape",
  "fauteuil",
  "chaise",
  "table_basse",
  "table_appoint",
  "meuble_tv",
  "buffet",
  "etagere",
  "console",
  "pouf",
  "tete_de_lit",
  "meridienne",
  "banc",
];
const FURNITURE_ROOMS: readonly FurnitureRoom[] = [
  "salon",
  "chambre",
  "salle_a_manger",
  "bureau",
  "entree",
];
const FURNITURE_STYLES: readonly FurnitureStyle[] = [
  "mediterraneen",
  "contemporain",
  "artisanal",
  "minimaliste",
  "boheme",
];
const FURNITURE_ASSEMBLY: readonly FurnitureAssembly[] = [
  "livre_monte",
  "montage_simple",
  "montage_requis",
];

const PLANT_NATURES: readonly PlantNature[] = ["artificielle", "naturelle", "stabilisee"];
const PLANT_TYPES: readonly PlantType[] = [
  "plante_posee",
  "grande_plante",
  "plante_suspendue",
  "arbre_artificiel",
  "composition",
  "cache_pot",
];

const PLANT_SIZES: readonly PlantSize[] = ["petite", "moyenne", "grande"];
const PLANT_LIGHTS: readonly PlantLightNeed[] = [
  "faible",
  "moderee",
  "vive_indirecte",
  "plein_soleil",
];
const PLANT_CARES: readonly PlantCareLevel[] = ["sans_entretien", "facile", "modere", "exigeant"];
const IMAGE_TYPES: readonly ProductImageType[] = [
  "front",
  "lifestyle",
  "fabric_detail",
  "header_detail",
  "mechanism_detail",
];

const COLOR_FAMILIES: readonly ColorFamily[] = [
  "white",
  "beige",
  "grey",
  "black",
  "brown",
  "red",
  "pink",
  "yellow",
  "orange",
  "green",
  "blue",
  "purple",
  "metallic",
];

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  return fallback;
}

function asStringOptional(value: unknown): string | undefined {
  const text = asString(value, "");
  return text.length > 0 ? text : undefined;
}

function asEnum<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  const candidate = asStringOptional(value);
  if (!candidate) return undefined;
  return allowed.includes(candidate as T) ? (candidate as T) : undefined;
}

function asEnumOrDefault<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return asEnum(value, allowed) ?? fallback;
}

function asEnumArray<T extends string>(value: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(value)) return [];
  const parsed = value
    .map((entry) => asEnum(entry, allowed))
    .filter((entry): entry is T => entry !== undefined);
  return [...new Set(parsed)];
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.trunc(parsed);
  }
  return fallback;
}

function asOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.trunc(parsed);
  }
  return undefined;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
}

function asOptionalBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return undefined;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => asStringOptional(entry))
    .filter((entry): entry is string => entry !== undefined);
}

function asMoneyAmount(value: unknown): number {
  const amount = asNumber(asRecord(value)?.["amountMinor"], 0);
  return Math.max(0, amount);
}

function parseProductDetails(input: unknown) {
  const details = asRecord(input);
  const composition = asStringOptional(details["composition"]);
  const weightGsm = asOptionalNumber(details["weightGsm"]);
  const originNote = asStringOptional(details["originNote"]);

  return {
    care: asStringList(details["care"]),
    features: asStringList(details["features"]),
    installationNotes: asStringList(details["installationNotes"]),
    ...(composition ? { composition } : {}),
    ...(weightGsm !== undefined ? { weightGsm } : {}),
    ...(originNote ? { originNote } : {}),
  };
}

function mapProductImage(image: ApiProductImage) {
  const mapped = {
    id: asString(image.id),
    url: asString(image.url, "/images/placeholder-product.webp"),
    alt: asString(image.alt, "Image produit"),
    type: asEnum(image.type, IMAGE_TYPES) ?? "front",
  };
  const colorId = asStringOptional(image.colorId);
  if (colorId) return { ...mapped, colorId };
  return mapped;
}

function mapProductVariant(variant: ApiProductVariant) {
  const imageUrl = asString(variant.imageUrl, "/images/placeholder-product.webp");
  const secondaryImageUrl = asStringOptional(variant.secondaryImageUrl);
  const mapped: Product["variants"][number] = {
    id: asString(variant.id),
    sku: asString(variant.sku, asString(variant.id)),
    colorId: asString(variant.colorId),
    widthCm: asNumber(variant.widthCm, 0),
    heightCm: asNumber(variant.heightCm, 0),
    availability: asEnumOrDefault(variant.availability, PRODUCT_AVAILABILITY, "out_of_stock"),
    availableQuantity: Math.max(0, asNumber(variant.availableQuantity, 0)),
    imageUrl,
    imageIds: asStringList(variant.imageIds),
    price: { amountMinor: asMoneyAmount(variant.price), currency: "TND" },
  };

  const colorLabel = asStringOptional(variant.colorLabel);
  if (colorLabel) mapped.colorLabel = colorLabel;
  const colorHex = asStringOptional(variant.colorHex);
  if (colorHex) mapped.colorHex = colorHex;
  const colorFamily = asEnum(variant.colorFamily, COLOR_FAMILIES);
  if (colorFamily) mapped.colorFamily = colorFamily;

  const compareAtPrice = asMoneyAmount(variant.compareAtPrice);
  if (compareAtPrice > 0) {
    mapped.compareAtPrice = { amountMinor: compareAtPrice, currency: "TND" };
  }

  const curtainHeader = asEnum(variant.curtainHeader, CURTAIN_HEADERS);
  if (curtainHeader) mapped.curtainHeader = curtainHeader;

  const eyeletColor = asEnum(variant.eyeletColor, CURTAIN_EYELET);
  if (eyeletColor) mapped.eyeletColor = eyeletColor;

  const lining = asEnum(variant.lining, CURTAIN_LINING);
  if (lining) mapped.lining = lining;

  const blindMountingType = asEnum(variant.blindMountingType, BLIND_MOUNTING);
  if (blindMountingType) mapped.blindMountingType = blindMountingType;

  const blindControlSide = asEnum(variant.blindControlSide, BLIND_CONTROL_SIDE);
  if (blindControlSide) mapped.blindControlSide = blindControlSide;

  const blindMechanismColor = asEnum(variant.blindMechanismColor, BLIND_MECHANISM);
  if (blindMechanismColor) mapped.blindMechanismColor = blindMechanismColor;

  const sizeLabel = asStringOptional(variant.sizeLabel);
  if (sizeLabel) mapped.sizeLabel = sizeLabel;

  const cushionContent = asEnum(variant.cushionContent, CUSHION_CONTENTS);
  if (cushionContent) mapped.cushionContent = cushionContent;

  const cushionClosure = asEnum(variant.cushionClosure, CUSHION_CLOSURES);
  if (cushionClosure) mapped.cushionClosure = cushionClosure;

  const chairPadFastening = asEnum(variant.chairPadFastening, CHAIR_PAD_FASTENING);
  if (chairPadFastening) mapped.chairPadFastening = chairPadFastening;

  const accessoryFinish = asEnum(variant.accessoryFinish, ACCESSORY_FINISHES);
  if (accessoryFinish) mapped.accessoryFinish = accessoryFinish;

  const accessoryMountingType = asEnum(variant.accessoryMountingType, ACCESSORY_MOUNTING);
  if (accessoryMountingType) mapped.accessoryMountingType = accessoryMountingType;

  const minLengthCm = asOptionalNumber(variant.minLengthCm);
  if (minLengthCm !== undefined) mapped.minLengthCm = minLengthCm;

  const maxLengthCm = asOptionalNumber(variant.maxLengthCm);
  if (maxLengthCm !== undefined) mapped.maxLengthCm = maxLengthCm;

  const diameterMm = asOptionalNumber(variant.diameterMm);
  if (diameterMm !== undefined) mapped.diameterMm = diameterMm;

  const depthCm = asOptionalNumber(variant.depthCm);
  if (depthCm !== undefined) mapped.depthCm = depthCm;

  const seatCount = asOptionalNumber(variant.seatCount);
  if (seatCount !== undefined) mapped.seatCount = seatCount;

  const plantHeightCm = asOptionalNumber(variant.plantHeightCm);
  if (plantHeightCm !== undefined) mapped.plantHeightCm = plantHeightCm;

  const potDiameterCm = asOptionalNumber(variant.potDiameterCm);
  if (potDiameterCm !== undefined) mapped.potDiameterCm = potDiameterCm;

  const plantSize = asEnum(variant.plantSize, PLANT_SIZES);
  if (plantSize) mapped.plantSize = plantSize;

  const packQuantity = asOptionalNumber(variant.packQuantity);
  if (packQuantity !== undefined) mapped.packQuantity = packQuantity;

  if (secondaryImageUrl) mapped.secondaryImageUrl = secondaryImageUrl;

  return mapped;
}

function mapProductColor(color: ApiProductColor) {
  const id = asString(color.id);
  const name = asString(color.name, "Coloris");
  const slug = asString(color.slug, id || "color");
  const family = asEnum(color.family, COLOR_FAMILIES) ?? "grey";
  const hex = asString(color.hex, "#808080");
  if (!id) return null;
  return { id, name, slug, family, hex };
}

function colorsFromVariants(
  variants: readonly Product["variants"][number][],
  colors: readonly Product["colors"][number][],
): Product["colors"] {
  const byId = new Map(colors.map((color) => [color.id, color]));
  const canonicalByToken = new Map<string, (typeof COLORS)[keyof typeof COLORS]>();
  for (const color of Object.values(COLORS)) {
    canonicalByToken.set(color.id.toLowerCase(), color);
    canonicalByToken.set(color.slug.toLowerCase(), color);
  }

  for (const variant of variants) {
    const id = variant.colorId.trim();
    if (!id || byId.has(id)) continue;
    const canonical = canonicalByToken.get(id.toLowerCase());
    if (canonical) {
      byId.set(id, canonical);
      continue;
    }
    const label = variant.colorLabel?.trim() || id;
    const slug =
      label
        .normalize("NFD")
        .replace(/[\\u0300-\\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || id;
    byId.set(id, {
      id,
      name: label,
      slug,
      family: variant.colorFamily ?? "grey",
      hex: variant.colorHex ?? "#808080",
    });
  }
  return [...byId.values()];
}

export function mapProduct(input: ApiProduct): Product {
  const images = input.images.map((image) => mapProductImage(image));
  const variants = input.variants.map((variant) => mapProductVariant(variant));
  const declaredColors = input.colors
    .map((color) => mapProductColor(color))
    .filter((color): color is NonNullable<ReturnType<typeof mapProductColor>> => color !== null);
  const colors = colorsFromVariants(variants, declaredColors);

  const product: Product = {
    id: asString(input.id),
    slug: asString(input.slug),
    name: asString(input.name),
    reference: asString(input.reference, "N/A"),
    ...(input.canonicalPath?.trim() ? { canonicalPath: input.canonicalPath.trim() } : {}),
    category: asEnumOrDefault(input.category, PRODUCT_CATEGORIES, "mobilier_interieur"),
    material: asEnumOrDefault(input.material, PRODUCT_MATERIALS, "textile"),
    sellingMode: asEnumOrDefault(input.sellingMode, CURTAINS_SELLING_MODE, "ready_made"),
    isLargeWidth: asBoolean(input.isLargeWidth, false),
    shortDescription: asString(input.shortDescription),
    longDescription: asString(input.longDescription),
    imageAlt: asString(input.imageAlt),
    images,
    variants,
    colors,
    details: parseProductDetails(input.details),
    attributes: input.attributes,
    seo: {
      title: asString(input.seo?.title, asString(input.name)),
      description: asString(input.seo?.description, asString(input.shortDescription)),
      ...(images[0]?.url && /^https?:\/\//i.test(images[0].url) ? { ogImage: images[0].url } : {}),
    },
    isThermal: asBoolean(input.isThermal, false),
    isNew: asBoolean(input.isNew, false),
    isBestSeller: asBoolean(input.isBestSeller, false),
    isFeatured: asBoolean(input.isFeatured, false),
    isOnSale: asBoolean(input.isOnSale, false),
    createdAt: asString(input.createdAt, new Date().toISOString()),
    recommendationScore: asNumber(input.recommendationScore, 0),
    isDemo: asBoolean(input.isDemo, false),
  };

  const opacityLevel = asEnum(input.opacityLevel, OPACITY_LEVELS);
  if (opacityLevel) product.opacityLevel = opacityLevel;

  const pattern = asEnum(input.pattern, PRODUCT_PATTERNS);
  if (pattern) product.pattern = pattern;

  const blindType = asEnum(input.blindType, BLIND_TYPES);
  if (blindType) product.blindType = blindType;

  const cushionShape = asEnum(input.cushionShape, CUSHION_SHAPES);
  if (cushionShape) product.cushionShape = cushionShape;

  const removableCover = asOptionalBoolean(input.removableCover);
  if (removableCover !== undefined) product.removableCover = removableCover;

  const machineWashable = asOptionalBoolean(input.machineWashable);
  if (machineWashable !== undefined) product.machineWashable = machineWashable;

  const chairPadShape = asEnum(input.chairPadShape, CHAIR_PAD_SHAPES);
  if (chairPadShape) product.chairPadShape = chairPadShape;

  const accessoryType = asEnum(input.accessoryType, ACCESSORY_TYPES);
  if (accessoryType) product.accessoryType = accessoryType;

  const accessoryMaterial = asEnum(input.accessoryMaterial, ACCESSORY_MATERIALS);
  if (accessoryMaterial) product.accessoryMaterial = accessoryMaterial;

  const accessoryCompatibilities = asEnumArray(input.accessoryCompatibilities, ACCESSORY_COMPAT);
  if (accessoryCompatibilities.length) product.accessoryCompatibilities = accessoryCompatibilities;

  const furnitureType = asEnum(input.furnitureType, FURNITURE_TYPES);
  if (furnitureType) product.furnitureType = furnitureType;

  const furnitureRooms = asEnumArray(input.furnitureRooms, FURNITURE_ROOMS);
  if (furnitureRooms.length) product.furnitureRooms = furnitureRooms;

  const furnitureStyle = asEnum(input.furnitureStyle, FURNITURE_STYLES);
  if (furnitureStyle) product.furnitureStyle = furnitureStyle;

  const furnitureAssembly = asEnum(input.furnitureAssembly, FURNITURE_ASSEMBLY);
  if (furnitureAssembly) product.furnitureAssembly = furnitureAssembly;

  const plantNature = asEnum(input.plantNature, PLANT_NATURES);
  if (plantNature) product.plantNature = plantNature;

  const plantType = asEnum(input.plantType, PLANT_TYPES);
  if (plantType) product.plantType = plantType;

  const plantLightNeed = asEnum(input.plantLightNeed, PLANT_LIGHTS);
  if (plantLightNeed) product.plantLightNeed = plantLightNeed;

  const plantCareLevel = asEnum(input.plantCareLevel, PLANT_CARES);
  if (plantCareLevel) product.plantCareLevel = plantCareLevel;

  const petFriendly = asOptionalBoolean(input.petFriendly);
  if (petFriendly !== undefined) product.petFriendly = petFriendly;

  const potIncluded = asOptionalBoolean(input.potIncluded);
  if (potIncluded !== undefined) product.potIncluded = potIncluded;

  return product;
}

function toQueryValue(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.length > 0 ? value.join(",") : undefined;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

function toQueryString(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  for (const [key, raw] of Object.entries(params)) {
    const value = toQueryValue(raw);
    if (value !== undefined) query.set(key, value);
  }
  return query.toString();
}

function mapScope(scope?: CatalogScope): ApiCatalogScope | undefined {
  if (!scope) return undefined;
  return {
    categories: scope.categories,
    categorySlugs: scope.categorySlugs,
    materials: scope.materials,
    opacityLevels: scope.opacityLevels,
    curtainHeaders: scope.curtainHeaders,
    patterns: scope.patterns,
    blindTypes: scope.blindTypes,
    shapes: scope.shapes,
    accessoryTypes: scope.accessoryTypes,
    furnitureTypes: scope.furnitureTypes,
    furnitureRooms: scope.furnitureRooms,
    furnitureStyles: scope.furnitureStyles,
    plantNatures: scope.plantNatures,
    plantTypes: scope.plantTypes,
    plantSizes: scope.plantSizes,
    sellingMode: scope.sellingMode,
    onlyThermal: scope.onlyThermal,
    onlyLargeWidth: scope.onlyLargeWidth,
  };
}

export class ApiProductRepository implements ProductRepository {
  constructor(private readonly apiClient: HbsApiClient = new HbsApiClient()) {}

  async list(params: ProductListParams): Promise<PaginatedProducts> {
    const query = toQueryString({
      q: params.query,
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
      categories: params.categories,
      categorySlugs: params.categorySlugs,
      materials: params.materials,
      colors: params.colors,
      opacityLevels: params.opacityLevels,
      curtainHeaders: params.curtainHeaders,
      patterns: params.patterns,
      blindTypes: params.blindTypes,
      shapes: params.shapes,
      cushionContents: params.cushionContents,
      chairPadFastenings: params.chairPadFastenings,
      accessoryTypes: params.accessoryTypes,
      accessoryFinishes: params.accessoryFinishes,
      mountings: params.mountings,
      controlSides: params.controlSides,
      widths: params.widths,
      heights: params.heights,
      availability: params.availability,
      minPriceMinor: params.minPriceMinor,
      maxPriceMinor: params.maxPriceMinor,
      sellingMode: params.sellingMode,
      onlyNew: params.onlyNew,
      onlyBestSellers: params.onlyBestSellers,
      onlyDiscounted: params.onlyDiscounted,
      onlyThermal: params.onlyThermal,
      onlyLargeWidth: params.onlyLargeWidth,
      plantCareLevels: params.plantCareLevels,
      plantLightNeeds: params.plantLightNeeds,
      plantNatures: params.plantNatures,
      plantTypes: params.plantTypes,
      plantSizes: params.plantSizes,
      furnitureTypes: params.furnitureTypes,
      furnitureRooms: params.furnitureRooms,
      furnitureStyles: params.furnitureStyles,
    });

    const response = await this.apiClient.get<ApiProductListResponse>(`/api/v1/products?${query}`);
    return {
      items: response.items.map(mapProduct),
      page: response.page,
      pageSize: response.pageSize,
      total: response.total,
      totalPages: response.totalPages,
      ...(response.categoryCounts ? { categoryCounts: response.categoryCounts } : {}),
    };
  }

  async getBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await this.apiClient.get<ApiProduct>(
        `/api/v1/products/${encodeURIComponent(slug)}`,
      );
      return mapProduct(response);
    } catch (error) {
      if (error instanceof HbsApiError && error.status === 404) return null;
      throw error;
    }
  }

  async getById(id: string): Promise<Product | null> {
    const products = await this.getByIds([id]);
    return products[0] ?? null;
  }

  async getByIds(ids: string[]): Promise<Product[]> {
    const normalized = [...new Set(ids.map((id) => asString(id, "").trim()).filter(Boolean))];
    if (normalized.length === 0) return [];

    const response = await this.apiClient.get<ApiProductsByIdsResponse>(
      `/api/v1/products/by-ids?ids=${encodeURIComponent(normalized.join(","))}`,
    );
    return response.items.map(mapProduct);
  }

  async listScope(scope?: CatalogScope): Promise<Product[]> {
    const normalizedScope = mapScope(scope);
    const query = normalizedScope ? toQueryString(normalizedScope) : "";
    const response = await this.apiClient.get<ApiProduct[]>(
      `/api/v1/products/scope${query ? `?${query}` : ""}`,
    );
    return response.map(mapProduct);
  }

  async listRelated(slug: string, limit = 4): Promise<Product[]> {
    const query = toQueryString({ limit });
    return (
      await this.apiClient.get<ApiProduct[]>(
        `/api/v1/products/${encodeURIComponent(slug)}/related${query ? `?${query}` : ""}`,
      )
    ).map(mapProduct);
  }
}
