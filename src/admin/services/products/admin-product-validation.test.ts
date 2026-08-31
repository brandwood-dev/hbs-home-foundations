import { describe, expect, it } from "vitest";
import { validateProductForPublication } from "./admin-product-validation";
import type { AdminProduct } from "@/admin/types/admin.types";

const product = {
  id: "product-1",
  name: "Coussin test",
  slug: "coussin-test",
  reference: "COU-001",
  categoryId: "category-1",
  category: "coussins",
  sellingMode: "ready_made",
  shortDescription: "Coussin de test",
  longDescription: "",
  tags: [],
  rooms: [],
  status: "draft",
  images: ["https://cdn.example.test/coussin.webp"],
  imageAssets: [
    {
      id: "image-1",
      url: "https://cdn.example.test/coussin.webp",
      alt: "Coussin test",
      order: 1,
      isPrimary: true,
    },
  ],
  variants: [
    {
      id: "variant-1",
      sku: "COU-001-VAR-01",
      colorId: "",
      colorLabel: "",
      widthCm: 40,
      heightCm: 40,
      curtainHeader: "",
      priceMinor: 39000,
      stock: 1,
      lowStockThreshold: 1,
      availability: "in_stock",
      isActive: true,
    },
  ],
  seoTitle: "Coussin test",
  seoDescription: "Coussin de test",
  createdAt: "2026-08-31T00:00:00.000Z",
  updatedAt: "2026-08-31T00:00:00.000Z",
} as AdminProduct;

describe("admin product publication validation", () => {
  it("blocks an active variant without a color", () => {
    expect(validateProductForPublication(product)).toContain(
      "La variante 1 doit avoir une couleur sélectionnée.",
    );
  });

  it("accepts a valid active variant", () => {
    expect(
      validateProductForPublication({
        ...product,
        variants: [{ ...product.variants[0]!, colorId: "beige", colorLabel: "Beige" }],
      }),
    ).toEqual([]);
  });
});
