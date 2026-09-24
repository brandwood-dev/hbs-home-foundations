import { describe, expect, it } from "vitest";
import {
  BRONZE_ADMIN_COLOR_OPTION,
  DEFAULT_ADMIN_COLOR_OPTIONS,
  ensureBronzeAdminColorOption,
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

  it("adds bronze for curtain families without duplicating an API-provided option", () => {
    expect(ensureBronzeAdminColorOption([{ value: "c-beige", label: "Beige sable" }])).toEqual([
      { value: "c-beige", label: "Beige sable" },
      BRONZE_ADMIN_COLOR_OPTION,
    ]);
    expect(
      ensureBronzeAdminColorOption([{ value: "c-bronze", label: "Bronze", hex: "#8B5A3C" }]),
    ).toEqual([{ value: "c-bronze", label: "Bronze", hex: "#8B5A3C" }]);
  });
});
