import { describe, expect, it } from "vitest";
import { mergeCatalogNavigation } from "./catalog-navigation";
import type { PublicCategory } from "@/repositories/interfaces/CategoryRepository";
import type { NavItem } from "@/types/navigation.types";

const fallback: NavItem[] = [
  { id: "rideaux", label: "Rideaux", href: "/rideaux" },
  { id: "inspirations", label: "Inspirations", href: "/inspirations" },
];

const categories: PublicCategory[] = [
  {
    slug: "rideaux",
    name: "Habillage de fenêtres",
    description: null,
    parentSlug: null,
    path: "/rideaux",
    imageUrl: null,
    seoTitle: null,
    seoDescription: null,
    attributes: [],
    children: [
      {
        slug: "lin",
        name: "Lin naturel",
        description: null,
        parentSlug: "rideaux",
        path: "/rideaux/lin",
        imageUrl: null,
        seoTitle: null,
        seoDescription: null,
        attributes: [],
        children: [],
      },
    ],
  },
];

describe("dynamic catalog navigation", () => {
  it("updates known labels and adds child category links", () => {
    const result = mergeCatalogNavigation(fallback, categories);
    expect(result[0]).toMatchObject({ id: "rideaux", label: "Habillage de fenêtres" });
    expect(result[0]?.megaMenu?.[0]?.links).toEqual([
      { label: "Lin naturel", href: "/rideaux/lin" },
    ]);
    expect(result[1]).toMatchObject({ id: "inspirations", href: "/inspirations" });
  });

  it("keeps the fixture navigation during an API outage", () => {
    expect(mergeCatalogNavigation(fallback, undefined)).toEqual(fallback);
  });
});
