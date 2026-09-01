import type { PublicCategory } from "@/repositories/interfaces/CategoryRepository";
import type { NavItem } from "@/types/navigation.types";
import { catalogGroups } from "@/fixtures/catalog-pages.fixture";

function categoryMenu(category: PublicCategory): NavItem["megaMenu"] {
  if (category.children.length === 0) return undefined;
  return [
    {
      title: "Sous-catégories",
      links: category.children.map((child) => ({
        label: child.name,
        href: child.path,
      })),
    },
  ];
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
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const known = new Set<string>();
  const catalogRootIds = new Set(
    catalogGroups.flatMap((group) => [group.id, group.path.replace(/^\//, "")]),
  );

  const merged = fallback.flatMap((item) => {
    if (catalogRootIds.has(item.id) && !bySlug.has(item.id)) return [];
    const category = bySlug.get(item.id);
    if (!category) return item;
    known.add(category.slug);
    const megaMenu = categoryMenu(category) ?? item.megaMenu;
    const menuShortcuts = categoryMenuShortcuts(category);
    return megaMenu
      ? {
          ...item,
          label: category.name,
          href: category.path,
          megaMenu,
          ...(menuShortcuts.length > 0 ? { menuShortcuts } : {}),
        }
      : { ...item, label: category.name, href: category.path };
  });

  for (const category of categories) {
    if (known.has(category.slug)) continue;
    const megaMenu = categoryMenu(category);
    const menuShortcuts = categoryMenuShortcuts(category);
    merged.push({
      id: category.slug,
      label: category.name,
      href: category.path,
      ...(megaMenu ? { megaMenu } : {}),
      ...(menuShortcuts.length > 0 ? { menuShortcuts } : {}),
    });
  }
  return merged;
}
