import { describe, expect, it } from "vitest";
import { getProductTaxonomyPath } from "./product-breadcrumbs";

describe("product breadcrumb taxonomy", () => {
  it("reads the root and subcategory from the canonical API path", () => {
    expect(
      getProductTaxonomyPath({
        category: "rideaux",
        canonicalPath: "/rideaux-voilages/velours/rideau-velours-rouge",
      }),
    ).toEqual({ rootSlug: "rideaux-voilages", subcategorySlug: "velours" });
  });

  it("falls back to the catalogue family for legacy records", () => {
    expect(getProductTaxonomyPath({ category: "rideaux" })).toEqual({
      rootSlug: "rideaux",
    });
  });

  it("does not treat legacy /produit links as taxonomy paths", () => {
    expect(
      getProductTaxonomyPath({ category: "coussins", canonicalPath: "/produit/coussin" }),
    ).toEqual({ rootSlug: "coussins" });
  });
});
