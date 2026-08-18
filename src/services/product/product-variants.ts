import type {
  BlindControlSide,
  BlindMechanismColor,
  BlindMountingType,
  CurtainHeader,
  CurtainLining,
  EyeletColor,
  Product,
  ProductVariant,
} from "@/domain/product/product.types";

/**
 * Moteur de variantes : pur, sans état React ni accès réseau.
 * Axes gérés, du plus structurant au moins structurant :
 * coloris -> dimensions -> type de tête -> finition d'œillets -> doublure.
 */

export interface VariantSelection {
  colorId: string;
  sizeKey: string;
  curtainHeader?: CurtainHeader | undefined;
  eyeletColor?: EyeletColor | undefined;
  lining?: CurtainLining | undefined;
  blindMountingType?: BlindMountingType | undefined;
  blindControlSide?: BlindControlSide | undefined;
  blindMechanismColor?: BlindMechanismColor | undefined;
}

export type VariantAxis = keyof VariantSelection;

export const VARIANT_AXES: VariantAxis[] = [
  "colorId",
  "sizeKey",
  "curtainHeader",
  "eyeletColor",
  "lining",
  "blindMountingType",
  "blindControlSide",
  "blindMechanismColor",
];

export function sizeKeyOf(variant: ProductVariant): string {
  return `${variant.widthCm}x${variant.heightCm}`;
}

export function parseSizeKey(sizeKey: string): { widthCm: number; heightCm: number } | null {
  const [width, height] = sizeKey.split("x").map((part) => Number.parseInt(part, 10));
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  return { widthCm: width as number, heightCm: height as number };
}

export function selectionOf(variant: ProductVariant): VariantSelection {
  return {
    colorId: variant.colorId,
    sizeKey: sizeKeyOf(variant),
    curtainHeader: variant.curtainHeader,
    eyeletColor: variant.eyeletColor,
    lining: variant.lining,
    blindMountingType: variant.blindMountingType,
    blindControlSide: variant.blindControlSide,
    blindMechanismColor: variant.blindMechanismColor,
  };
}

function axisValue(variant: ProductVariant, axis: VariantAxis): string | undefined {
  return selectionOf(variant)[axis];
}

function matchesAxes(
  variant: ProductVariant,
  selection: Partial<VariantSelection>,
  axes: VariantAxis[],
): boolean {
  return axes.every((axis) => {
    const wanted = selection[axis];
    if (wanted === undefined) return true;
    return axisValue(variant, axis) === wanted;
  });
}

export interface VariantOption {
  value: string;
  /** Une variante existe pour cette valeur en gardant les autres axes choisis. */
  available: boolean;
  /** Au moins une variante existe et est commandable. */
  inStock: boolean;
  variant: ProductVariant;
}

/** Valeurs proposables sur un axe, dans l'ordre d'apparition des variantes. */
export function getAxisOptions(
  variants: ProductVariant[],
  axis: VariantAxis,
  selection: Partial<VariantSelection>,
): VariantOption[] {
  const others = VARIANT_AXES.filter((item) => item !== axis);
  const options = new Map<string, VariantOption>();

  for (const variant of variants) {
    const value = axisValue(variant, axis);
    if (value === undefined) continue;

    const compatible = matchesAxes(variant, selection, others);
    const orderable = variant.availability !== "out_of_stock";
    const existing = options.get(value);

    if (!existing) {
      options.set(value, {
        value,
        available: compatible,
        inStock: compatible && orderable,
        variant,
      });
      continue;
    }

    if (compatible && !existing.available) {
      options.set(value, { value, available: true, inStock: orderable, variant });
    } else if (compatible && orderable && !existing.inStock) {
      options.set(value, { ...existing, inStock: true, variant });
    }
  }

  return [...options.values()];
}

/** Variante correspondant exactement à la sélection, sinon null. */
export function findExactVariant(
  variants: ProductVariant[],
  selection: VariantSelection,
): ProductVariant | null {
  return variants.find((variant) => matchesAxes(variant, selection, VARIANT_AXES)) ?? null;
}

/**
 * Résout une sélection potentiellement incompatible :
 * on garde l'axe modifié en priorité et on relâche les axes les moins structurants.
 */
export function resolveSelection(
  variants: ProductVariant[],
  desired: Partial<VariantSelection>,
  priority: VariantAxis[] = VARIANT_AXES,
): ProductVariant | null {
  if (variants.length === 0) return null;

  for (let keep = priority.length; keep >= 0; keep -= 1) {
    const axes = priority.slice(0, keep);
    const match = variants.find((variant) => matchesAxes(variant, desired, axes));
    if (match) return match;
  }
  return variants[0] ?? null;
}

/** Sélection initiale : première variante disponible, sinon la moins chère. */
export function getInitialVariant(product: Product): ProductVariant {
  const orderable = product.variants.filter((variant) => variant.availability !== "out_of_stock");
  const pool = orderable.length > 0 ? orderable : product.variants;
  const cheapest = [...pool].sort((a, b) => a.price.amountMinor - b.price.amountMinor)[0];
  return cheapest ?? (product.variants[0] as ProductVariant);
}

/**
 * Applique un changement sur un axe et renvoie la variante résolue.
 * L'axe modifié est prioritaire pour ne jamais perdre le choix de l'utilisateur.
 */
export function changeAxis(
  product: Product,
  current: ProductVariant,
  axis: VariantAxis,
  value: string,
): ProductVariant {
  const desired: Partial<VariantSelection> = { ...selectionOf(current), [axis]: value };
  if (axis === "curtainHeader" && value !== "oeillets") delete desired.eyeletColor;
  const priority: VariantAxis[] = [axis, ...VARIANT_AXES.filter((item) => item !== axis)];
  return resolveSelection(product.variants, desired, priority) ?? current;
}

export function getVariantImages(product: Product, variant: ProductVariant) {
  const byId = new Map(product.images.map((image) => [image.id, image]));
  const ordered = variant.imageIds
    .map((id) => byId.get(id))
    .filter((image): image is NonNullable<typeof image> => image != null);
  return ordered.length > 0 ? ordered : product.images;
}
