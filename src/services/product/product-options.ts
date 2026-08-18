import {
  BLIND_CONTROL_SIDE_LABELS,
  BLIND_MECHANISM_COLOR_LABELS,
  BLIND_MOUNTING_LABELS,
  BLIND_TYPE_LABELS,
  EYELET_COLOR_LABELS,
  HEADER_LABELS,
  LINING_LABELS,
  PATTERN_LABELS,
} from "@/domain/product/product.constants";
import type {
  Product,
  ProductOptionDisplay,
  ProductVariant,
} from "@/domain/product/product.types";

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

  options.push({ label: "Dimensions", value: `${variant.widthCm} × ${variant.heightCm} cm` });

  if (product.category === "stores") {
    if (product.blindType) options.push({ label: "Type", value: BLIND_TYPE_LABELS[product.blindType] });
    if (variant.blindMountingType) {
      options.push({ label: "Pose", value: BLIND_MOUNTING_LABELS[variant.blindMountingType] });
    }
    if (variant.blindControlSide) {
      options.push({ label: "Manœuvre", value: BLIND_CONTROL_SIDE_LABELS[variant.blindControlSide] });
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
