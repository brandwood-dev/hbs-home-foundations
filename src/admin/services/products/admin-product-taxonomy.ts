import type { AdminCategory, AdminProductCategoryKey } from "@/admin/types/admin.types";

export interface CatalogCategoryOption {
  value: string;
  label: string;
  parentId?: string;
}

/** Retourne la catégorie racine qui représente la famille fonctionnelle. */
export function familyRootCategory(
  categories: readonly AdminCategory[],
  family: AdminProductCategoryKey,
): AdminCategory | undefined {
  return categories.find(
    (category) => category.parentId === undefined && category.slug === family && category.isActive,
  );
}

/**
 * Les produits choisissent une famille fonctionnelle puis une catégorie de
 * catalogue de cette famille. Les catégories d'une autre branche ne sont
 * jamais proposées dans le formulaire.
 */
export function catalogCategoryOptionsForFamily(
  categories: readonly AdminCategory[],
  family: AdminProductCategoryKey,
): CatalogCategoryOption[] {
  const root = familyRootCategory(categories, family);
  if (!root) return [];
  const children = categories
    .filter((category) => category.parentId === root.id && category.isActive)
    .sort((left, right) => left.order - right.order || left.name.localeCompare(right.name));
  if (children.length === 0) {
    return [{ value: root.id, label: `${root.name} (catégorie principale)` }];
  }
  return children.map((category) => ({
    value: category.id,
    label: category.name,
    parentId: root.id,
  }));
}

export function isCategoryInFamily(
  categories: readonly AdminCategory[],
  categoryId: string,
  family: AdminProductCategoryKey,
): boolean {
  return catalogCategoryOptionsForFamily(categories, family).some(
    (option) => option.value === categoryId,
  );
}
