import { describe, expect, it } from "vitest";
import { buildCategoryProductCounts } from "./admin-category-product-counts";

describe("buildCategoryProductCounts", () => {
  it("aggregates leaf products into every ancestor category", () => {
    const counts = buildCategoryProductCounts(
      [{ id: "root" }, { id: "child", parentId: "root" }, { id: "leaf", parentId: "child" }],
      [
        { categoryId: "leaf", subCategoryId: "leaf" },
        { categoryId: "child", subCategoryId: "child" },
      ],
    );

    expect(counts.get("leaf")).toBe(1);
    expect(counts.get("child")).toBe(2);
    expect(counts.get("root")).toBe(2);
  });

  it("prefers a product sub-category when both ids are present", () => {
    const counts = buildCategoryProductCounts(
      [{ id: "root" }, { id: "child", parentId: "root" }],
      [{ categoryId: "root", subCategoryId: "child" }],
    );

    expect(counts.get("child")).toBe(1);
    expect(counts.get("root")).toBe(1);
  });

  it("ignores stale category ids without affecting known categories", () => {
    const counts = buildCategoryProductCounts(
      [{ id: "root" }],
      [{ categoryId: "missing", subCategoryId: "missing" }],
    );

    expect(counts).toEqual(new Map());
  });
});
