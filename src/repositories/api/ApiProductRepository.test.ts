import { describe, expect, it, vi } from "vitest";
import { HbsApiClient } from "@/api/client";
import { ApiProductRepository, mapProduct } from "./ApiProductRepository";

const apiProduct = {
  id: "product-1",
  slug: "rideau-lin",
  name: "Rideau lin",
  reference: "RL-001",
  category: "rideaux",
  material: "lin",
  sellingMode: "ready_made",
  isLargeWidth: false,
  shortDescription: "Rideau en lin.",
  longDescription: "Rideau en lin naturel.",
  imageAlt: "Rideau en lin",
  images: [],
  variants: [
    {
      id: "variant-1",
      sku: "RL-001-140",
      colorId: "naturel",
      widthCm: 140,
      heightCm: 250,
      price: { amountMinor: 129000, currency: "TND" },
      availability: "in_stock",
      availableQuantity: 4,
      imageUrl: "https://cdn.example.test/rideau-lin.jpg",
      imageIds: [],
    },
  ],
  colors: [],
  details: {},
  attributes: {},
  seo: { title: "Rideau lin", description: "Rideau en lin." },
  isThermal: false,
  isNew: false,
  isBestSeller: false,
  isFeatured: false,
  createdAt: "2026-08-21T00:00:00.000Z",
  recommendationScore: 0,
  isDemo: false,
} as Parameters<typeof mapProduct>[0];

describe("public catalogue API adapter", () => {
  it("reconstructs color swatches when the API only exposes the variant color id", () => {
    const mapped = mapProduct({
      ...apiProduct,
      variants: [{ ...apiProduct.variants[0]!, colorId: "c-blanc" }],
      colors: [],
    });

    expect(mapped.colors).toEqual([
      expect.objectContaining({
        id: "c-blanc",
        name: "Blanc optique",
        hex: "#FBFAF7",
        family: "white",
      }),
    ]);
  });

  it("keeps the API demo flag instead of forcing every product into demo mode", () => {
    expect(mapProduct(apiProduct)).toMatchObject({ id: "product-1", isDemo: false });
  });

  it("normalizes public variant dimensions to ascending order", () => {
    const mapped = mapProduct({
      ...apiProduct,
      variants: [
        { ...apiProduct.variants[0]!, id: "large", widthCm: 600 },
        { ...apiProduct.variants[0]!, id: "small", widthCm: 150 },
        { ...apiProduct.variants[0]!, id: "medium", widthCm: 300 },
      ],
    });

    expect(mapped.variants.map((variant) => variant.widthCm)).toEqual([150, 300, 600]);
  });

  it("normalizes the editable Rideaux & Voilages root to the curtain family", () => {
    const mapped = mapProduct({ ...apiProduct, category: "rideaux-voilages" });

    expect(mapped.category).toBe("rideaux");
    expect(mapped.confectionOptions).toHaveLength(4);
    expect(mapped.confectionOptions?.map((option) => option.key)).toEqual([
      "oeillets_argent",
      "oeillets_dore",
      "galon_fronceur",
      "wave",
    ]);
  });

  it("does not invent product detail placeholders when the API omits optional fields", () => {
    expect(mapProduct({ ...apiProduct, details: {} }).details).toEqual({
      care: [],
      features: [],
      installationNotes: [],
    });
  });

  it("maps admin characteristic attributes into public product details", () => {
    const mapped = mapProduct({
      ...apiProduct,
      details: {},
      attributes: {
        rooms: ["Salon", "Chambre"],
        care: "Lavage en machine à 30 °C.",
        installation: "Utiliser une tringle adaptée.",
      },
    });

    expect(mapped.details).toMatchObject({
      recommendedRooms: ["Salon", "Chambre"],
      care: ["Lavage en machine à 30 °C."],
      installationNotes: ["Utiliser une tringle adaptée."],
    });
  });

  it("reads the public product list without an Admin bearer token", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ items: [apiProduct], page: 1, pageSize: 12, total: 1, totalPages: 1 }),
      );
    const repository = new ApiProductRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );

    await expect(
      repository.list({ page: 1, pageSize: 12, sort: "recommended" }),
    ).resolves.toMatchObject({
      items: [{ slug: "rideau-lin", isDemo: false }],
      total: 1,
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/products?page=1&pageSize=12&sort=recommended",
      expect.objectContaining({
        method: "GET",
        headers: expect.not.objectContaining({ authorization: expect.any(String) }),
      }),
    );
  });

  it("serializes the catalogue search query and category counts", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        items: [apiProduct],
        page: 1,
        pageSize: 12,
        total: 1,
        totalPages: 1,
        categoryCounts: { rideaux: 1 },
      }),
    );
    const repository = new ApiProductRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );

    await expect(
      repository.list({ page: 1, pageSize: 12, sort: "recommended", query: "RL-001" }),
    ).resolves.toMatchObject({
      total: 1,
      categoryCounts: { rideaux: 1 },
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/products?q=RL-001&page=1&pageSize=12&sort=recommended",
      expect.anything(),
    );
  });
});
