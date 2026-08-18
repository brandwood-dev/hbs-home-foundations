import {
  ACCESSORY_FINISH_LABELS,
  ACCESSORY_MOUNTING_LABELS,
  ACCESSORY_TYPE_LABELS,
  BLIND_CONTROL_SIDE_LABELS,
  CHAIR_PAD_FASTENING_LABELS,
  CHAIR_PAD_SHAPE_LABELS,
  CUSHION_CLOSURE_LABELS,
  CUSHION_CONTENT_LABELS,
  CUSHION_SHAPE_LABELS,
  BLIND_MECHANISM_COLOR_LABELS,
  BLIND_MOUNTING_LABELS,
  BLIND_TYPE_LABELS,
  EYELET_COLOR_LABELS,
  HEADER_LABELS,
  LINING_LABELS,
  PATTERN_LABELS,
} from "@/domain/product/product.constants";
import type { Product, ProductOptionDisplay, ProductVariant } from "@/domain/product/product.types";

/**
 * Options d'une variante prêtes à afficher, dans l'ordre logique de la catégorie.
 * Utilisé par le panier, la commande et le suivi pour rester agnostique du produit.
 */
export function getVariantDisplayOptions(
  product: Product,
  variant: ProductVariant,
): ProductOptionDisplay[] {
  const options: ProductOptionDisplay[] = [];

  const color = product.colors.find((entry) => entry.id === variant.colorId);
  if (color) options.push({ label: "Coloris", value: color.name });

  options.push({
    label: "Dimensions",
    value: variant.sizeLabel ?? `${variant.widthCm} × ${variant.heightCm} cm`,
  });

  if (product.category === "coussins") {
    if (product.cushionShape) {
      options.push({ label: "Forme", value: CUSHION_SHAPE_LABELS[product.cushionShape] });
    }
    if (variant.cushionContent) {
      options.push({ label: "Contenu", value: CUSHION_CONTENT_LABELS[variant.cushionContent] });
    }
    if (variant.cushionClosure) {
      options.push({ label: "Fermeture", value: CUSHION_CLOSURE_LABELS[variant.cushionClosure] });
    }
    return options;
  }

  if (product.category === "galettes_de_chaise") {
    if (product.chairPadShape) {
      options.push({ label: "Forme", value: CHAIR_PAD_SHAPE_LABELS[product.chairPadShape] });
    }
    if (variant.thicknessCm) {
      options.push({ label: "Épaisseur", value: `${variant.thicknessCm} cm` });
    }
    if (variant.chairPadFastening) {
      options.push({
        label: "Fixation",
        value: CHAIR_PAD_FASTENING_LABELS[variant.chairPadFastening],
      });
    }
    return options;
  }

  if (product.category === "accessoires") {
    if (product.accessoryType) {
      options.push({ label: "Type", value: ACCESSORY_TYPE_LABELS[product.accessoryType] });
    }
    if (variant.accessoryFinish) {
      options.push({ label: "Finition", value: ACCESSORY_FINISH_LABELS[variant.accessoryFinish] });
    }
    if (variant.accessoryMountingType) {
      options.push({
        label: "Pose",
        value: ACCESSORY_MOUNTING_LABELS[variant.accessoryMountingType],
      });
    }
    if (variant.diameterMm) options.push({ label: "Diamètre", value: `${variant.diameterMm} mm` });
    if (variant.packQuantity) {
      options.push({ label: "Conditionnement", value: `Lot de ${variant.packQuantity}` });
    }
    return options;
  }

  if (product.category === "stores") {
    if (product.blindType)
      options.push({ label: "Type", value: BLIND_TYPE_LABELS[product.blindType] });
    if (variant.blindMountingType) {
      options.push({ label: "Pose", value: BLIND_MOUNTING_LABELS[variant.blindMountingType] });
    }
    if (variant.blindControlSide) {
      options.push({
        label: "Manœuvre",
        value: BLIND_CONTROL_SIDE_LABELS[variant.blindControlSide],
      });
    }
    if (variant.blindMechanismColor) {
      options.push({
        label: "Mécanisme",
        value: BLIND_MECHANISM_COLOR_LABELS[variant.blindMechanismColor],
      });
    }
    return options;
  }

  if (product.pattern) options.push({ label: "Motif", value: PATTERN_LABELS[product.pattern] });
  if (variant.curtainHeader) {
    options.push({ label: "Finition", value: HEADER_LABELS[variant.curtainHeader] });
  }
  if (variant.eyeletColor) {
    options.push({ label: "Œillets", value: EYELET_COLOR_LABELS[variant.eyeletColor] });
  }
  if (variant.lining) options.push({ label: "Doublure", value: LINING_LABELS[variant.lining] });

  return options;
}

export function formatOptionSummary(options: ProductOptionDisplay[] | undefined): string {
  if (!options || options.length === 0) return "";
  return options.map((option) => option.value).join(" · ");
}
