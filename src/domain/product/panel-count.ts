import type { ProductCategory, ProductMaterial } from "@/domain/product/product.types";

/**
 * Règle commerciale des panneaux pour les rideaux et voilages.
 * La largeur correspond à la largeur totale de la dimension choisie.
 */
export function panelCountOptionsFor(
  category: ProductCategory | string,
  material: ProductMaterial | string,
  widthCm: number,
): readonly number[] {
  const normalizedCategory = category
    .trim()
    .toLocaleLowerCase()
    .replace(/&/g, "et")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
  if (
    !["rideaux", "voilages", "rideaux-voilages", "rideaux-et-voilages"].includes(normalizedCategory)
  )
    return [];

  if (widthCm <= 150) return [1];
  if (material.trim().toLocaleLowerCase() === "velours" && widthCm === 450) return [1, 3];
  return [1, 2];
}

export function panelCountLabel(panelCount: number): string {
  return `${panelCount} panneau${panelCount > 1 ? "x" : ""}`;
}
