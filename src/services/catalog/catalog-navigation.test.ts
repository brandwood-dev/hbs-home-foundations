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

  it("exposes at most two newest sub-category image shortcuts", () => {
    const rootCategory = categories[0]!;
    const baseChild = rootCategory.children[0]!;
    const category = {
      ...rootCategory,
      children: [
        {
          ...baseChild,
          latestProduct: {
            slug: "lin-ancien",
            name: "Lin ancien",
            imageUrl: "https://cdn.example.test/lin-ancien.webp",
            imageAlt: "Rideau en lin ancien",
            createdAt: "2026-08-01T00:00:00.000Z",
          },
        },
        {
          ...baseChild,
          slug: "velours",
          name: "Velours",
          path: "/rideaux/velours",
          latestProduct: {
            slug: "velours-nouveau",
            name: "Velours nouveau",
            imageUrl: "https://cdn.example.test/velours-nouveau.webp",
            imageAlt: "Rideau en velours nouveau",
            createdAt: "2026-08-03T00:00:00.000Z",
          },
        },
        {
          ...baseChild,
          slug: "satin",
          name: "Satin",
          path: "/rideaux/satin",
          latestProduct: {
            slug: "satin-nouveau",
            name: "Satin nouveau",
            imageUrl: "https://cdn.example.test/satin-nouveau.webp",
            imageAlt: "Rideau en satin nouveau",
            createdAt: "2026-08-02T00:00:00.000Z",
          },
        },
      ],
    };
    const result = mergeCatalogNavigation(fallback, [category]);

    expect(result[0]?.menuShortcuts).toEqual([
      {
        label: "Velours",
        href: "/rideaux/velours",
        imageUrl: "https://cdn.example.test/velours-nouveau.webp",
        imageAlt: "Rideau en velours nouveau",
      },
      {
        label: "Satin",
        href: "/rideaux/satin",
        imageUrl: "https://cdn.example.test/satin-nouveau.webp",
        imageAlt: "Rideau en satin nouveau",
      },
    ]);
  });

  it("keeps the fixture navigation during an API outage", () => {
    expect(mergeCatalogNavigation(fallback, undefined)).toEqual(fallback);
  });

  it("removes unpublished catalog roots when the API returns an empty list", () => {
    expect(mergeCatalogNavigation(fallback, [])).toEqual([
      { id: "inspirations", label: "Inspirations", href: "/inspirations" },
    ]);
  });
});
