import { describe, expect, it } from "vitest";
import { ADMIN_VARIANT_AXES_BY_CATEGORY } from "./admin-variant-axes.config";
import { adminProductConfigForCategory } from "./admin-product-fields.config";

describe("admin curtain variant axes", () => {
  it("keeps confection choices out of the variant form", () => {
    expect(ADMIN_VARIANT_AXES_BY_CATEGORY.rideaux).toEqual(["color", "dimensions"]);
    expect(ADMIN_VARIANT_AXES_BY_CATEGORY.voilages).toEqual([
      "color",
      "dimensions",
      "sheer_finish",
    ]);
  });

  it("uses color and mounting only for curtain rods", () => {
    expect(
      adminProductConfigForCategory("accessoires", "accessoires-tringles").variantAxes,
    ).toEqual(["color", "mounting"]);
  });
});
