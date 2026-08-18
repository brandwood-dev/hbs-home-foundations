import {
  ACCESSORY_FINISH_LABELS,
  ACCESSORY_TYPE_LABELS,
  BLIND_TYPE_LABELS,
  CATEGORY_LABELS,
  CHAIR_PAD_FASTENING_LABELS,
  CUSHION_CONTENT_LABELS,
  MATERIAL_LABELS,
  OPACITY_LABELS,
  PATTERN_LABELS,
  SELLING_MODE_LABELS,
  SHAPE_LABELS,
} from "@/domain/product/product.constants";
import type { Product } from "@/domain/product/product.types";
import { normalizeSearchQuery } from "@/services/search/normalize-search-query";

/** Document indexé pour un produit — uniquement des données catalogue publiques. */
export interface ProductSearchDoc {
  productId: string;
  name: string;
  slug: string;
  reference: string;
  skus: string[];
  categoryTerms: string[];
  materialTerms: string[];
  colorTerms: string[];
  attributeTerms: string[];
  description: string;
}

function norm(value: string | undefined): string {
  return value ? normalizeSearchQuery(value) : "";
}

function pushLabel(target: string[], value: string | undefined) {
  const normalized = norm(value);
  if (normalized) target.push(normalized);
}

/** Variantes exploitables : les déclinaisons épuisées n'alimentent pas les SKU suggérés. */
function indexableVariants(product: Product) {
  const active = product.variants.filter((variant) => variant.availability !== "out_of_stock");
  return active.length > 0 ? active : product.variants;
}

export function buildProductSearchDoc(product: Product): ProductSearchDoc {
  const categoryTerms: string[] = [];
  pushLabel(categoryTerms, CATEGORY_LABELS[product.category]);
  pushLabel(categoryTerms, product.category);
  pushLabel(categoryTerms, product.blindType ? BLIND_TYPE_LABELS[product.blindType] : undefined);
  pushLabel(
    categoryTerms,
    product.accessoryType ? ACCESSORY_TYPE_LABELS[product.accessoryType] : undefined,
  );
  pushLabel(categoryTerms, SELLING_MODE_LABELS[product.sellingMode]);

  const materialTerms: string[] = [];
  pushLabel(materialTerms, MATERIAL_LABELS[product.material]);
  pushLabel(materialTerms, product.material);
  pushLabel(
    materialTerms,
    product.accessoryMaterial ? MATERIAL_LABELS[product.accessoryMaterial] : undefined,
  );

  const colorTerms: string[] = [];
  for (const color of product.colors) {
    pushLabel(colorTerms, color.name);
    pushLabel(colorTerms, color.slug);
    pushLabel(colorTerms, color.family);
  }
  const finishes = new Set(
    indexableVariants(product)
      .map((variant) => variant.accessoryFinish)
      .filter((finish): finish is NonNullable<typeof finish> => Boolean(finish)),
  );
  for (const finish of finishes) pushLabel(colorTerms, ACCESSORY_FINISH_LABELS[finish]);

  const attributeTerms: string[] = [];
  pushLabel(
    attributeTerms,
    product.opacityLevel ? OPACITY_LABELS[product.opacityLevel] : undefined,
  );
  pushLabel(attributeTerms, product.pattern ? PATTERN_LABELS[product.pattern] : undefined);
  pushLabel(
    attributeTerms,
    product.cushionShape ? SHAPE_LABELS[product.cushionShape] : undefined,
  );
  pushLabel(
    attributeTerms,
    product.chairPadShape ? SHAPE_LABELS[product.chairPadShape] : undefined,
  );
  if (product.isThermal) attributeTerms.push("thermique");
  if (product.isLargeWidth) attributeTerms.push("grande largeur");
  if (product.isNew) attributeTerms.push("nouveaute");
  for (const compat of product.accessoryCompatibilities ?? []) pushLabel(attributeTerms, compat);

  for (const variant of indexableVariants(product)) {
    pushLabel(attributeTerms, variant.curtainHeader);
    pushLabel(attributeTerms, variant.blindMountingType);
    pushLabel(
      attributeTerms,
      variant.cushionContent ? CUSHION_CONTENT_LABELS[variant.cushionContent] : undefined,
    );
    pushLabel(
      attributeTerms,
      variant.chairPadFastening
        ? CHAIR_PAD_FASTENING_LABELS[variant.chairPadFastening]
        : undefined,
    );
    pushLabel(attributeTerms, variant.sizeLabel);
    if (variant.widthCm && variant.heightCm) {
      attributeTerms.push(`${variant.widthCm} x ${variant.heightCm}`);
      attributeTerms.push(`${variant.widthCm}x${variant.heightCm}`);
    }
    if (variant.diameterMm) attributeTerms.push(`${variant.diameterMm} mm`);
  }

  return {
    productId: product.id,
    name: norm(product.name),
    slug: norm(product.slug),
    reference: norm(product.reference),
    skus: indexableVariants(product).map((variant) => norm(variant.sku)),
    categoryTerms: [...new Set(categoryTerms)],
    materialTerms: [...new Set(materialTerms)],
    colorTerms: [...new Set(colorTerms)],
    attributeTerms: [...new Set(attributeTerms)],
    description: norm(product.shortDescription),
  };
}

/** Index mémorisé : reconstruit uniquement si la liste de produits change. */
export function buildProductSearchIndex(products: Product[]): Map<string, ProductSearchDoc> {
  const index = new Map<string, ProductSearchDoc>();
  for (const product of products) index.set(product.id, buildProductSearchDoc(product));
  return index;
}
