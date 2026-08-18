import type { AdminVariant } from "@/admin/types/admin.types";
import type { AdminVariantAxisKey } from "@/admin/config/admin-variant-axes.config";

export interface VariantValidationContext {
  axes: AdminVariantAxisKey[];
  siblings: AdminVariant[];
  /** SKU utilisés par les autres produits. */
  foreignSkus: string[];
  supportsInventory: boolean;
  requiresPrice: boolean;
}

/** Signature unique d'une combinaison d'options (tous axes confondus). */
export function variantCombinationKey(variant: AdminVariant): string {
  const options = Object.entries(variant.options ?? {})
    .filter(([, value]) => value !== "" && value != null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(",");
  return [
    variant.colorId,
    variant.widthCm,
    variant.heightCm,
    variant.curtainHeader,
    variant.eyeletColor ?? "-",
    variant.lining ?? "-",
    variant.packQuantity ?? "-",
    options,
  ].join("|");
}

/** Validation locale : le repository revalide systématiquement de son côté. */
export function validateVariant(
  variant: AdminVariant,
  context: VariantValidationContext,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const sku = variant.sku.trim().toUpperCase();

  if (!sku) errors["sku"] = "Le SKU est obligatoire.";
  else if (
    context.siblings.some((item) => item.id !== variant.id && item.sku.trim().toUpperCase() === sku)
  ) {
    errors["sku"] = "Ce SKU est déjà utilisé par une autre variante.";
  } else if (context.foreignSkus.some((item) => item.trim().toUpperCase() === sku)) {
    errors["sku"] = "Ce SKU est déjà utilisé par un autre produit.";
  }

  const combo = variantCombinationKey(variant);
  if (
    context.siblings.some((item) => item.id !== variant.id && variantCombinationKey(item) === combo)
  ) {
    errors["combination"] = "Une variante possède déjà exactement cette combinaison d'options.";
  }

  if (context.requiresPrice && variant.priceMinor <= 0) {
    errors["priceMinor"] = "Le prix de vente est obligatoire.";
  }
  if (variant.priceMinor < 0) errors["priceMinor"] = "Le prix ne peut pas être négatif.";
  if (variant.compareAtPriceMinor != null && variant.compareAtPriceMinor < variant.priceMinor) {
    errors["compareAtPriceMinor"] = "L'ancien prix doit être supérieur ou égal au prix actuel.";
  }
  if (context.supportsInventory) {
    if (variant.stock < 0) errors["stock"] = "Le stock ne peut pas être négatif.";
    if (variant.lowStockThreshold < 0) errors["lowStockThreshold"] = "Le seuil doit être positif.";
  }
  if (variant.packQuantity != null && variant.packQuantity < 1) {
    errors["packQuantity"] = "La quantité du lot doit être au minimum de 1.";
  }
  if (variant.widthCm < 0 || variant.heightCm < 0) {
    errors["dimensions"] = "Les dimensions ne peuvent pas être négatives.";
  }

  const options = variant.options ?? {};
  const minLength = Number(options["length_min"] ?? 0);
  const maxLength = Number(options["length_max"] ?? 0);
  if (minLength && maxLength && maxLength < minLength) {
    errors["length"] = "La longueur maximale doit être supérieure à la longueur minimale.";
  }

  if (
    variant.eyeletColor &&
    context.axes.includes("eyelet_color") &&
    variant.curtainHeader !== "oeillets"
  ) {
    errors["eyeletColor"] = "La couleur d'œillets exige une tête « Œillets ».";
  }
  if (variant.lining && variant.lining !== "sans_doublure" && !context.axes.includes("lining")) {
    errors["lining"] = "Cette catégorie ne gère pas la doublure.";
  }
  if (options["orientation"] && !context.axes.includes("orientation")) {
    errors["orientation"] = "Cette catégorie ne gère pas l'orientation.";
  }

  return errors;
}
