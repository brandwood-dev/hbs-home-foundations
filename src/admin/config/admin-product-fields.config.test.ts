import { describe, expect, it } from "vitest";
import {
  ADMIN_PRODUCT_FIELDS,
  MOBILIER_REMOVED_ATTRIBUTE_KEYS,
  adminProductCategoryConfigs,
  adminProductConfigForCategory,
  isAdminAttributeEnabledForCategory,
  visibleProductFields,
} from "./admin-product-fields.config";

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

describe("admin mobilier fields", () => {
  it("exposes and requires the main material used by the API contract", () => {
    const config = adminProductCategoryConfigs.mobilier_interieur;
    const fields = visibleProductFields("mobilier_interieur", {
      furniture_type: "canape",
    }).map((field) => field.key);

    expect(fields).toContain("material");
    expect(config.requiredFields).toContain("material");
    expect(ADMIN_PRODUCT_FIELDS["material"]?.label).toBe("Matière principale");
  });

  it("uses the public furniture vocabulary for controlled fields", () => {
    const furnitureType = ADMIN_PRODUCT_FIELDS["furniture_type"]!;
    const assembly = ADMIN_PRODUCT_FIELDS["assembly_level"]!;
    const shipping = ADMIN_PRODUCT_FIELDS["shipping_profile"]!;

    expect(furnitureType.options).toEqual(
      expect.arrayContaining([
        { value: "table_basse", label: "Table basse" },
        { value: "meuble_tv", label: "Meuble TV" },
        { value: "etagere", label: "Étagère" },
      ]),
    );
    expect(assembly.options).toEqual(
      expect.arrayContaining([
        { value: "livre_monte", label: "Livré monté" },
        { value: "montage_requis", label: "Montage requis" },
      ]),
    );
    expect(shipping.options).toEqual(
      expect.arrayContaining([{ value: "hors_norme", label: "Livraison hors norme" }]),
    );
  });

  it("hides irrelevant seating and storage fields", () => {
    const seating = new Set(
      visibleProductFields("mobilier_interieur", { furniture_type: "canape" }).map(
        (field) => field.key,
      ),
    );
    const storage = new Set(
      visibleProductFields("mobilier_interieur", { furniture_type: "meuble_tv" }).map(
        (field) => field.key,
      ),
    );

    expect(seating.has("seat_comfort")).toBe(true);
    expect(seating.has("storage_volume_l")).toBe(false);
    expect(storage.has("seat_comfort")).toBe(false);
    expect(storage.has("storage_volume_l")).toBe(true);
  });

  it("removes non-essential logistics and seating measurements from mobilier", () => {
    const removed = [...MOBILIER_REMOVED_ATTRIBUTE_KEYS];
    const fields = visibleProductFields("mobilier_interieur", { furniture_type: "canape" }).map(
      (field) => field.key,
    );

    expect(fields).not.toEqual(expect.arrayContaining(removed));
    expect(fields).toEqual(expect.arrayContaining(["width_cm", "height_cm"]));
  });

  it("also suppresses legacy furniture attributes returned by the catalogue", () => {
    expect(isAdminAttributeEnabledForCategory("mobilier_interieur", "depth_cm")).toBe(false);
    expect(isAdminAttributeEnabledForCategory("mobilier_interieur", "package_count")).toBe(false);
    expect(isAdminAttributeEnabledForCategory("mobilier_interieur", "frame_material")).toBe(true);
    expect(isAdminAttributeEnabledForCategory("rideaux", "depth_cm")).toBe(true);
    expect(
      isAdminAttributeEnabledForCategory("accessoires", "depth_cm", "accessoires-tringles"),
    ).toBe(false);
    expect(
      isAdminAttributeEnabledForCategory(
        "accessoires",
        "free_shipping_eligible",
        "accessoires-tringles",
      ),
    ).toBe(false);
    expect(
      isAdminAttributeEnabledForCategory("accessoires", "depth_cm", "accessoires-embrasses"),
    ).toBe(true);
  });
});
