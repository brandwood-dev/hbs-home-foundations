import {
  ACCESSORY_FINISH_LABELS,
  ACCESSORY_FINISH_SWATCHES,
  ACCESSORY_TYPE_LABELS,
  AVAILABILITY_LABELS,
  CHAIR_PAD_FASTENING_LABELS,
  CHAIR_PAD_SHAPE_LABELS,
  CUSHION_CONTENT_LABELS,
  CUSHION_SHAPE_LABELS,
  BLIND_CONTROL_SIDE_LABELS,
  BLIND_MOUNTING_LABELS,
  BLIND_TYPE_LABELS,
  COLOR_FAMILY_LABELS,
  COLOR_FAMILY_SWATCHES,
  HEADER_LABELS,
  MATERIAL_LABELS,
  OPACITY_LABELS,
  PATTERN_LABELS,
} from "@/domain/product/product.constants";
import type { ColorFamily, Product, ProductVariant } from "@/domain/product/product.types";
import type { CatalogScope, ProductListParams } from "@/repositories/interfaces/ProductRepository";

export interface FacetOption {
  value: string;
  label: string;
  count: number;
  swatch?: string;
}

export interface CatalogFacets {
  materials: FacetOption[];
  opacity: FacetOption[];
  headers: FacetOption[];
  patterns: FacetOption[];
  blindTypes: FacetOption[];
  shapes: FacetOption[];
  contents: FacetOption[];
  fastenings: FacetOption[];
  accessoryTypes: FacetOption[];
  finishes: FacetOption[];
  mountings: FacetOption[];
  controlSides: FacetOption[];
  colors: FacetOption[];
  widths: FacetOption[];
  heights: FacetOption[];
  availability: FacetOption[];
  priceMinMinor: number;
  priceMaxMinor: number;
}

function includesAny<T>(selected: T[] | undefined, value: T | undefined): boolean {
  if (!selected || selected.length === 0) return true;
  if (value === undefined) return false;
  return selected.includes(value);
}

/** A variant matches when every variant-level filter group accepts it (AND of ORs). */
export function variantMatches(
  product: Product,
  variant: ProductVariant,
  params: ProductListParams,
): boolean {
  const color = product.colors.find((item) => item.id === variant.colorId);
  if (params.colors && params.colors.length > 0) {
    if (!color || !params.colors.includes(color.family)) return false;
  }
  if (!includesAny(params.curtainHeaders, variant.curtainHeader)) return false;
  if (!includesAny(params.mountings, variant.blindMountingType)) return false;
  if (!includesAny(params.controlSides, variant.blindControlSide)) return false;
  if (!includesAny(params.cushionContents, variant.cushionContent)) return false;
  if (!includesAny(params.chairPadFastenings, variant.chairPadFastening)) return false;
  if (!includesAny(params.accessoryFinishes, variant.accessoryFinish)) return false;
  if (!includesAny(params.widths, variant.widthCm)) return false;
  if (!includesAny(params.heights, variant.heightCm)) return false;
  if (!includesAny(params.availability, variant.availability)) return false;
  if (params.minPriceMinor != null && variant.price.amountMinor < params.minPriceMinor)
    return false;
  if (params.maxPriceMinor != null && variant.price.amountMinor > params.maxPriceMinor)
    return false;
  return true;
}

export function productMatches(product: Product, params: ProductListParams): boolean {
  if (!includesAny(params.categories, product.category)) return false;
  if (!includesAny(params.materials, product.material)) return false;
  if (!includesAny(params.opacityLevels, product.opacityLevel)) return false;
  if (!includesAny(params.sellingMode, product.sellingMode)) return false;
  if (!includesAny(params.patterns, product.pattern)) return false;
  if (!includesAny(params.blindTypes, product.blindType)) return false;
  if (!includesAny(params.accessoryTypes, product.accessoryType)) return false;
  if (params.shapes && params.shapes.length > 0) {
    const shape = product.cushionShape ?? product.chairPadShape;
    if (!shape || !params.shapes.includes(shape)) return false;
  }
  if (params.onlyThermal && !product.isThermal) return false;
  if (params.onlyLargeWidth && !product.isLargeWidth) return false;
  if (params.onlyNew && !product.isNew) return false;
  if (params.onlyBestSellers && !product.isBestSeller) return false;
  if (params.onlyDiscounted) {
    const discounted = product.variants.some(
      (variant) =>
        variant.compareAtPrice != null &&
        variant.compareAtPrice.amountMinor > variant.price.amountMinor,
    );
    if (!discounted) return false;
  }
  return product.variants.some((variant) => variantMatches(product, variant, params));
}

export function filterProducts(products: Product[], params: ProductListParams): Product[] {
  return products.filter((product) => productMatches(product, params));
}

export function matchesScope(product: Product, scope?: CatalogScope): boolean {
  if (!scope) return true;
  if (!includesAny(scope.categories, product.category)) return false;
  if (!includesAny(scope.materials, product.material)) return false;
  if (!includesAny(scope.opacityLevels, product.opacityLevel)) return false;
  if (!includesAny(scope.sellingMode, product.sellingMode)) return false;
  if (!includesAny(scope.patterns, product.pattern)) return false;
  if (!includesAny(scope.blindTypes, product.blindType)) return false;
  if (!includesAny(scope.accessoryTypes, product.accessoryType)) return false;
  if (scope.shapes && scope.shapes.length > 0) {
    const scopeShape = product.cushionShape ?? product.chairPadShape;
    if (!scopeShape || !scope.shapes.includes(scopeShape)) return false;
  }
  if (scope.onlyThermal && !product.isThermal) return false;
  if (scope.onlyLargeWidth && !product.isLargeWidth) return false;
  if (scope.curtainHeaders && scope.curtainHeaders.length > 0) {
    const hasHeader = product.variants.some(
      (variant) =>
        variant.curtainHeader != null && scope.curtainHeaders?.includes(variant.curtainHeader),
    );
    if (!hasHeader) return false;
  }
  if (scope.mountings && scope.mountings.length > 0) {
    const hasMounting = product.variants.some(
      (variant) =>
        variant.blindMountingType != null && scope.mountings?.includes(variant.blindMountingType),
    );
    if (!hasMounting) return false;
  }
  return true;
}

function toOptions(counts: Map<string, number>, label: (value: string) => string): FacetOption[] {
  return [...counts.entries()].map(([value, count]) => ({ value, label: label(value), count }));
}

/** Facet values are always derived from the products of the current scope. */
export function computeFacets(products: Product[]): CatalogFacets {
  const materials = new Map<string, number>();
  const opacity = new Map<string, number>();
  const headers = new Map<string, number>();
  const patterns = new Map<string, number>();
  const blindTypes = new Map<string, number>();
  const mountings = new Map<string, number>();
  const controlSides = new Map<string, number>();
  const colors = new Map<string, number>();
  const widths = new Map<string, number>();
  const heights = new Map<string, number>();
  const availability = new Map<string, number>();
  const shapes = new Map<string, number>();
  const contents = new Map<string, number>();
  const fastenings = new Map<string, number>();
  const accessoryTypes = new Map<string, number>();
  const finishes = new Map<string, number>();

  let priceMin = Number.POSITIVE_INFINITY;
  let priceMax = 0;

  const bump = (map: Map<string, number>, key: string) => map.set(key, (map.get(key) ?? 0) + 1);

  for (const product of products) {
    bump(materials, product.material);
    if (product.opacityLevel) bump(opacity, product.opacityLevel);
    if (product.pattern) bump(patterns, product.pattern);
    if (product.blindType) bump(blindTypes, product.blindType);
    if (product.accessoryType) bump(accessoryTypes, product.accessoryType);
    const shape = product.cushionShape ?? product.chairPadShape;
    if (shape) bump(shapes, shape);

    const productHeaders = new Set<string>();
    const productMountings = new Set<string>();
    const productControlSides = new Set<string>();
    const productColors = new Set<string>();
    const productWidths = new Set<string>();
    const productHeights = new Set<string>();
    const productAvailability = new Set<string>();
    const productContents = new Set<string>();
    const productFastenings = new Set<string>();
    const productFinishes = new Set<string>();

    for (const variant of product.variants) {
      if (variant.curtainHeader) productHeaders.add(variant.curtainHeader);
      if (variant.blindMountingType) productMountings.add(variant.blindMountingType);
      if (variant.blindControlSide) productControlSides.add(variant.blindControlSide);
      if (variant.cushionContent) productContents.add(variant.cushionContent);
      if (variant.chairPadFastening) productFastenings.add(variant.chairPadFastening);
      if (variant.accessoryFinish) productFinishes.add(variant.accessoryFinish);
      productWidths.add(String(variant.widthCm));
      productHeights.add(String(variant.heightCm));
      productAvailability.add(variant.availability);
      const color = product.colors.find((item) => item.id === variant.colorId);
      if (color) productColors.add(color.family);
      priceMin = Math.min(priceMin, variant.price.amountMinor);
      priceMax = Math.max(priceMax, variant.price.amountMinor);
    }

    productHeaders.forEach((value) => bump(headers, value));
    productMountings.forEach((value) => bump(mountings, value));
    productControlSides.forEach((value) => bump(controlSides, value));
    productColors.forEach((value) => bump(colors, value));
    productWidths.forEach((value) => bump(widths, value));
    productHeights.forEach((value) => bump(heights, value));
    productAvailability.forEach((value) => bump(availability, value));
    productContents.forEach((value) => bump(contents, value));
    productFastenings.forEach((value) => bump(fastenings, value));
    productFinishes.forEach((value) => bump(finishes, value));
  }

  const numericSort = (a: FacetOption, b: FacetOption) => Number(a.value) - Number(b.value);
  const labelSort = (a: FacetOption, b: FacetOption) => a.label.localeCompare(b.label, "fr");

  return {
    materials: toOptions(materials, (value) => MATERIAL_LABELS[value as never] ?? value).sort(
      labelSort,
    ),
    opacity: toOptions(opacity, (value) => OPACITY_LABELS[value as never] ?? value).sort(labelSort),
    headers: toOptions(headers, (value) => HEADER_LABELS[value as never] ?? value).sort(labelSort),
    patterns: toOptions(patterns, (value) => PATTERN_LABELS[value as never] ?? value).sort(
      labelSort,
    ),
    blindTypes: toOptions(blindTypes, (value) => BLIND_TYPE_LABELS[value as never] ?? value).sort(
      labelSort,
    ),
    mountings: toOptions(mountings, (value) => BLIND_MOUNTING_LABELS[value as never] ?? value).sort(
      labelSort,
    ),
    controlSides: toOptions(
      controlSides,
      (value) => BLIND_CONTROL_SIDE_LABELS[value as never] ?? value,
    ).sort(labelSort),
    shapes: toOptions(
      shapes,
      (value) =>
        CUSHION_SHAPE_LABELS[value as never] ?? CHAIR_PAD_SHAPE_LABELS[value as never] ?? value,
    ).sort(labelSort),
    contents: toOptions(contents, (value) => CUSHION_CONTENT_LABELS[value as never] ?? value).sort(
      labelSort,
    ),
    fastenings: toOptions(
      fastenings,
      (value) => CHAIR_PAD_FASTENING_LABELS[value as never] ?? value,
    ).sort(labelSort),
    accessoryTypes: toOptions(
      accessoryTypes,
      (value) => ACCESSORY_TYPE_LABELS[value as never] ?? value,
    ).sort(labelSort),
    finishes: toOptions(finishes, (value) => ACCESSORY_FINISH_LABELS[value as never] ?? value)
      .map((option) => ({
        ...option,
        swatch: ACCESSORY_FINISH_SWATCHES[option.value as never] as string,
      }))
      .sort(labelSort),
    colors: toOptions(colors, (value) => COLOR_FAMILY_LABELS[value as ColorFamily] ?? value)
      .map((option) => ({ ...option, swatch: COLOR_FAMILY_SWATCHES[option.value as ColorFamily] }))
      .sort(labelSort),
    widths: toOptions(widths, (value) => `${value} cm`).sort(numericSort),
    heights: toOptions(heights, (value) => `${value} cm`).sort(numericSort),
    availability: toOptions(
      availability,
      (value) => AVAILABILITY_LABELS[value as never] ?? value,
    ).sort(labelSort),
    priceMinMinor: Number.isFinite(priceMin) ? priceMin : 0,
    priceMaxMinor: priceMax,
  };
}
