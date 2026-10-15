import { describe, expect, it } from "vitest";
import { validateCatalogSearch } from "./catalog.search-params";

describe("catalog search params", () => {
  it("decodes TanStack Router JSON-encoded filter arrays", () => {
    const search = validateCatalogSearch({
      materials: '["lin","velours"]',
      colors: "[]",
      widths: "[150,300]",
      availability: '["in_stock"]',
    });

    expect(search.materials).toEqual(["lin", "velours"]);
    expect(search.colors).toEqual([]);
    expect(search.widths).toEqual([150, 300]);
    expect(search.availability).toEqual(["in_stock"]);
  });

  it("keeps comma-separated links compatible", () => {
    const search = validateCatalogSearch({
      materials: "lin,velours",
      widths: "150,300",
    });

    expect(search.materials).toEqual(["lin", "velours"]);
    expect(search.widths).toEqual([150, 300]);
  });

  it("ignores zero dimensions from manually edited links", () => {
    const search = validateCatalogSearch({
      widths: "0,40",
      heights: "0",
    });

    expect(search.widths).toEqual([40]);
    expect(search.heights).toEqual([]);
  });
});
