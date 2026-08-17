import type { HomePageContent } from "@/domain/content/home-content.types";
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
}
