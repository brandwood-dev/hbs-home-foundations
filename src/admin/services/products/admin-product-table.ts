import type { AdminCategory, AdminProduct } from "@/admin/types/admin.types";

export interface AdminProductCategoryOption {
  value: string;
  label: string;
}

function isOperationalCategory(category: AdminCategory): boolean {
  return category.isActive && category.status !== "archived";
}

/**
 * Builds the category selector from the editable catalogue taxonomy.
 * IDs are used as values so a rename never invalidates a saved selection.
 */
export function buildAdminProductCategoryOptions(
  categories: readonly AdminCategory[],
): AdminProductCategoryOption[] {
  const byParent = new Map<string | undefined, AdminCategory[]>();
  for (const category of categories) {
    if (!isOperationalCategory(category)) continue;
    const siblings = byParent.get(category.parentId) ?? [];
    siblings.push(category);
    byParent.set(category.parentId, siblings);
  }

  const sort = (items: AdminCategory[]) =>
    items.sort((left, right) => left.order - right.order || left.name.localeCompare(right.name));
  const options: AdminProductCategoryOption[] = [];

  const visit = (parentId: string | undefined, prefix: string) => {
    for (const category of sort(byParent.get(parentId) ?? [])) {
      const label = prefix ? `${prefix} → ${category.name}` : category.name;
      options.push({ value: category.id, label });
      visit(category.id, label);
    }
  };
  visit(undefined, "");
  return options;
}

/** Resolve the current human-readable category path without hard-coded labels. */
export function adminProductCategoryLabel(
  product: Pick<AdminProduct, "categoryId" | "subCategoryId">,
  categories: readonly AdminCategory[],
): string {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const leafId = product.subCategoryId || product.categoryId;
  let current = leafId ? byId.get(leafId) : undefined;
  if (!current && product.categoryId) current = byId.get(product.categoryId);
  if (!current) return "Catégorie introuvable";

  const path: string[] = [];
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path.join(" → ");
}

/** Match a product against a root or child category, including descendants. */
export function adminProductBelongsToCategory(
  product: Pick<AdminProduct, "categoryId" | "subCategoryId">,
  categoryId: string,
  categories: readonly AdminCategory[],
): boolean {
  const byId = new Map(categories.map((category) => [category.id, category]));
  let currentId: string | undefined = product.subCategoryId || product.categoryId;
  const visited = new Set<string>();
  while (currentId && !visited.has(currentId)) {
    if (currentId === categoryId) return true;
    visited.add(currentId);
    currentId = byId.get(currentId)?.parentId;
  }
  return false;
}
