import {
  ACCESSORY_FINISH_LABELS,
  ACCESSORY_MOUNTING_LABELS,
  ACCESSORY_TYPE_LABELS,
  BLIND_CONTROL_SIDE_LABELS,
  BLIND_MECHANISM_COLOR_LABELS,
  BLIND_MOUNTING_LABELS,
  BLIND_TYPE_LABELS,
  CATEGORY_LABELS,
  CHAIR_PAD_FASTENING_LABELS,
  CUSHION_CLOSURE_LABELS,
  CUSHION_CONTENT_LABELS,
  EYELET_COLOR_LABELS,
  FURNITURE_ASSEMBLY_LABELS,
  FURNITURE_ROOM_LABELS,
  FURNITURE_STYLE_LABELS,
  FURNITURE_TYPE_LABELS,
  HEADER_LABELS,
  LINING_LABELS,
  MATERIAL_LABELS,
  OPACITY_LABELS,
  PATTERN_LABELS,
  PLANT_CARE_LABELS,
  PLANT_LIGHT_LABELS,
  PLANT_NATURE_LABELS,
  PLANT_SIZE_LABELS,
  PLANT_TYPE_LABELS,
  SELLING_MODE_LABELS,
  CUSHION_SHAPE_LABELS,
  CHAIR_PAD_SHAPE_LABELS,
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
  /** Type de produit : store, accessoire, mobilier, plante. */
  productTypeTerms: string[];
  materialTerms: string[];
  colorTerms: string[];
  attributeTerms: string[];
  /** Dimensions comparables (45x45, 150, 120 210). */
  measurementTerms: string[];
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
  pushLabel(categoryTerms, product.category.replace(/_/g, " "));
  pushLabel(categoryTerms, SELLING_MODE_LABELS[product.sellingMode]);

  // Types de produits (sous-catégories métier) — communs à toutes les familles.
  const productTypeTerms: string[] = [];
  pushLabel(productTypeTerms, product.blindType ? BLIND_TYPE_LABELS[product.blindType] : undefined);
  pushLabel(
    productTypeTerms,
    product.accessoryType ? ACCESSORY_TYPE_LABELS[product.accessoryType] : undefined,
  );
  pushLabel(
    productTypeTerms,
    product.furnitureType ? FURNITURE_TYPE_LABELS[product.furnitureType] : undefined,
  );
  pushLabel(productTypeTerms, product.plantType ? PLANT_TYPE_LABELS[product.plantType] : undefined);
  pushLabel(
    productTypeTerms,
    product.plantNature ? PLANT_NATURE_LABELS[product.plantNature] : undefined,
  );

  const materialTerms: string[] = [];
  pushLabel(materialTerms, MATERIAL_LABELS[product.material]);
  pushLabel(materialTerms, product.material.replace(/_/g, " "));
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
  pushLabel(attributeTerms, product.opacityLevel ? OPACITY_LABELS[product.opacityLevel] : undefined);
  pushLabel(attributeTerms, product.pattern ? PATTERN_LABELS[product.pattern] : undefined);
  pushLabel(
    attributeTerms,
    product.cushionShape ? CUSHION_SHAPE_LABELS[product.cushionShape] : undefined,
  );
  pushLabel(
    attributeTerms,
    product.chairPadShape ? CHAIR_PAD_SHAPE_LABELS[product.chairPadShape] : undefined,
  );
  if (product.isThermal) attributeTerms.push("thermique");
  if (product.isLargeWidth) attributeTerms.push("grande largeur");
  if (product.isNew) attributeTerms.push("nouveaute");
  if (product.removableCover) attributeTerms.push("housse dehoussable");
  if (product.machineWashable) attributeTerms.push("lavable en machine");
  for (const compat of product.accessoryCompatibilities ?? []) pushLabel(attributeTerms, compat);

  // Mobilier d'intérieur.
  pushLabel(
    attributeTerms,
    product.furnitureStyle ? FURNITURE_STYLE_LABELS[product.furnitureStyle] : undefined,
  );
  pushLabel(
    attributeTerms,
    product.furnitureAssembly ? FURNITURE_ASSEMBLY_LABELS[product.furnitureAssembly] : undefined,
  );
  for (const room of product.furnitureRooms ?? []) pushLabel(attributeTerms, FURNITURE_ROOM_LABELS[room]);

  // Plantes décoratives.
  pushLabel(
    attributeTerms,
    product.plantLightNeed ? PLANT_LIGHT_LABELS[product.plantLightNeed] : undefined,
  );
  pushLabel(
    attributeTerms,
    product.plantCareLevel ? PLANT_CARE_LABELS[product.plantCareLevel] : undefined,
  );
  if (product.petFriendly) attributeTerms.push("sans danger animaux");
  if (product.potIncluded) attributeTerms.push("pot inclus");

  const measurementTerms: string[] = [];

  for (const variant of indexableVariants(product)) {
    pushLabel(attributeTerms, variant.curtainHeader ? HEADER_LABELS[variant.curtainHeader] : undefined);
    pushLabel(
      attributeTerms,
      variant.eyeletColor ? EYELET_COLOR_LABELS[variant.eyeletColor] : undefined,
    );
    pushLabel(attributeTerms, variant.lining ? LINING_LABELS[variant.lining] : undefined);
    pushLabel(
      attributeTerms,
      variant.blindMountingType ? BLIND_MOUNTING_LABELS[variant.blindMountingType] : undefined,
    );
    pushLabel(
      attributeTerms,
      variant.blindControlSide ? BLIND_CONTROL_SIDE_LABELS[variant.blindControlSide] : undefined,
    );
    pushLabel(
      attributeTerms,
      variant.blindMechanismColor
        ? BLIND_MECHANISM_COLOR_LABELS[variant.blindMechanismColor]
        : undefined,
    );
    pushLabel(
      attributeTerms,
      variant.cushionContent ? CUSHION_CONTENT_LABELS[variant.cushionContent] : undefined,
    );
    pushLabel(
      attributeTerms,
      variant.cushionClosure ? CUSHION_CLOSURE_LABELS[variant.cushionClosure] : undefined,
    );
    pushLabel(
      attributeTerms,
      variant.chairPadFastening ? CHAIR_PAD_FASTENING_LABELS[variant.chairPadFastening] : undefined,
    );
    pushLabel(
      attributeTerms,
      variant.accessoryMountingType
        ? ACCESSORY_MOUNTING_LABELS[variant.accessoryMountingType]
        : undefined,
    );
    pushLabel(attributeTerms, variant.plantSize ? PLANT_SIZE_LABELS[variant.plantSize] : undefined);
    pushLabel(attributeTerms, variant.sizeLabel);
    if (variant.packQuantity && variant.packQuantity > 1) {
      attributeTerms.push(`lot de ${variant.packQuantity}`);
      attributeTerms.push("pack");
    }
    if (variant.seatCount) attributeTerms.push(`${variant.seatCount} place`);

    if (variant.widthCm && variant.heightCm) {
      measurementTerms.push(`${variant.widthCm}x${variant.heightCm}`);
      measurementTerms.push(`${variant.widthCm} x ${variant.heightCm}`);
      measurementTerms.push(String(variant.widthCm));
      measurementTerms.push(String(variant.heightCm));
    }
    if (variant.depthCm) measurementTerms.push(String(variant.depthCm));
    if (variant.thicknessCm) measurementTerms.push(String(variant.thicknessCm));
    if (variant.diameterMm) measurementTerms.push(String(variant.diameterMm));
    if (variant.plantHeightCm) measurementTerms.push(String(variant.plantHeightCm));
    if (variant.potDiameterCm) measurementTerms.push(String(variant.potDiameterCm));
    if (variant.minLengthCm && variant.maxLengthCm) {
      measurementTerms.push(`${variant.minLengthCm} ${variant.maxLengthCm}`);
      measurementTerms.push(String(variant.minLengthCm));
      measurementTerms.push(String(variant.maxLengthCm));
    }
    if (variant.sizeLabel) measurementTerms.push(norm(variant.sizeLabel));
  }

  return {
    productId: product.id,
    name: norm(product.name),
    slug: norm(product.slug),
    reference: norm(product.reference),
    skus: indexableVariants(product).map((variant) => norm(variant.sku)),
    categoryTerms: [...new Set(categoryTerms)],
    productTypeTerms: [...new Set(productTypeTerms)],
    materialTerms: [...new Set(materialTerms)],
    colorTerms: [...new Set(colorTerms)],
    attributeTerms: [...new Set(attributeTerms)],
    measurementTerms: [...new Set(measurementTerms.filter(Boolean))],
    description: norm(product.shortDescription),
  };
}

/** Index mémorisé : reconstruit uniquement si la liste de produits change. */
export function buildProductSearchIndex(products: Product[]): Map<string, ProductSearchDoc> {
  const index = new Map<string, ProductSearchDoc>();
  for (const product of products) index.set(product.id, buildProductSearchDoc(product));
  return index;
}
