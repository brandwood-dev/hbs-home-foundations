import { describe, expect, it } from "vitest";
import {
  catalogCategoryOptionsForFamily,
  catalogFamilyOptionsForCategories,
  familyRootCategory,
  isCategoryInFamily,
} from "./admin-product-taxonomy";
import type { AdminCategory } from "@/admin/types/admin.types";

const categories: AdminCategory[] = [
  {
    id: "rideaux",
    name: "Rideaux",
    slug: "rideaux",
    order: 1,
    isActive: true,
    description: "",
    seoTitle: "",
    seoDescription: "",
  },
  {
    id: "lin",
    name: "Lin",
    slug: "lin",
    parentId: "rideaux",
    order: 1,
    isActive: true,
    description: "",
    seoTitle: "",
    seoDescription: "",
  },
  {
    id: "stores",
    name: "Stores",
    slug: "stores",
    order: 2,
    isActive: true,
    description: "",
    seoTitle: "",
    seoDescription: "",
  },
];

describe("admin product taxonomy", () => {
  it("limits catalogue choices to the selected family", () => {
    expect(catalogCategoryOptionsForFamily(categories, "rideaux")).toEqual([
      { value: "lin", label: "Lin", parentId: "rideaux" },
    ]);
    expect(isCategoryInFamily(categories, "lin", "rideaux")).toBe(true);
    expect(isCategoryInFamily(categories, "stores", "rideaux")).toBe(false);
  });

  it("keeps the root selectable when no subcategory exists", () => {
    expect(catalogCategoryOptionsForFamily(categories, "stores")).toEqual([
      { value: "stores", label: "Stores (catégorie principale)" },
    ]);
  });

  it("resolves migrated catalogue slugs to the stable product families", () => {
    const migratedCategories: AdminCategory[] = [
      {
        ...categories[0]!,
        id: "rideaux-voilages",
        slug: "rideaux-voilages",
        name: "Rideaux & voilages",
      },
      { ...categories[1]!, id: "lin-migre", parentId: "rideaux-voilages", name: "Lin naturel" },
      { ...categories[2]!, id: "mobilier", slug: "mobilier", name: "Mobilier d'intérieur" },
    ];

    expect(familyRootCategory(migratedCategories, "rideaux")?.id).toBe("rideaux-voilages");
    expect(catalogCategoryOptionsForFamily(migratedCategories, "rideaux")).toEqual([
      { value: "lin-migre", label: "Lin naturel", parentId: "rideaux-voilages" },
    ]);
    expect(catalogFamilyOptionsForCategories(migratedCategories)).toEqual([
      {
        value: "rideaux",
        label: "Rideaux & voilages",
        rootId: "rideaux-voilages",
        rootSlug: "rideaux-voilages",
      },
      {
        value: "mobilier_interieur",
        label: "Mobilier d'intérieur",
        rootId: "mobilier",
        rootSlug: "mobilier",
      },
    ]);
  });

  it("uses the selected category id when a root slug was renamed", () => {
    const renamedRoot: AdminCategory = {
      ...categories[0]!,
      id: "root-renamed",
      slug: "textiles-sur-mesure",
      name: "Textiles sur mesure",
    };
    const renamedChild: AdminCategory = {
      ...categories[1]!,
      id: "child-renamed",
      parentId: renamedRoot.id,
      name: "Lin lavé",
    };
    const renamedCategories: AdminCategory[] = [renamedRoot, renamedChild];

    expect(familyRootCategory(renamedCategories, "rideaux", renamedChild.id)).toEqual(renamedRoot);
    expect(catalogCategoryOptionsForFamily(renamedCategories, "rideaux", renamedChild.id)).toEqual([
      { value: renamedChild.id, label: "Lin lavé", parentId: renamedRoot.id },
    ]);
    expect(
      catalogFamilyOptionsForCategories(renamedCategories, "rideaux", renamedChild.id),
    ).toEqual([
      {
        value: "rideaux",
        label: "Textiles sur mesure",
        rootId: renamedRoot.id,
        rootSlug: renamedRoot.slug,
      },
    ]);
  });
});
