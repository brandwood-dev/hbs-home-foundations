import { describe, expect, it } from "vitest";
import { catalogCategoryOptionsForFamily, isCategoryInFamily } from "./admin-product-taxonomy";

const categories = [
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
});
