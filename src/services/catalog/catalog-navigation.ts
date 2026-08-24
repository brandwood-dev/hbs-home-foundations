import type { PublicCategory } from "@/repositories/interfaces/CategoryRepository";
import type { NavItem } from "@/types/navigation.types";

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
  if (!categories?.length) return [...fallback];
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const known = new Set<string>();

  const merged = fallback.map((item) => {
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
