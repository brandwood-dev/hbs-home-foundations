import type { HomePageContent } from "@/domain/content/home-content.types";
import type { EditorialPage } from "@/domain/content/editorial-page.types";
import type { Article, ArticleList, ArticleListParams } from "@/domain/content/article.types";
import type { ContentRepository } from "@/repositories/interfaces/ContentRepository";
import { adviceArticles } from "@/fixtures/advice.fixture";
import { getEditorialPageFixture } from "@/fixtures/editorial-pages.fixture";
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
    const fixture = getEditorialPageFixture(slug);
    if (fixture) return fixture;

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

  async listArticles(params: ArticleListParams = {}): Promise<ArticleList> {
    const all = adviceArticles.map(articleFromFixture);
    const query = params.query?.trim().toLocaleLowerCase("fr");
    const filtered = all.filter((article) => {
      if (params.category && article.category.slug !== params.category) return false;
      if (params.featured !== undefined && article.isFeatured !== params.featured) return false;
      if (
        query &&
        !`${article.title} ${article.excerpt} ${article.category.name}`
          .toLocaleLowerCase("fr")
          .includes(query)
      )
        return false;
      return true;
    });
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, Math.min(24, params.pageSize ?? 12));
    const total = filtered.length;
    return {
      items: filtered
        .slice((page - 1) * pageSize, page * pageSize)
        .map(
          ({
            bodyBlocks: _bodyBlocks,
            seoTitle: _seoTitle,
            seoDescription: _seoDescription,
            ...summary
          }) => summary,
        ),
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    };
  }

  async getArticle(slug: string): Promise<Article | null> {
    return adviceArticles.map(articleFromFixture).find((article) => article.slug === slug) ?? null;
  }
}

function articleFromFixture(article: (typeof adviceArticles)[number]): Article {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: {
      id: article.category.toLocaleLowerCase("fr"),
      slug: article.category.toLocaleLowerCase("fr"),
      name: article.category,
      description: "",
      sortOrder: 0,
    },
    cover: { publicUrl: article.image.src, alt: article.image.alt, width: 800, height: 600 },
    readingTimeMinutes: article.readingTimeMinutes,
    authorName: "HBS HOME",
    publishedAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    isFeatured: true,
    bodyBlocks: [{ type: "paragraph", text: article.excerpt }],
    seoTitle: `${article.title} — HBS HOME`,
    seoDescription: article.excerpt,
  };
}
