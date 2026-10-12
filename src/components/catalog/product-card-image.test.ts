import { describe, expect, it } from "vitest";
import { getProductCardImage, getProductCardSecondaryImage } from "./product-card-image";

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

  it("uses the second linked gallery image when the API omits the explicit secondary URL", () => {
    const product = {
      images: [
        {
          id: "front",
          url: "https://storage.example.test/front.jpg",
          alt: "Avant",
          type: "front" as const,
        },
        {
          id: "detail",
          url: "https://storage.example.test/detail.jpg",
          alt: "Détail",
          type: "lifestyle" as const,
        },
      ],
      variants: [
        {
          imageUrl: "https://storage.example.test/front.jpg",
          imageIds: ["front", "detail"],
        },
      ],
    };

    expect(getProductCardSecondaryImage(product, product.variants[0])).toBe(
      "https://storage.example.test/detail.jpg",
    );
  });

  it("prefers a distinct explicit variant secondary URL", () => {
    const product = {
      images: [
        {
          id: "front",
          url: "https://storage.example.test/front.jpg",
          alt: "Avant",
          type: "front" as const,
        },
      ],
      variants: [{ imageUrl: "https://storage.example.test/front.jpg" }],
    };

    expect(
      getProductCardSecondaryImage(product, {
        secondaryImageUrl: "https://storage.example.test/secondary.jpg",
        imageIds: [],
      }),
    ).toBe("https://storage.example.test/secondary.jpg");
  });
});
