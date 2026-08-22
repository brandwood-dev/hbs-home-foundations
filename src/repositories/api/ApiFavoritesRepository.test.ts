import { describe, expect, it, vi } from "vitest";
import { HbsApiClient } from "@/api/client";
import { ApiFavoritesRepository } from "@/repositories/api/ApiFavoritesRepository";

const product = {
  id: "product-1",
  slug: "rideau-lin",
  name: "Rideau lin naturel",
  reference: "RL-001",
  category: "rideaux",
  material: "lin",
  sellingMode: "ready_made",
  isLargeWidth: false,
  shortDescription: "Rideau",
  longDescription: "Rideau",
  imageAlt: "Rideau",
  images: [],
  variants: [],
  colors: [],
  details: {},
  seo: { title: "Rideau", description: "Rideau" },
  isThermal: false,
  isNew: false,
  isBestSeller: false,
  isFeatured: false,
  createdAt: "2026-08-22T00:00:00.000Z",
  recommendationScore: 0,
  isDemo: false,
};

function response(count = 0) {
  return Response.json({
    items:
      count > 0
        ? [
            {
              productId: "product-1",
              addedAt: "2026-08-22T00:00:00.000Z",
              product,
              isAvailable: true,
            },
          ]
        : [],
    removedProductIds: [],
    count,
  });
}

describe("ApiFavoritesRepository", () => {
  it("uses the guest favorites contract and maps the resolved product", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response())
      .mockResolvedValueOnce(response(1))
      .mockResolvedValueOnce(response(0))
      .mockResolvedValueOnce(response(0));
    const repository = new ApiFavoritesRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );

    await expect(repository.get()).resolves.toMatchObject({ count: 0 });
    await expect(repository.add("product-1")).resolves.toMatchObject({
      count: 1,
      items: [{ product: { slug: "rideau-lin" } }],
    });
    await expect(repository.remove("product-1")).resolves.toMatchObject({ count: 0 });
    await expect(repository.clear()).resolves.toMatchObject({ count: 0 });

    expect(
      fetchImplementation.mock.calls.map(([input, init]) => [String(input), init?.method]),
    ).toEqual([
      ["https://api.example.test/api/v1/favorites", "GET"],
      ["https://api.example.test/api/v1/favorites/items", "POST"],
      ["https://api.example.test/api/v1/favorites/items/product-1", "DELETE"],
      ["https://api.example.test/api/v1/favorites", "DELETE"],
    ]);
  });
});
