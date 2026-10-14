import { describe, expect, it } from "vitest";
import {
  adminProductBelongsToCategory,
  adminProductCategoryLabel,
  buildAdminProductCategoryOptions,
} from "./admin-product-table";
import type { AdminCategory } from "@/admin/types/admin.types";

const category = (partial: Partial<AdminCategory> & Pick<AdminCategory, "id" | "name">) =>
  ({
    slug: partial.name.toLowerCase().replaceAll(" ", "-"),
    order: 0,
    isActive: true,
    status: "active" as const,
    description: "",
    seoTitle: "",
    seoDescription: "",
    ...partial,
  }) satisfies AdminCategory;

describe("admin product table taxonomy", () => {
  const categories = [
    category({ id: "root", name: "Rideaux & Voilages", order: 1 }),
    category({ id: "child", name: "Velours", parentId: "root", order: 1 }),
    category({ id: "other", name: "Accessoires", order: 2 }),
  ];

  it("uses current category names and keeps the hierarchy in filters", () => {
    expect(buildAdminProductCategoryOptions(categories)).toEqual([
      { value: "root", label: "Rideaux & Voilages" },
      { value: "child", label: "Rideaux & Voilages → Velours" },
      { value: "other", label: "Accessoires" },
    ]);
    expect(
      adminProductCategoryLabel({ categoryId: "child", subCategoryId: "child" }, categories),
    ).toBe("Rideaux & Voilages → Velours");
  });

  it("matches products assigned to descendants of a selected root", () => {
    expect(
      adminProductBelongsToCategory(
        { categoryId: "child", subCategoryId: "child" },
        "root",
        categories,
      ),
    ).toBe(true);
    expect(adminProductBelongsToCategory({ categoryId: "other" }, "root", categories)).toBe(false);
  });

  it("does not expose archived or inactive categories", () => {
    const hidden = [
      ...categories,
      category({ id: "archived", name: "Ancienne", status: "archived" }),
      category({ id: "inactive", name: "Masquée", isActive: false }),
    ];
    expect(buildAdminProductCategoryOptions(hidden).map((option) => option.value)).not.toContain(
      "archived",
    );
    expect(buildAdminProductCategoryOptions(hidden).map((option) => option.value)).not.toContain(
      "inactive",
    );
  });
});
