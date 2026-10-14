import type { Product, ProductVariant } from "@/domain/product/product.types";

const CURTAIN_ROD_TYPES = new Set(["tringle_extensible", "tringle_fixe"]);

/**
 * Les tringles sont vendues selon leur coloris et leur mode de pose. Leur
 * largeur/hauteur technique n'est pas une dimension sélectionnable côté client.
 */
export function isCurtainRodAccessory(
  product: Pick<Product, "category" | "accessoryType">,
): boolean {
  return product.category === "accessoires" && CURTAIN_ROD_TYPES.has(product.accessoryType ?? "");
}

/** Une variante possède une dimension affichable dans le sélecteur client. */
export function hasDisplayableSize(
  variant: Pick<ProductVariant, "widthCm" | "heightCm" | "sizeLabel">,
): boolean {
  if (variant.sizeLabel?.trim()) return true;
  return variant.widthCm > 0 && variant.heightCm > 0;
}
