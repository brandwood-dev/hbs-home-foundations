import { describe, expect, it } from "vitest";
import { getProductPath } from "./product-url";

describe("product URL policy", () => {
  it("uses the API-provided canonical taxonomy path", () => {
    expect(
      getProductPath({
        slug: "rideau-lin-naturel",
        canonicalPath: "/rideaux/lin/rideau-lin-naturel",
      }),
    ).toBe("/rideaux/lin/rideau-lin-naturel");
  });

  it("keeps legacy product links compatible when no canonical path is available", () => {
    expect(getProductPath({ slug: "rideau lin" })).toBe("/produit/rideau%20lin");
  });
});
