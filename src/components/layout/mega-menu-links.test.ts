import { describe, expect, it } from "vitest";
import type { MegaMenuColumn } from "@/types/navigation.types";
import {
  getMegaMenuLinkLayout,
  MAX_MEGA_MENU_LINKS,
  MAX_MEGA_MENU_LINKS_PER_COLUMN,
} from "./mega-menu-links";

function makeColumns(count: number): MegaMenuColumn[] {
  return [
    {
      title: "Styles",
      links: Array.from({ length: count }, (_, index) => ({
        label: `Style ${index + 1}`,
        href: `/style-${index + 1}`,
      })),
    },
  ];
}

describe("getMegaMenuLinkLayout", () => {
  it.each([2, MAX_MEGA_MENU_LINKS_PER_COLUMN])("keeps %i links in one column", (count) => {
    const layout = getMegaMenuLinkLayout(makeColumns(count));

    expect(layout.links).toHaveLength(count);
    expect(layout.useColumns).toBe(false);
    expect(layout.hasMore).toBe(false);
  });

  it("starts a second compact column after three links", () => {
    const layout = getMegaMenuLinkLayout(makeColumns(MAX_MEGA_MENU_LINKS_PER_COLUMN + 1));

    expect(layout.links).toHaveLength(MAX_MEGA_MENU_LINKS_PER_COLUMN + 1);
    expect(layout.useColumns).toBe(true);
    expect(layout.hasMore).toBe(false);
  });

  it("keeps eight links compact without showing the CTA", () => {
    const layout = getMegaMenuLinkLayout(makeColumns(MAX_MEGA_MENU_LINKS));

    expect(layout.links).toHaveLength(MAX_MEGA_MENU_LINKS);
    expect(layout.useColumns).toBe(true);
    expect(layout.hasMore).toBe(false);
  });

  it("caps longer lists and exposes the category CTA state", () => {
    const layout = getMegaMenuLinkLayout(makeColumns(MAX_MEGA_MENU_LINKS + 1));

    expect(layout.links).toHaveLength(MAX_MEGA_MENU_LINKS);
    expect(layout.hasMore).toBe(true);
    expect(layout.useColumns).toBe(true);
  });
});
