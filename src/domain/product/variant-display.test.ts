import { describe, expect, it } from "vitest";
import { hasDisplayableSize, isCurtainRodAccessory } from "@/domain/product/variant-display";

describe("variant display rules", () => {
  it("recognizes both curtain rod accessory types", () => {
    expect(
      isCurtainRodAccessory({ category: "accessoires", accessoryType: "tringle_extensible" }),
    ).toBe(true);
    expect(isCurtainRodAccessory({ category: "accessoires", accessoryType: "tringle_fixe" })).toBe(
      true,
    );
    expect(isCurtainRodAccessory({ category: "accessoires", accessoryType: "rail" })).toBe(false);
    expect(
      isCurtainRodAccessory({ category: "rideaux", accessoryType: "tringle_extensible" }),
    ).toBe(false);
  });

  it("only exposes positive dimensions or an explicit size label", () => {
    expect(hasDisplayableSize({ widthCm: 0, heightCm: 0 })).toBe(false);
    expect(hasDisplayableSize({ widthCm: 150, heightCm: 0 })).toBe(false);
    expect(hasDisplayableSize({ widthCm: 40, heightCm: 40 })).toBe(true);
    expect(hasDisplayableSize({ widthCm: 0, heightCm: 0, sizeLabel: "Format unique" })).toBe(true);
  });
});
