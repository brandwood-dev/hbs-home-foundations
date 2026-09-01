import { describe, expect, it } from "vitest";
import type { Product } from "@/domain/product/product.types";
import { getVariantImages } from "./product-variants";

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
