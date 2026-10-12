import { describe, expect, it } from "vitest";
import type { Product } from "@/domain/product/product.types";
import { resolveHotspots } from "./shop-the-look-resolver";

describe("resolveHotspots", () => {
  it("uses the canonical product media when a variant still contains a placeholder", () => {
    const product = {
      id: "product-1",
      slug: "rideau-velours-beige-clair",
      canonicalPath: "/rideaux-voilages/rideaux-velours/rideau-velours-beige-clair",
      name: "Rideau velours beige clair",
      imageAlt: "Rideau velours beige clair dans un salon",
      shortDescription: "Un rideau en velours doux et occultant.",
      images: [
        {
          id: "image-1",
          url: "https://cdn.example.test/rideau-velours.webp",
          alt: "Rideau velours beige clair",
          type: "front",
        },
      ],
      variants: [
        {
          id: "variant-1",
          sku: "RIDE-001",
          colorId: "beige",
          widthCm: 150,
          heightCm: 280,
          price: { amountMinor: 65000, currency: "TND" },
          availability: "in_stock",
          availableQuantity: 5,
          imageUrl: "/images/placeholder.jpg",
          imageIds: [],
        },
      ],
    } as unknown as Product;

    const [resolved] = resolveHotspots(
      [
        {
          id: "hotspot-1",
          productId: product.id,
          xPercent: 50,
          yPercent: 50,
        },
      ],
      [product],
    );

    expect(resolved).toMatchObject({
      imageSrc: "https://cdn.example.test/rideau-velours.webp",
      imageAlt: "Rideau velours beige clair dans un salon",
      description: "Un rideau en velours doux et occultant.",
      href: "/rideaux-voilages/rideaux-velours/rideau-velours-beige-clair",
      priceLabel: "65 DT",
    });
  });
});
