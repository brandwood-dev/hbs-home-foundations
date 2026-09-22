export interface VariantDimensions {
  widthCm: number;
  heightCm: number;
}

/** Compare dimensions from the smallest width to the largest, then by height. */
export function compareVariantDimensions(
  left: VariantDimensions,
  right: VariantDimensions,
): number {
  return left.widthCm - right.widthCm || left.heightCm - right.heightCm;
}

/** Stable dimension sort used by every public product surface. */
export function sortVariantsByDimensions<T extends VariantDimensions>(variants: readonly T[]): T[] {
  return variants
    .map((variant, index) => ({ variant, index }))
    .sort(
      (left, right) =>
        compareVariantDimensions(left.variant, right.variant) || left.index - right.index,
    )
    .map(({ variant }) => variant);
}
