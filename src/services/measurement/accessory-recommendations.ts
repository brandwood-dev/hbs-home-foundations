import { MEASUREMENT_MAX_ACCESSORY_RECOMMENDATIONS } from "@/domain/measurement/measurement.constants";
import type {
  CurtainSupportType,
  MeasurementAccessoryRecommendation,
} from "@/domain/measurement/measurement.types";
import type { CurtainHeader, Product, ProductVariant } from "@/domain/product/product.types";
import { formatCm } from "@/services/measurement/curtain-measurement";

/** Une tringle convient si sa plage d'extension contient la largeur de support. */
export function fitsRodLengthRange(variant: ProductVariant, supportWidthCm: number): boolean {
  const min = variant.minLengthCm;
  const max = variant.maxLengthCm;
  if (typeof min === "number" && typeof max === "number") {
    return supportWidthCm >= min && supportWidthCm <= max;
  }
  if (typeof max === "number") return supportWidthCm <= max;
  return variant.widthCm >= supportWidthCm;
}

function isRod(product: Product): boolean {
  return product.accessoryType === "tringle_extensible";
}

function isRail(product: Product): boolean {
  return product.accessoryType === "rail";
}

/**
 * Recommandation d'accessoires basée uniquement sur les compatibilités structurées
 * (`accessoryCompatibilities`, plages de longueur), jamais sur le nom du produit.
 */
export function findCompatibleAccessoryRecommendations(options: {
  products: Product[];
  supportType: CurtainSupportType;
  supportWidthCm: number;
  header?: CurtainHeader | undefined;
  projectType: "rideaux" | "voilages" | "stores";
}): MeasurementAccessoryRecommendation[] {
  const { products, supportType, supportWidthCm, header, projectType } = options;
  if (projectType === "stores") return [];
  if (supportType === "inconnu") return [];

  const wantsRail = supportType === "rail";
  const compatibilityKey = wantsRail
    ? "rail"
    : projectType === "voilages"
      ? "voilages_oeillets"
      : "rideaux_oeillets";

  const out: MeasurementAccessoryRecommendation[] = [];

  for (const product of products) {
    if (product.category !== "accessoires") continue;
    const compatibilities = product.accessoryCompatibilities ?? [];
    const structural = wantsRail ? isRail(product) : isRod(product);
    const declaredCompatible = compatibilities.includes(compatibilityKey);
    const isCompanion =
      product.accessoryType === "support" ||
      product.accessoryType === "embout" ||
      product.accessoryType === "anneau" ||
      product.accessoryType === "crochet";

    if (!structural && !(isCompanion && declaredCompatible)) continue;
    if (structural && !declaredCompatible && !wantsRail) continue;
    if (header === "rail" && !wantsRail && structural) continue;
    if (structural && !wantsRail && product.accessoryMaterial !== "acier_inoxydable") continue;

    const variant = structural
      ? product.variants.find(
          (candidate) =>
            candidate.availability !== "out_of_stock" &&
            fitsRodLengthRange(candidate, supportWidthCm) &&
            (candidate.minLengthCm ?? candidate.widthCm) >= 150 &&
            (candidate.maxLengthCm ?? candidate.widthCm) <= 300,
        )
      : product.variants.find((candidate) => candidate.availability !== "out_of_stock");

    if (!variant) continue;

    const reasons: string[] = [];
    if (structural) {
      const min = variant.minLengthCm;
      const max = variant.maxLengthCm;
      reasons.push(
        typeof min === "number" && typeof max === "number"
          ? `Plage ${formatCm(min)} à ${formatCm(max)} : couvre votre support de ${formatCm(supportWidthCm)}.`
          : `Longueur compatible avec un support de ${formatCm(supportWidthCm)}.`,
      );
      if (variant.diameterMm) reasons.push(`Diamètre ${variant.diameterMm} mm.`);
    } else {
      reasons.push("Compatibilité déclarée avec votre type de pose.");
    }

    out.push({ product, variant, reasons });
  }

  return out
    .sort((a, b) => a.variant.price.amountMinor - b.variant.price.amountMinor)
    .slice(0, MEASUREMENT_MAX_ACCESSORY_RECOMMENDATIONS);
}
