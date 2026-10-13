import { describe, expect, it } from "vitest";
import { demoCatalog } from "@/repositories/mock/MockProductRepository";
import { computeFacets } from "./catalog.filters";

describe("catalog facets", () => {
  it("does not expose zero dimensions while keeping real dimensions", () => {
    const source = demoCatalog[0]!;
    const baseVariant = source.variants[0]!;
    const product = {
      ...source,
      variants: [
        { ...baseVariant, widthCm: 0, heightCm: 0 },
        { ...baseVariant, id: `${baseVariant.id}-40`, widthCm: 40, heightCm: 40 },
      ],
    };

    const facets = computeFacets([product]);

    expect(facets.widths.map((option) => option.value)).toEqual(["40"]);
    expect(facets.heights.map((option) => option.value)).toEqual(["40"]);
  });
});

