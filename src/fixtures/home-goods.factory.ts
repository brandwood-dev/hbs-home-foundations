import { MATERIAL_LABELS } from "@/domain/product/product.constants";
import type {
  AccessoryCompatibility,
  AccessoryFinish,
  AccessoryMaterial,
  AccessoryMountingType,
  AccessoryType,
  ChairPadFastening,
  ChairPadShape,
  CurtainSellingMode,
  CushionClosure,
  CushionContent,
  CushionShape,
  Product,
  ProductAvailability,
  ProductCategory,
  ProductColor,
  ProductDetails,
  ProductImage,
  ProductMaterial,
  ProductVariant,
} from "@/domain/product/product.types";
import { money } from "@/lib/money/money";

/**
 * Fabrique dédiée aux produits non textiles de fenêtre :
 * coussins, galettes de chaise et accessoires.
 * Le modèle `Product` reste identique, seuls les axes de variantes changent.
 */

export interface HomeGoodVariantSeed {
  color: ProductColor;
  /** Dimensions techniques (cm). Pour une tringle : longueur minimale et maximale. */
  widthCm: number;
  heightCm: number;
  /** Libellé affiché à la place de « l × h » quand la dimension n'est pas rectangulaire. */
  sizeLabel?: string;
  priceMinor: number;
  compareAtMinor?: number;
  availability: ProductAvailability;
  quantity: number;
  thicknessCm?: number;
  diameterMm?: number;
  minLengthCm?: number;
  maxLengthCm?: number;
  packQuantity?: number;
}

export interface HomeGoodSeed {
  slug: string;
  name: string;
  reference: string;
  category: Extract<ProductCategory, "coussins" | "galettes_de_chaise" | "accessoires">;
  material: ProductMaterial;
  sellingMode: CurtainSellingMode;

  /** Coussins. */
  cushionShape?: CushionShape;
  cushionContents?: CushionContent[];
  cushionClosure?: CushionClosure;
  removableCover?: boolean;
  machineWashable?: boolean;
  /** Supplément appliqué quand le garnissage est inclus (millimes). */
  fillingSurchargeMinor?: number;

  /** Galettes de chaise. */
  chairPadShape?: ChairPadShape;
  chairPadFastenings?: ChairPadFastening[];

  /** Accessoires. */
  accessoryType?: AccessoryType;
  accessoryMaterial?: AccessoryMaterial;
  accessoryFinishes?: AccessoryFinish[];
  accessoryMountings?: AccessoryMountingType[];
  accessoryCompatibilities?: AccessoryCompatibility[];

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

  variants: HomeGoodVariantSeed[];
}

/** Association coloris → finition, utilisée pour les accessoires métalliques et bois. */
const FINISH_BY_COLOR_SLUG: Record<string, AccessoryFinish> = {
  noir: "noir_mat",
  argent: "argent",
  dore: "dore",
  chocolat: "bronze",
  blanc: "blanc",
  "bois-naturel": "bois_naturel",
  beige: "beige",
  grege: "taupe",
};

const CONTENT_SUFFIX: Record<CushionContent, string> = {
  housse_seule: "HS",
  avec_garnissage: "AG",
  pack: "PK",
};

const FASTENING_SUFFIX: Record<ChairPadFastening, string> = {
  liens: "LI",
  elastique: "EL",
  sans_attache: "SA",
};

const MOUNTING_SUFFIX: Record<AccessoryMountingType, string> = {
  mur: "MU",
  plafond: "PL",
  mur_et_plafond: "MP",
};

export function buildHomeGood(seed: HomeGoodSeed, index: number, prefix: string): Product {
  const colors: ProductColor[] = [];
  for (const variant of seed.variants) {
    if (!colors.some((color) => color.id === variant.color.id)) colors.push(variant.color);
  }

  const imagePool = [seed.image, seed.secondaryImage ?? seed.image];
  const images: ProductImage[] = colors.map((color, colorIndex) => ({
    id: `${seed.slug}-color-${color.slug}`,
    url: imagePool[colorIndex % imagePool.length] as string,
    alt: `${seed.name} — coloris ${color.name.toLowerCase()}`,
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

  const galleryFor = (variant: HomeGoodVariantSeed) => [
    `${seed.slug}-color-${variant.color.slug}`,
    lifestyleId,
    detailId,
  ];

  const variants: ProductVariant[] = [];

  const pushVariant = (
    variant: HomeGoodVariantSeed,
    variantIndex: number,
    axisIndex: number,
    suffix: string,
    surcharge: number,
    extra: Partial<ProductVariant>,
  ) => {
    const quantity =
      variant.availability === "out_of_stock" ? 0 : Math.max(0, variant.quantity - axisIndex);
    const availability =
      quantity === 0 && variant.availability === "in_stock"
        ? "made_to_order"
        : variant.availability;

    variants.push({
      id: `${seed.slug}-v${variantIndex + 1}-${axisIndex + 1}`,
      sku: `${seed.reference}-${variant.color.slug.toUpperCase()}-${variant.widthCm}x${variant.heightCm}-${suffix}`,
      colorId: variant.color.id,
      widthCm: variant.widthCm,
      heightCm: variant.heightCm,
      ...(variant.sizeLabel ? { sizeLabel: variant.sizeLabel } : {}),
      ...(variant.thicknessCm ? { thicknessCm: variant.thicknessCm } : {}),
      ...(variant.diameterMm ? { diameterMm: variant.diameterMm } : {}),
      ...(variant.minLengthCm ? { minLengthCm: variant.minLengthCm } : {}),
      ...(variant.maxLengthCm ? { maxLengthCm: variant.maxLengthCm } : {}),
      ...(variant.packQuantity ? { packQuantity: variant.packQuantity } : {}),
      ...extra,
      price: money(variant.priceMinor + surcharge),
      ...(variant.compareAtMinor
        ? { compareAtPrice: money(variant.compareAtMinor + surcharge) }
        : {}),
      availability,
      availableQuantity: quantity,
      imageUrl: seed.image,
      ...(seed.secondaryImage ? { secondaryImageUrl: seed.secondaryImage } : {}),
      imageIds: galleryFor(variant),
    });
  };

  seed.variants.forEach((variant, variantIndex) => {
    if (seed.category === "coussins") {
      const contents = seed.cushionContents ?? ["housse_seule", "avec_garnissage"];
      contents.forEach((content, contentIndex) => {
        const surcharge = content === "avec_garnissage" ? (seed.fillingSurchargeMinor ?? 0) : 0;
        pushVariant(variant, variantIndex, contentIndex, CONTENT_SUFFIX[content], surcharge, {
          cushionContent: content,
          ...(seed.cushionClosure ? { cushionClosure: seed.cushionClosure } : {}),
        });
      });
      return;
    }

    if (seed.category === "galettes_de_chaise") {
      const fastenings = seed.chairPadFastenings ?? ["liens"];
      fastenings.forEach((fastening, fasteningIndex) => {
        pushVariant(variant, variantIndex, fasteningIndex, FASTENING_SUFFIX[fastening], 0, {
          chairPadFastening: fastening,
        });
      });
      return;
    }

    const mountings = seed.accessoryMountings ?? [];
    const finish =
      FINISH_BY_COLOR_SLUG[variant.color.slug] ?? seed.accessoryFinishes?.[0] ?? "noir_mat";

    if (mountings.length === 0) {
      pushVariant(variant, variantIndex, 0, "STD", 0, { accessoryFinish: finish });
      return;
    }

    mountings.forEach((mounting, mountingIndex) => {
      pushVariant(variant, variantIndex, mountingIndex, MOUNTING_SUFFIX[mounting], 0, {
        accessoryFinish: finish,
        accessoryMountingType: mounting,
      });
    });
  });

  return {
    id: `${prefix}-${String(index + 1).padStart(3, "0")}`,
    slug: seed.slug,
    name: seed.name,
    reference: seed.reference,
    category: seed.category,
    material: seed.material,
    sellingMode: seed.sellingMode,
    isLargeWidth: false,
    ...(seed.cushionShape ? { cushionShape: seed.cushionShape } : {}),
    ...(seed.removableCover != null ? { removableCover: seed.removableCover } : {}),
    ...(seed.machineWashable != null ? { machineWashable: seed.machineWashable } : {}),
    ...(seed.chairPadShape ? { chairPadShape: seed.chairPadShape } : {}),
    ...(seed.accessoryType ? { accessoryType: seed.accessoryType } : {}),
    ...(seed.accessoryMaterial ? { accessoryMaterial: seed.accessoryMaterial } : {}),
    ...(seed.accessoryCompatibilities
      ? { accessoryCompatibilities: seed.accessoryCompatibilities }
      : {}),
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

export function buildHomeGoods(seeds: HomeGoodSeed[], prefix: string): Product[] {
  return seeds.map((seed, index) => buildHomeGood(seed, index, prefix));
}
