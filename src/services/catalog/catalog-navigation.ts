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
    return megaMenu
      ? { ...item, label: category.name, href: category.path, megaMenu }
      : { ...item, label: category.name, href: category.path };
  });

  for (const category of categories) {
    if (known.has(category.slug)) continue;
    const megaMenu = categoryMenu(category);
    merged.push({
      id: category.slug,
      label: category.name,
      href: category.path,
      ...(megaMenu ? { megaMenu } : {}),
    });
  }
  return merged;
}
