import type { HomePageContent } from "@/domain/content/home-content.types";
import type { EditorialPage } from "@/domain/content/editorial-page.types";
import type { ContentRepository } from "@/repositories/interfaces/ContentRepository";
import { adviceArticles } from "@/fixtures/advice.fixture";
import {
  accessoriesEditorial,
  composeWindow,
  customProfessional,
  featuredCollections,
  homeHero,
  homeSections,
  materialFocus,
  measurementGuide,
  newsletterContent,
  productSelection,
  promoBanner,
  shopByNeed,
  shopTheLook,
  socialContent,
  testimonials,
  trustItems,
} from "@/fixtures/home.fixture";

/** Contenu éditorial statique — même contrat que le futur CMS. */
export class MockContentRepository implements ContentRepository {
  async getHomePage(): Promise<HomePageContent> {
    return {
      sections: homeSections,
      hero: homeHero,
      promoBanner,
      trustItems,
      collections: featuredCollections,
      productSelection,
      shopByNeed,
      materialFocus,
      composeWindow,
      measurementGuide,
      shopTheLook,
      accessories: accessoriesEditorial,
      customProfessional,
      testimonials,
      adviceArticles,
      social: socialContent,
      newsletter: newsletterContent,
    };
  }

  async getEditorialPage(slug: string): Promise<EditorialPage | null> {
    const titles: Record<string, string> = {
      "a-propos": "À propos",
      cgv: "Conditions générales de vente",
      confidentialite: "Politique de confidentialité",
      contact: "Contact",
      cookies: "Politique de cookies",
      faq: "FAQ",
      inspirations: "Inspirations",
      "livraison-et-retours": "Livraison et retours",
      "mentions-legales": "Mentions légales",
    };
    const title = titles[slug];
    if (!title) return null;
    const now = new Date(0).toISOString();
    return {
      slug,
      title,
      body: "Contenu éditorial de démonstration.",
      seoTitle: `${title} — HBS HOME`,
      seoDescription: `${title} — HBS HOME, rideaux, voilages et décoration textile en Tunisie.`,
      version: 1,
      publishedAt: now,
      updatedAt: now,
      blocks: [
        {
          sortOrder: 0,
          blockType: "rich_text",
          payload: { body: "Contenu éditorial de démonstration." },
          media: null,
        },
      ],
    };
  }
}
