import { describe, expect, it, vi } from "vitest";
import { HbsApiClient } from "@/api/client";
import { ApiContentRepository, mapPublicHomeContent } from "./ApiContentRepository";
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
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
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
    );
    const repository = new ApiContentRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );

    const content = await repository.getHomePage();

    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/content/home",
      expect.objectContaining({ method: "GET" }),
    );
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
    expect(content.sections.find((section) => section.key === "hero")?.isEnabled).toBe(true);
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
