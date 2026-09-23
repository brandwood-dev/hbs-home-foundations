import { describe, expect, it } from "vitest";
import { adminProductConfigForCategory, visibleProductFields } from "./admin-product-fields.config";

describe("admin tringle subcategory fields", () => {
  it("hides legacy accessory fields only for curtain rods", () => {
    const tringles = adminProductConfigForCategory("accessoires", "accessoires-tringles");
    expect(tringles.productFields).not.toEqual(
      expect.arrayContaining(["compatibilities", "finish", "diameter_mm"]),
    );
    expect(tringles.productFields).toEqual(
      expect.arrayContaining(["accessory_type", "material", "installation"]),
    );

    const otherAccessory = adminProductConfigForCategory("accessoires", "accessoires-embrasses");
    expect(otherAccessory.productFields).toEqual(
      expect.arrayContaining(["compatibilities", "finish", "diameter_mm"]),
    );
  });

  it("does not expose removed fields through visibleProductFields", () => {
    const fields = visibleProductFields("accessoires", {}, "accessoires-tringles").map(
      (field) => field.key,
    );
    expect(fields).not.toEqual(
      expect.arrayContaining(["compatibilities", "finish", "diameter_mm"]),
    );
  });
});
