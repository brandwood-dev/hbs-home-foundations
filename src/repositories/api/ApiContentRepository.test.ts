import { describe, expect, it, vi } from "vitest";
import { HbsApiClient } from "@/api/client";
import {
  ApiContentRepository,
  mapPublicCategoryCollections,
  mapPublicHomeContent,
} from "./ApiContentRepository";
import { MockContentRepository } from "@/repositories/mock/MockContentRepository";

const page = {
  slug: "a-propos",
  title: "À propos",
  body: "Notre histoire.",
  seoTitle: "À propos | HBS HOME",
  seoDescription: "Découvrez HBS HOME.",
  version: 2,
  publishedAt: "2026-08-23T00:00:00.000Z",
  updatedAt: "2026-08-23T00:00:00.000Z",
  blocks: [
    {
      sortOrder: 0,
      blockType: "hero",
      payload: { heading: "Notre histoire" },
      media: null,
    },
  ],
};

describe("ApiContentRepository", () => {
  it("loads and maps the published homepage sections", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json({
          version: 3,
          publishedAt: "2026-08-23T00:00:00.000Z",
          sections: [
            {
              sectionKey: "hero",
              sortOrder: 0,
              isEnabled: true,
              payload: {
                eyebrow: "Édition été",
                title: "Un intérieur lumineux",
                description: "Une sélection pensée pour la saison.",
                primaryCtaLabel: "Découvrir",
                primaryCtaHref: "/nouveautes",
                secondaryCtaLabel: "Nous contacter",
                secondaryCtaHref: "/contact",
              },
              media: { publicUrl: "https://cdn.example.test/hero.webp", alt: "Salon lumineux" },
              mobileMedia: {
                publicUrl: "https://cdn.example.test/hero-mobile.webp",
                alt: "Salon lumineux sur mobile",
              },
              hotspots: [],
            },
            {
              sectionKey: "promo_banner",
              sortOrder: 1,
              isEnabled: true,
              payload: { label: "Nouveauté", text: "Livraison offerte", href: "/promotions" },
              media: null,
              mobileMedia: null,
              hotspots: [],
            },
            {
              sectionKey: "shop_the_look",
              sortOrder: 2,
              isEnabled: true,
              payload: { title: "La sélection du moment", description: "Associez vos pièces." },
              media: { publicUrl: "https://cdn.example.test/look.webp", alt: "Ambiance HBS HOME" },
              mobileMedia: null,
              hotspots: [
                {
                  productId: "product-1",
                  xPercent: 25,
                  yPercent: 40,
                  label: null,
                  sortOrder: 0,
                  product: { id: "product-1", slug: "rideau-lin", name: "Rideau lin" },
                },
              ],
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          items: [
            {
              id: "article-1",
              slug: "conseil-1",
              title: "Conseil",
              excerpt: "Conseil maison",
              category: {
                id: "category-1",
                slug: "conseils",
                name: "Conseils",
                description: "",
                sortOrder: 0,
              },
              cover: null,
              readingTimeMinutes: 3,
              authorName: "HBS HOME",
              publishedAt: "2026-08-23T00:00:00.000Z",
              updatedAt: "2026-08-23T00:00:00.000Z",
              isFeatured: false,
            },
          ],
          page: 1,
          pageSize: 3,
          total: 1,
          totalPages: 1,
        }),
      );
    const repository = new ApiContentRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );

    const content = await repository.getHomePage();

    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/content/home",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchImplementation).toHaveBeenCalledTimes(2);
    expect(content.hero.title).toBe("Un intérieur lumineux");
    expect(content.hero.image.src).toBe("https://cdn.example.test/hero.webp");
    expect(content.hero.mobileImage?.src).toBe("https://cdn.example.test/hero-mobile.webp");
    expect(content.promoBanner).toMatchObject({
      isEnabled: true,
      label: "Nouveauté",
      text: "Livraison offerte",
    });
    expect(content.shopTheLook.hotspots[0]).toMatchObject({
      productId: "product-1",
      title: "Rideau lin",
      href: "/produit/rideau-lin",
    });
    expect(content.collections).toEqual(
      (await new MockContentRepository().getHomePage()).collections,
    );
    expect(content.sections.find((section) => section.key === "hero")?.isEnabled).toBe(true);
  });

  it("maps only image-backed root categories to homepage collections", async () => {
    const mapped = mapPublicCategoryCollections([
      {
        slug: "rideaux",
        name: "Rideaux",
        description: "  Une description  ",
        parentSlug: null,
        path: "/rideaux",
        imageUrl: "https://cdn.example.test/rideaux.webp",
        seoTitle: null,
        seoDescription: null,
        attributes: [],
        children: [
          {
            slug: "velours",
            name: "Velours",
            description: null,
            parentSlug: "rideaux",
            path: "/rideaux/velours",
            imageUrl: "https://cdn.example.test/velours.webp",
            seoTitle: null,
            seoDescription: null,
            attributes: [],
            children: [],
          },
        ],
      },
      {
        slug: "sans-image",
        name: "Sans image",
        description: null,
        parentSlug: null,
        path: "/sans-image",
        imageUrl: null,
        seoTitle: null,
        seoDescription: null,
        attributes: [],
        children: [],
      },
    ]);

    expect(mapped).toEqual([
      {
        id: "rideaux",
        title: "Rideaux",
        description: "Une description",
        href: "/rideaux",
        image: {
          src: "https://cdn.example.test/rideaux.webp",
          alt: "Rideaux",
        },
      },
    ]);
  });

  it("keeps the fixture homepage until the first publication", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 404 }));
    const repository = new ApiContentRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );
    const fallback = await new MockContentRepository().getHomePage();

    await expect(repository.getHomePage()).resolves.toEqual(fallback);
  });

  it("keeps managed fixtures before the first homepage publication", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 404 }));
    const repository = new ApiContentRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );

    const content = await repository.getHomePage();

    expect(content.hero.title).toBe("Des rideaux qui transforment votre intérieur");
    expect(content.collections).toEqual(
      (await new MockContentRepository().getHomePage()).collections,
    );
  });

  it("disables managed sections omitted from a published snapshot", async () => {
    const fallback = await new MockContentRepository().getHomePage();
    const mapped = mapPublicHomeContent(
      {
        version: 1,
        publishedAt: "2026-08-23T00:00:00.000Z",
        sections: [
          {
            sectionKey: "promo_banner",
            sortOrder: 0,
            isEnabled: true,
            payload: { text: "Annonce" },
            media: null,
            mobileMedia: null,
            hotspots: [],
          },
        ],
      },
      fallback,
    );

    expect(mapped.promoBanner.isEnabled).toBe(true);
    expect(mapped.sections.find((section) => section.key === "hero")?.isEnabled).toBe(false);
    expect(mapped.sections.find((section) => section.key === "shop_the_look")?.isEnabled).toBe(
      false,
    );
  });

  it("loads a published page without adding a frontend fixture", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(Response.json(page));
    const repository = new ApiContentRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );

    await expect(repository.getEditorialPage("a-propos")).resolves.toEqual(page);
    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/content/pages/a-propos",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("maps an unpublished page to null", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 404 }));
    const repository = new ApiContentRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );

    await expect(repository.getEditorialPage("a-propos")).resolves.toBeNull();
  });
});
