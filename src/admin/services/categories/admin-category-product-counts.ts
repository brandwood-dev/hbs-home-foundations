import type { AdminCategory, AdminProduct } from "@/admin/types/admin.types";

/**
 * Counts products on their assigned catalogue category and every parent.
 *
 * Products are normally assigned to a leaf category, while the admin list
 * also displays root categories. Keeping the aggregation here prevents root
 * categories from incorrectly showing zero products when their descendants
 * contain products.
 */
export function buildCategoryProductCounts(
  categories: readonly Pick<AdminCategory, "id" | "parentId">[],
  products: readonly Pick<AdminProduct, "categoryId" | "subCategoryId">[],
): Map<string, number> {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const counts = new Map<string, number>();

  for (const product of products) {
    let categoryId = product.subCategoryId || product.categoryId;
    const visited = new Set<string>();

    while (categoryId && !visited.has(categoryId)) {
      visited.add(categoryId);
      const category = byId.get(categoryId);
      if (!category) break;

      counts.set(category.id, (counts.get(category.id) ?? 0) + 1);
      categoryId = category.parentId ?? "";
    }
  }

  return counts;
}
