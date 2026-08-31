import { describe, expect, it } from "vitest";
import {
  generateVariantSku,
  normalizeVariantSku,
} from "@/admin/services/products/admin-product-slug";

describe("variant SKU helpers", () => {
  it("normalizes case and surrounding whitespace for comparisons", () => {
    expect(normalizeVariantSku("  cous-001-var-02 ")).toBe("COUS-001-VAR-02");
  });

  it("keeps generated SKU indexes deterministic", () => {
    expect(generateVariantSku("COUS-001", 2)).toBe("COUS-001-VAR-03");
  });
});
