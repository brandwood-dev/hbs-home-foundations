import { describe, expect, it } from "vitest";
import {
  DEFAULT_ADMIN_COLOR_OPTIONS,
  resolveAdminColorOptions,
} from "@/admin/config/admin-color-options";
import type { AdminAttribute } from "@/admin/types/admin.types";

function colorAttribute(values: AdminAttribute["values"]): AdminAttribute {
  return {
    id: "color",
    key: "color",
    name: "Couleur",
    fieldType: "color",
    isFilterable: true,
    isVariantAxis: true,
    order: 1,
    values,
  };
}

describe("resolveAdminColorOptions", () => {
  it("keeps the product form usable while the API has no color attribute", () => {
    const options = resolveAdminColorOptions([]);

    expect(options).toEqual(DEFAULT_ADMIN_COLOR_OPTIONS);
    expect(options.length).toBeGreaterThan(0);
    expect(options.some((option) => option.value === "c-beige")).toBe(true);
  });

  it("normalizes canonical API slugs to public color ids", () => {
    const options = resolveAdminColorOptions([
      colorAttribute([
        {
          id: "option-beige",
          label: "Beige sable",
          slug: "beige",
          order: 1,
          isActive: true,
        },
      ]),
    ]);

    expect(options).toEqual([{ value: "c-beige", label: "Beige sable", hex: "#DCC7A6" }]);
  });

  it("ignores inactive options and falls back when none are selectable", () => {
    const options = resolveAdminColorOptions([
      colorAttribute([
        {
          id: "option-beige",
          label: "Beige sable",
          slug: "beige",
          order: 1,
          isActive: false,
        },
      ]),
    ]);

    expect(options).toEqual(DEFAULT_ADMIN_COLOR_OPTIONS);
  });
});
