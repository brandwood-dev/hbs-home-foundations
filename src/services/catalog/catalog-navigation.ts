import type { PublicCategory } from "@/repositories/interfaces/CategoryRepository";
import type { NavItem } from "@/types/navigation.types";
import { catalogGroups } from "@/fixtures/catalog-pages.fixture";

function categoryMenu(category: PublicCategory): NavItem["megaMenu"] {
  if (category.children.length === 0) return undefined;
  return [
    {
      title: "Sous-catégories",
      links: orderedCategories(category.children).map((child) => ({
        label: child.name,
        href: child.path,
      })),
    },
  ];
}

function orderedCategories(categories: readonly PublicCategory[]): PublicCategory[] {
  return categories
    .map((category, index) => ({ category, index }))
    .sort((left, right) => {
      const leftOrder = left.category.sortOrder;
      const rightOrder = right.category.sortOrder;
      if (typeof leftOrder === "number" && typeof rightOrder === "number") {
        return leftOrder - rightOrder || left.index - right.index;
      }
      if (typeof leftOrder === "number") return -1;
      if (typeof rightOrder === "number") return 1;
      return left.index - right.index;
    })
    .map(({ category }) => category);
}

function categoryMenuShortcuts(category: PublicCategory): NonNullable<NavItem["menuShortcuts"]> {
  const ranked = category.children
    .map((child, index) => ({ child, index }))
    .filter(({ child }) => {
      const preview = child.latestProduct;
      return Boolean(preview?.imageUrl && preview.imageUrl.trim());
    });

  ranked.sort((left, right) => {
    const rightDate = right.child.latestProduct?.createdAt ?? "";
    const leftDate = left.child.latestProduct?.createdAt ?? "";
    const byDate = rightDate.localeCompare(leftDate);
    return byDate !== 0 ? byDate : left.index - right.index;
  });

  return ranked.slice(0, 2).map(({ child }) => {
    const preview = child.latestProduct!;
    return {
      label: child.name,
      href: child.path,
      imageUrl: preview.imageUrl,
      imageAlt: preview.imageAlt || child.name,
    };
  });
}

/**
 * Merge the API taxonomy into the existing editorial navigation while the
 * remaining non-catalog links are still owned by the fixture. This keeps the
 * current routes stable and lets Admin category edits appear without a
 * frontend rebuild.
 */
export function mergeCatalogNavigation(
  fallback: readonly NavItem[],
  categories: readonly PublicCategory[] | undefined,
): NavItem[] {
  // `undefined` means the request failed (or is still loading): keep the
  // editorial fixture as a resilient fallback. An empty array is a valid API
  // response and must hide catalog entries that are no longer published.
  if (categories === undefined) return [...fallback];
  const catalogRootIds = new Set(
    catalogGroups.flatMap((group) => [group.id, group.path.replace(/^\//, "")]),
  );
  const isCatalogFallbackItem = (item: NavItem) =>
    catalogRootIds.has(item.id) || catalogRootIds.has(item.href.replace(/^\//, ""));
  const firstCatalogIndex = fallback.findIndex(isCatalogFallbackItem);
  const catalogItems = orderedCategories(
    categories.filter((category) => category.parentSlug === null),
  ).map((category) => {
    const megaMenu = categoryMenu(category);
    const menuShortcuts = categoryMenuShortcuts(category);
    return {
      id: category.slug,
      label: category.name,
      href: category.path,
      ...(megaMenu ? { megaMenu } : {}),
      ...(menuShortcuts.length > 0 ? { menuShortcuts } : {}),
    };
  });

  // Replace the static catalog slots as one contiguous block. The API order
  // is the admin `sort_order`, so reordering in Admin is reflected in the
  // public navbar instead of being constrained by the old fixture order.
  const editorialItems = fallback.filter((item) => !isCatalogFallbackItem(item));
  if (firstCatalogIndex < 0) return [...editorialItems, ...catalogItems];

  const beforeCatalog = fallback
    .slice(0, firstCatalogIndex)
    .filter((item) => !isCatalogFallbackItem(item));
  const afterCatalog = fallback
    .slice(firstCatalogIndex)
    .filter((item) => !isCatalogFallbackItem(item));
  return [...beforeCatalog, ...catalogItems, ...afterCatalog];
}
