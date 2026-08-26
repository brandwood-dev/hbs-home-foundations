import { describe, expect, it, vi } from "vitest";
import type { components } from "@/api/generated/hbs-home-api";
import { HbsApiClient } from "@/api";
import {
  AdminCatalogApi,
  ApiAdminProductRepository,
  mapAttribute,
  mapCategory,
  mapProduct,
} from "./admin-catalog-api-repositories";

const product = {
  id: "product-1",
  slug: "rideau-lin",
  name: "Rideau lin",
  reference: "RL-001",
  shortDescription: "Description courte",
  longDescription: null,
  imageAlt: null,
  status: "active",
  categoryId: "category-1",
  categorySlug: "rideaux",
  material: "Lin",
  sellingMode: "ready_made",
  isPublished: true,
  publishedAt: "2026-08-21T00:00:00.000Z",
  archivedAt: null,
  version: 2,
  isDemo: false,
  attributes: {},
  media: [
    {
      id: "media-1",
      productId: "product-1",
      variantId: null,
      storagePath: "products/rideau-lin/media-1.jpg",
      publicUrl: "https://cdn.example.test/media-1.jpg",
      alt: "Rideau en lin",
      mediaType: "front",
      status: "active",
      isPrimary: true,
      sortOrder: 0,
      createdAt: "2026-08-21T00:00:00.000Z",
      updatedAt: "2026-08-21T00:00:00.000Z",
    },
  ],
  variants: [
    {
      id: "variant-1",
      productId: "product-1",
      sku: "RL-001-140",
      title: "140 x 250 cm",
      priceAmountMinor: 129000,
      compareAtPriceAmountMinor: null,
      currency: "TND",
      status: "active",
      options: { colorId: "beige", widthCm: 140, heightCm: 250 },
      payload: { stock: 4, lowStockThreshold: 3 },
      isDefault: true,
      sortOrder: 0,
      createdAt: "2026-08-21T00:00:00.000Z",
      updatedAt: "2026-08-21T00:00:00.000Z",
    },
  ],
  createdAt: "2026-08-21T00:00:00.000Z",
  updatedAt: "2026-08-21T00:00:00.000Z",
} as components["schemas"]["AdminProduct"];

describe("Admin catalog API adapters", () => {
  it("maps API products into the existing Admin form model", () => {
    const mapped = mapProduct(product);

    expect(mapped).toMatchObject({
      id: "product-1",
      status: "published",
      category: "rideaux",
      tags: [],
      rooms: [],
    });
    expect(mapped.variants[0]).toMatchObject({
      sku: "RL-001-140",
      colorId: "beige",
      widthCm: 140,
      heightCm: 250,
      stock: 4,
    });
    expect(mapped.imageAssets).toMatchObject([
      { url: "https://cdn.example.test/media-1.jpg", alt: "Rideau en lin", isPrimary: true },
    ]);
  });

  it("preserves category and attribute semantics used by the Admin screens", () => {
    expect(
      mapCategory({
        id: "category-1",
        slug: "rideaux",
        name: "Rideaux",
        description: null,
        parentId: null,
        status: "active",
        sortOrder: 1,
        imageUrl: "https://cdn.example.test/category.jpg",
        imageMediaAssetId: null,
        seoTitle: "Rideaux",
        seoDescription: "Rideaux HBS HOME",
        showInNavigation: true,
        createdAt: "2026-08-21T00:00:00.000Z",
        updatedAt: "2026-08-21T00:00:00.000Z",
      }),
    ).toMatchObject({
      id: "category-1",
      isActive: true,
      order: 1,
      imageUrl: "https://cdn.example.test/category.jpg",
      showInNavigation: true,
    });

    expect(
      mapAttribute({
        id: "attribute-1",
        key: "color",
        name: "Couleur",
        valueType: "select",
        isFilterable: true,
        isRequired: false,
        status: "active",
        isVariantAxis: true,
        sortOrder: 2,
        isSystem: false,
        categorySlugs: ["rideaux"],
        options: [
          {
            id: "value-1",
            value: "beige",
            label: "Beige",
            sortOrder: 1,
            hex: "#d8c4a8",
            family: "neutres",
            isActive: true,
          },
        ],
        createdAt: "2026-08-21T00:00:00.000Z",
        updatedAt: "2026-08-21T00:00:00.000Z",
      }),
    ).toMatchObject({
      fieldType: "select",
      isVariantAxis: true,
      order: 2,
      categories: ["rideaux"],
      values: [{ slug: "beige", label: "Beige" }],
    });
  });

  it("uses the authenticated API route for the Admin product list", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ items: [product], total: 1, limit: 100, offset: 0 }));
    const api = new AdminCatalogApi(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
      async () => "admin-token",
    );
    const repository = new ApiAdminProductRepository(api);

    await expect(repository.list()).resolves.toHaveLength(1);
    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/admin/products?limit=100&offset=0",
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: "Bearer admin-token" }),
      }),
    );
  });

  it("does not rewrite unchanged variants when saving product media", async () => {
    const mapped = mapProduct(product);
    let productReads = 0;
    const fetchImplementation = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (method === "GET") {
        productReads += 1;
        return Response.json(productReads === 1 ? product : { ...product, version: 3 });
      }
      if (method === "PATCH" && url.endsWith("/api/v1/admin/products/product-1")) {
        return Response.json({ ...product, version: 3 });
      }
      throw new Error(`Unexpected request: ${method} ${url}`);
    });
    const api = new AdminCatalogApi(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
      async () => "admin-token",
    );
    const repository = new ApiAdminProductRepository(api);

    await repository.update("product-1", {
      images: mapped.images,
      imageAssets: mapped.imageAssets ?? [],
      variants: mapped.variants,
    });

    expect(
      fetchImplementation.mock.calls.map(
        ([input, init]) => `${init?.method ?? "GET"} ${String(input)}`,
      ),
    ).toEqual([
      "GET https://api.example.test/api/v1/admin/products/product-1",
      "PATCH https://api.example.test/api/v1/admin/products/product-1",
      "GET https://api.example.test/api/v1/admin/products/product-1",
    ]);
  });
});
