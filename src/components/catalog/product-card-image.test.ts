import { describe, expect, it } from "vitest";
import { getProductCardImage } from "./product-card-image";

describe("product card image selection", () => {
  it("prefers the published product media over a legacy variant URL", () => {
    expect(
      getProductCardImage({
        images: [
          {
            id: "media-1",
            url: "https://storage.example.test/product.jpg",
            alt: "Produit",
            type: "front",
          },
        ],
        variants: [{ imageUrl: "https://preview.example.test/legacy.jpg" }],
      }),
    ).toBe("https://storage.example.test/product.jpg");
  });

  it("falls back to the variant image when product media is absent", () => {
    expect(
      getProductCardImage({
        images: [],
        variants: [{ imageUrl: "https://cdn.example.test/variant.jpg" }],
      }),
    ).toBe("https://cdn.example.test/variant.jpg");
  });
});
