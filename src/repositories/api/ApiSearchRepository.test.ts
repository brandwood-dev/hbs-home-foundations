import { describe, expect, it, vi } from "vitest";
import { HbsApiClient } from "@/api/client";
import { ApiSearchRepository } from "./ApiSearchRepository";

const product = {
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
  variants: [],
  colors: [],
  details: {},
  seo: { title: "Rideau lin", description: "Rideau en lin." },
  isThermal: false,
  isNew: false,
  isBestSeller: false,
  isFeatured: false,
  createdAt: "2026-08-21T00:00:00.000Z",
  recommendationScore: 0,
  isDemo: false,
};

describe("API-backed catalogue search", () => {
  it("returns API products and does not fall back to fixture products", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json({
          items: [product],
          page: 1,
          pageSize: 12,
          total: 1,
          totalPages: 1,
          categoryCounts: { rideaux: 1 },
        }),
      )
      .mockResolvedValueOnce(
        Response.json({ items: [], page: 1, pageSize: 4, total: 0, totalPages: 0 }),
      );
    const repository = new ApiSearchRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );

    const results = await repository.search({
      query: "lin",
      sort: "relevance",
      page: 1,
      pageSize: 12,
    });

    expect(results.products).toHaveLength(1);
    expect(results.products[0]?.product.name).toBe("Rideau lin");
    expect(results.categoryCounts).toEqual({ rideaux: 1 });
    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/products?q=lin&page=1&pageSize=12&sort=recommended",
      expect.anything(),
    );
  });
});
