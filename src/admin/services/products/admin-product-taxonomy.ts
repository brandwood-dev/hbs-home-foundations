import {
  ADMIN_PRODUCT_CATEGORY_LABELS,
  type AdminCategory,
  type AdminProductCategoryKey,
} from "@/admin/types/admin.types";

export interface CatalogCategoryOption {
  value: string;
  label: string;
  parentId?: string;
}

export interface CatalogFamilyOption {
  value: AdminProductCategoryKey;
  label: string;
  rootId: string;
  rootSlug: string;
}

/**
 * Product families are legacy business keys, while the catalogue categories
 * are editable records.  Keep the business key for field/variant rules and
 * resolve it to the current root category for labels, IDs and API writes.
 *
 * The aliases cover the canonical catalogue slugs used after the catalogue
 * migration (for example `mobilier` for `mobilier_interieur`). Exact matches
 * are still preferred so the local/mock catalogue remains compatible.
 */
const FAMILY_ROOT_SLUG_ALIASES: Readonly<Record<AdminProductCategoryKey, readonly string[]>> = {
  rideaux: ["rideaux", "rideaux-voilages", "rideaux_et_voilages", "rideaux-et-voilages"],
  voilages: ["voilages"],
  stores: ["stores"],
  coussins: ["coussins"],
  galettes_de_chaise: ["galettes_de_chaise", "galettes-de-chaise"],
  accessoires: ["accessoires"],
  mobilier_interieur: [
    "mobilier_interieur",
    "mobilier-interieur",
    "mobilier-d-interieur",
    "mobilier",
  ],
  plantes_decoration: [
    "plantes_decoration",
    "plantes-decoration",
    "plantes-et-decoration",
    "plantes",
  ],
};

function normalizedSlug(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/_/g, "-");
}

function rootCategories(categories: readonly AdminCategory[]): AdminCategory[] {
  return categories.filter((category) => category.parentId === undefined && category.isActive);
}

function rootForCategoryId(
  categories: readonly AdminCategory[],
  categoryId: string | undefined,
): AdminCategory | undefined {
  if (!categoryId) return undefined;
  const byId = new Map(categories.map((category) => [category.id, category]));
  let current = byId.get(categoryId);
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    if (current.parentId === undefined) return current.isActive ? current : undefined;
    current = byId.get(current.parentId);
  }
  return undefined;
}

function rootForFamilySlug(
  categories: readonly AdminCategory[],
  family: AdminProductCategoryKey,
): AdminCategory | undefined {
  const roots = rootCategories(categories);
  const aliases = FAMILY_ROOT_SLUG_ALIASES[family].map(normalizedSlug);
  return (
    roots.find((category) => normalizedSlug(category.slug) === normalizedSlug(family)) ??
    roots.find((category) => aliases.includes(normalizedSlug(category.slug)))
  );
}

/** Retourne la catégorie racine qui représente la famille fonctionnelle. */
export function familyRootCategory(
  categories: readonly AdminCategory[],
  family: AdminProductCategoryKey,
  selectedCategoryId?: string,
): AdminCategory | undefined {
  return rootForFamilySlug(categories, family) ?? rootForCategoryId(categories, selectedCategoryId);
}

/** Options displayed by the product form, with labels sourced from Admin. */
export function catalogFamilyOptionsForCategories(
  categories: readonly AdminCategory[],
  selectedFamily?: AdminProductCategoryKey,
  selectedCategoryId?: string,
): CatalogFamilyOption[] {
  return (Object.keys(ADMIN_PRODUCT_CATEGORY_LABELS) as AdminProductCategoryKey[]).flatMap(
    (family) => {
      const root = familyRootCategory(
        categories,
        family,
        family === selectedFamily ? selectedCategoryId : undefined,
      );
      return root
        ? [{ value: family, label: root.name, rootId: root.id, rootSlug: root.slug }]
        : [];
    },
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
  selectedCategoryId?: string,
): CatalogCategoryOption[] {
  const root = familyRootCategory(categories, family, selectedCategoryId);
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
