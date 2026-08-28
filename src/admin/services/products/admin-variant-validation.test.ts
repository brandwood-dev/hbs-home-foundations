import { describe, expect, it } from "vitest";
import { validateVariant } from "./admin-variant-validation";
import type { AdminVariant } from "@/admin/types/admin.types";

const variant: AdminVariant = {
  id: "variant-1",
  sku: "HBS-RID-001-VAR-01",
  colorId: "lin",
  colorLabel: "Lin",
  widthCm: 300,
  heightCm: 280,
  curtainHeader: "oeillets",
  priceMinor: 18900,
  stock: 2,
  lowStockThreshold: 1,
  availability: "in_stock",
  isActive: true,
};

describe("admin variant business rules", () => {
  it("limits curtain height to 3.15m", () => {
    expect(
      validateVariant(
        { ...variant, heightCm: 316 },
        {
          axes: ["color", "dimensions"],
          siblings: [],
          foreignSkus: [],
          supportsInventory: true,
          requiresPrice: true,
          category: "rideaux",
          material: "lin",
        },
      )["dimensions"],
    ).toContain("315 cm");
  });

  it("requires velvet widths to use 1.5m panels", () => {
    expect(
      validateVariant(
        { ...variant, widthCm: 400 },
        {
          axes: ["color", "dimensions"],
          siblings: [],
          foreignSkus: [],
          supportsInventory: true,
          requiresPrice: true,
          category: "rideaux",
          material: "velours",
        },
      )["dimensions"],
    ).toContain("multiple de 150 cm");
  });
});
