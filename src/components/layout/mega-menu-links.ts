import type { MegaMenuColumn, NavLink } from "@/types/navigation.types";

export const MAX_MEGA_MENU_LINKS = 8;

export interface MegaMenuDisplayLink extends NavLink {
  key: string;
}

export interface MegaMenuLinkLayout {
  links: MegaMenuDisplayLink[];
  hasMore: boolean;
  useColumns: boolean;
}

/**
 * Keeps the editorial column predictable while preserving the full category
 * navigation elsewhere in the header and on the category pages.
 */
export function getMegaMenuLinkLayout(columns: MegaMenuColumn[]): MegaMenuLinkLayout {
  const links = columns.flatMap((column) =>
    column.links.map((link) => ({
      ...link,
      key: `${column.title}-${link.href}-${link.label}`,
    })),
  );

  return {
    links: links.slice(0, MAX_MEGA_MENU_LINKS),
    hasMore: links.length > MAX_MEGA_MENU_LINKS,
    useColumns: links.length > 5,
  };
}
