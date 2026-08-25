import { describe, expect, it } from "vitest";
import { findCompatibleAccessoryRecommendations } from "./accessory-recommendations";
import type { Product } from "@/domain/product/product.types";

const accessory = (overrides: Partial<Product>): Product => ({
  id: "rod",
  slug: "rod",
  name: "Rod",
  reference: "ROD-001",
  category: "accessoires",
  material: "acier_inoxydable",
  sellingMode: "ready_made",
  isLargeWidth: false,
  shortDescription: "",
  longDescription: "",
  imageAlt: "",
  images: [],
  variants: [
    {
      id: "rod-150-210",
      sku: "ROD-150-210",
      colorId: "black",
      widthCm: 150,
      heightCm: 210,
      minLengthCm: 150,
      maxLengthCm: 210,
      price: { amountMinor: 1, currency: "TND" },
      availability: "in_stock",
      availableQuantity: 10,
      imageUrl: "https://example.test/rod.jpg",
      imageIds: [],
    },
  ],
  colors: [],
  details: {
    composition: "Acier inoxydable",
    weightGsm: 0,
    care: [],
    features: [],
    installationNotes: [],
    originNote: "",
  },
  attributes: {},
  seo: { title: "", description: "" },
  isThermal: false,
  isNew: false,
  isBestSeller: false,
  isFeatured: false,
  createdAt: "2026-01-01",
  recommendationScore: 0,
  isDemo: false,
  accessoryType: "tringle_extensible",
  accessoryMaterial: "acier_inoxydable",
  accessoryCompatibilities: ["rideaux_oeillets"],
  ...overrides,
});

describe("curtain rod recommendations", () => {
  it("keeps only stainless extensible rods in the 1.5–3 m range", () => {
    const recommendations = findCompatibleAccessoryRecommendations({
      products: [
        accessory({ id: "stainless", slug: "stainless" }),
        accessory({ id: "fixed", slug: "fixed", accessoryType: "tringle_fixe" }),
        accessory({ id: "steel", slug: "steel", accessoryMaterial: "acier" }),
      ],
      supportType: "tringle",
      supportWidthCm: 180,
      projectType: "rideaux",
    });

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]?.product.id).toBe("stainless");
  });

  it("does not recommend a rod when the required support is outside the range", () => {
    const recommendations = findCompatibleAccessoryRecommendations({
      products: [accessory({})],
      supportType: "tringle",
      supportWidthCm: 120,
      projectType: "rideaux",
    });

    expect(recommendations).toHaveLength(0);
  });
});
