import { describe, expect, it } from "vitest";
import type { Product } from "@/domain/product/product.types";
import { sortVariantsByDimensions } from "@/domain/product/variant-order";
import { getVariantImages } from "./product-variants";

describe("variant dimension order", () => {
  it("sorts dimensions from the smallest width to the largest while keeping ties stable", () => {
    const variants = [
      { id: "large", widthCm: 600, heightCm: 280 },
      { id: "small", widthCm: 150, heightCm: 280 },
      { id: "medium", widthCm: 300, heightCm: 280 },
      { id: "same-width-taller", widthCm: 150, heightCm: 300 },
    ];

    expect(sortVariantsByDimensions(variants).map((variant) => variant.id)).toEqual([
      "small",
      "same-width-taller",
      "medium",
      "large",
    ]);
  });
});

describe("variant media selection", () => {
  it("uses the variant media and falls back to product media", () => {
    const product = {
      images: [
        { id: "front", url: "/front.webp" },
        { id: "ivory", url: "/ivory.webp" },
        { id: "bordeaux", url: "/bordeaux.webp" },
      ],
    } as unknown as Product;

    expect(
      getVariantImages(product, {
        imageIds: ["bordeaux"],
        imageUrl: "",
      } as unknown as Product["variants"][number]),
    ).toEqual([{ id: "bordeaux", url: "/bordeaux.webp" }]);
    expect(
      getVariantImages(product, {
        imageIds: [],
        imageUrl: "",
      } as unknown as Product["variants"][number]),
    ).toEqual(product.images);
  });
});
