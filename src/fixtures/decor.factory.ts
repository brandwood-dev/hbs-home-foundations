import { MATERIAL_LABELS } from "@/domain/product/product.constants";
import type {
  CurtainSellingMode,
  FurnitureAssembly,
  FurnitureRoom,
  FurnitureStyle,
  FurnitureType,
  PlantCareLevel,
  PlantLightNeed,
  PlantNature,
  PlantSize,
  PlantType,
  Product,
  ProductAvailability,
  ProductCategory,
  ProductColor,
  ProductDetails,
  ProductImage,
  ProductMaterial,
  ProductVariant,
  ShippingProfile,
} from "@/domain/product/product.types";
import { money } from "@/lib/money/money";

/**
 * Fabrique dédiée au mobilier d'intérieur et aux plantes de décoration.
 * Le modèle `Product` reste inchangé : seuls les axes de variantes diffèrent.
 * Une variante = un coloris/finition × un format (taille de meuble ou de plante).
 */

export interface DecorVariantSeed {
  color: ProductColor;
  /** Dimensions hors tout du meuble ou de la plante avec son pot (cm). */
  widthCm: number;
  heightCm: number;
  depthCm?: number;
  sizeLabel?: string;

  /** Mobilier. */
  seatCount?: number;

  /** Plantes. */
  plantSize?: PlantSize;
  plantHeightCm?: number;
  potDiameterCm?: number;

  priceMinor: number;
  compareAtMinor?: number;
  availability: ProductAvailability;
  quantity: number;
}

export interface DecorSeed {
  slug: string;
  name: string;
  reference: string;
  category: Extract<ProductCategory, "mobilier_interieur" | "plantes_decoration">;
  material: ProductMaterial;
  sellingMode: CurtainSellingMode;
  shippingProfile: ShippingProfile;

  /** Mobilier. */
  furnitureType?: FurnitureType;
  furnitureRooms?: FurnitureRoom[];
  furnitureStyle?: FurnitureStyle;
  furnitureAssembly?: FurnitureAssembly;

  /** Plantes. */
  plantNature?: PlantNature;
  plantType?: PlantType;
  plantLightNeed?: PlantLightNeed;
  plantCareLevel?: PlantCareLevel;
  petFriendly?: boolean;
  potIncluded?: boolean;

  shortDescription: string;
  longDescription: string;
  imageAlt: string;
  image: string;
  secondaryImage?: string;
  detailImage?: string;

  details: ProductDetails;

  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  createdAt: string;
  recommendationScore: number;

  variants: DecorVariantSeed[];
}

function sizeSuffix(variant: DecorVariantSeed, index: number): string {
  if (variant.plantSize) return variant.plantSize.slice(0, 2).toUpperCase();
  return `T${index + 1}`;
}

export function buildDecorItem(seed: DecorSeed, index: number, prefix: string): Product {
  const colors: ProductColor[] = [];
  for (const variant of seed.variants) {
    if (!colors.some((color) => color.id === variant.color.id)) colors.push(variant.color);
  }

  const imagePool = [seed.image, seed.secondaryImage ?? seed.image];
  const images: ProductImage[] = colors.map((color, colorIndex) => ({
    id: `${seed.slug}-color-${color.slug}`,
    url: imagePool[colorIndex % imagePool.length] as string,
    alt: `${seed.name} — finition ${color.name.toLowerCase()}`,
    type: "front",
    colorId: color.id,
  }));

  const lifestyleId = `${seed.slug}-lifestyle`;
  const detailId = `${seed.slug}-detail`;
  images.push(
    {
      id: lifestyleId,
      url: seed.secondaryImage ?? seed.image,
      alt: `${seed.name} en situation dans un intérieur méditerranéen`,
      type: "lifestyle",
    },
    {
      id: detailId,
      url: seed.detailImage ?? seed.image,
      alt: `Gros plan sur la finition ${MATERIAL_LABELS[seed.material].toLowerCase()} du ${seed.name}`,
      type: "fabric_detail",
    },
  );

  const variants: ProductVariant[] = seed.variants.map((variant, variantIndex) => ({
    id: `${seed.slug}-v${variantIndex + 1}`,
    sku: `${seed.reference}-${variant.color.slug.toUpperCase()}-${sizeSuffix(variant, variantIndex)}`,
    colorId: variant.color.id,
    widthCm: variant.widthCm,
    heightCm: variant.heightCm,
    ...(variant.depthCm ? { depthCm: variant.depthCm } : {}),
    ...(variant.sizeLabel ? { sizeLabel: variant.sizeLabel } : {}),
    ...(variant.seatCount ? { seatCount: variant.seatCount } : {}),
    ...(variant.plantSize ? { plantSize: variant.plantSize } : {}),
    ...(variant.plantHeightCm ? { plantHeightCm: variant.plantHeightCm } : {}),
    ...(variant.potDiameterCm ? { potDiameterCm: variant.potDiameterCm } : {}),
    price: money(variant.priceMinor),
    ...(variant.compareAtMinor ? { compareAtPrice: money(variant.compareAtMinor) } : {}),
    availability: variant.availability,
    availableQuantity: variant.availability === "out_of_stock" ? 0 : variant.quantity,
    imageUrl: seed.image,
    ...(seed.secondaryImage ? { secondaryImageUrl: seed.secondaryImage } : {}),
    imageIds: [`${seed.slug}-color-${variant.color.slug}`, lifestyleId, detailId],
  }));

  return {
    id: `${prefix}-${String(index + 1).padStart(3, "0")}`,
    slug: seed.slug,
    name: seed.name,
    reference: seed.reference,
    category: seed.category,
    material: seed.material,
    sellingMode: seed.sellingMode,
    isLargeWidth: false,
    shippingProfile: seed.shippingProfile,
    ...(seed.furnitureType ? { furnitureType: seed.furnitureType } : {}),
    ...(seed.furnitureRooms ? { furnitureRooms: seed.furnitureRooms } : {}),
    ...(seed.furnitureStyle ? { furnitureStyle: seed.furnitureStyle } : {}),
    ...(seed.furnitureAssembly ? { furnitureAssembly: seed.furnitureAssembly } : {}),
    ...(seed.plantNature ? { plantNature: seed.plantNature } : {}),
    ...(seed.plantType ? { plantType: seed.plantType } : {}),
    ...(seed.plantLightNeed ? { plantLightNeed: seed.plantLightNeed } : {}),
    ...(seed.plantCareLevel ? { plantCareLevel: seed.plantCareLevel } : {}),
    ...(seed.petFriendly != null ? { petFriendly: seed.petFriendly } : {}),
    ...(seed.potIncluded != null ? { potIncluded: seed.potIncluded } : {}),
    shortDescription: seed.shortDescription,
    longDescription: seed.longDescription,
    imageAlt: seed.imageAlt,
    images,
    variants,
    colors,
    details: seed.details,
    seo: {
      title: `${seed.name} | HBS HOME`,
      description:
        `${seed.shortDescription} Livraison partout en Tunisie, paiement à la livraison.`.slice(
          0,
          158,
        ),
    },
    isThermal: false,
    isNew: seed.isNew,
    isBestSeller: seed.isBestSeller,
    isFeatured: seed.isFeatured,
    createdAt: seed.createdAt,
    recommendationScore: seed.recommendationScore,
    isDemo: true,
  };
}

export function buildDecorItems(seeds: DecorSeed[], prefix: string): Product[] {
  return seeds.map((seed, index) => buildDecorItem(seed, index, prefix));
}
