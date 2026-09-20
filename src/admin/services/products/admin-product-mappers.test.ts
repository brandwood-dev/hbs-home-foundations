import { describe, expect, it } from "vitest";
import { variantSummary } from "./admin-product-mappers";
import type { AdminVariant } from "@/admin/types/admin.types";

const legacyCurtainVariant: AdminVariant = {
  id: "variant-1",
  sku: "RID-001-VAR-01",
  colorId: "noir",
  colorLabel: "Noir",
  widthCm: 300,
  heightCm: 280,
  curtainHeader: "oeillets",
  eyeletColor: "argent",
  lining: "sans_doublure",
  priceMinor: 99000,
  stock: 1,
  lowStockThreshold: 1,
  availability: "in_stock",
  isActive: true,
  options: {
    colorId: "noir",
    colorLabel: "Noir",
    widthCm: 300,
    heightCm: 280,
    curtainHeader: "oeillets",
    eyeletColor: "argent",
    lining: "sans_doublure",
  },
};

describe("variantSummary", () => {
  it("does not expose legacy confection metadata", () => {
    expect(variantSummary(legacyCurtainVariant)).toBe("Noir · 300×280 cm");
  });
});
