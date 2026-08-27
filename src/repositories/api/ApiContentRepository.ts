import type { EditorialPage } from "@/domain/content/editorial-page.types";
import type {
  Article,
  ArticleBlock,
  ArticleList,
  ArticleListParams,
  ArticleSummary,
} from "@/domain/content/article.types";
import type {
  HomePageContent,
  HomeSectionConfig,
  HomeImage,
  AdviceArticlePreview,
} from "@/domain/content/home-content.types";
import { HbsApiClient, HbsApiError } from "@/api/client";
import type { components } from "@/api/generated/hbs-home-api";
import type { ContentRepository } from "@/repositories/interfaces/ContentRepository";
import { MockContentRepository } from "@/repositories/mock/MockContentRepository";
import type { PublicCategory } from "@/repositories/interfaces/CategoryRepository";

type ApiEditorialPage = EditorialPage;
type ApiPublicHomeContent = components["schemas"]["PublicHomeContent"];
type ApiPublicHomeSection = ApiPublicHomeContent["sections"][number];
type ApiPublicHomeMedia = NonNullable<ApiPublicHomeSection["media"]>;
type ApiArticleSummary = components["schemas"]["PublicArticleSummary"];
type ApiArticle = components["schemas"]["PublicArticle"];
type ApiArticleList = components["schemas"]["PublicArticleList"];

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function mediaImage(media: ApiPublicHomeMedia | null, fallback: HomeImage): HomeImage {
  if (!media) return fallback;
  return {
    src: asString(media.publicUrl, fallback.src),
    alt: asString(media.alt, fallback.alt),
  };
}

function sectionFor(
  content: ApiPublicHomeContent,
  key: ApiPublicHomeSection["sectionKey"],
): ApiPublicHomeSection | undefined {
  return content.sections.find((section) => section.sectionKey === key);
}

function setManagedSectionVisibility(
  sections: HomeSectionConfig[],
  key: "hero" | "shop_the_look",
  enabled: boolean,
): HomeSectionConfig[] {
  return sections.map((section) =>
    section.key === key ? { ...section, isEnabled: enabled } : section,
  );
}

function mapArticleSummary(article: ApiArticleSummary): ArticleSummary {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    cover: article.cover
      ? {
          publicUrl: article.cover.publicUrl,
          alt: article.cover.alt,
          width: article.cover.width,
          height: article.cover.height,
        }
      : null,
    readingTimeMinutes: article.readingTimeMinutes,
    authorName: article.authorName,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    isFeatured: article.isFeatured,
  };
}

function mapArticle(article: ApiArticle): Article {
  return {
    ...mapArticleSummary(article),
    bodyBlocks: article.bodyBlocks as ArticleBlock[],
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
  };
}

/**
 * Build homepage collection cards from the public category tree.
 *
 * Collections intentionally use active root categories only. A category without
 * an image is omitted until Admin provides one, so the public page never emits
 * a broken image URL or silently reuses a fixture image.
 */
export function mapPublicCategoryCollections(
  categories: readonly PublicCategory[],
): HomePageContent["collections"] {
  return categories
    .filter((category) => category.parentSlug === null && category.imageUrl)
    .map((category) => ({
      id: category.slug,
      title: category.name,
      description: category.description?.trim() ?? "",
      href: category.path,
      image: {
        src: category.imageUrl!,
        alt: category.name,
      },
    }));
}

/**
 * Merge the public API snapshot into the homepage-managed content.
 *
 * Catalogue-backed collections are overlaid by HomePage from the shared
 * navigation query. Keeping this merge focused on managed content prevents
 * internal revision/media identifiers from leaking into the public domain
 * model and avoids a second catalogue request here.
 */
export function mapPublicHomeContent(
  apiContent: ApiPublicHomeContent,
  fallback: HomePageContent,
  adviceArticles: AdviceArticlePreview[] = fallback.adviceArticles,
): HomePageContent {
  const heroSection = sectionFor(apiContent, "hero");
  const promoSection = sectionFor(apiContent, "promo_banner");
  const shopTheLookSection = sectionFor(apiContent, "shop_the_look");

  const heroPayload = asRecord(heroSection?.payload);
  const promoPayload = asRecord(promoSection?.payload);
  const shopPayload = asRecord(shopTheLookSection?.payload);

  const heroImage = mediaImage(heroSection?.media ?? null, fallback.hero.image);
  const mobileImage = heroSection?.mobileMedia
    ? mediaImage(heroSection.mobileMedia, fallback.hero.mobileImage ?? fallback.hero.image)
    : fallback.hero.mobileImage;

  const hero = {
    ...fallback.hero,
    tagline: asString(heroPayload["eyebrow"], fallback.hero.tagline),
    title: asString(heroPayload["title"], fallback.hero.title),
    text: asString(heroPayload["description"], fallback.hero.text),
    primaryCta: {
      label: asString(heroPayload["primaryCtaLabel"], fallback.hero.primaryCta.label),
      href: asString(heroPayload["primaryCtaHref"], fallback.hero.primaryCta.href),
    },
    secondaryCta: {
      label: asString(heroPayload["secondaryCtaLabel"], fallback.hero.secondaryCta.label),
      href: asString(heroPayload["secondaryCtaHref"], fallback.hero.secondaryCta.href),
    },
    image: heroImage,
    ...(mobileImage ? { mobileImage } : {}),
  };

  const promoBanner = {
    ...fallback.promoBanner,
    isEnabled: promoSection !== undefined,
    label: asString(promoPayload["label"], fallback.promoBanner.label ?? ""),
    text: asString(promoPayload["text"], fallback.promoBanner.text),
    href: asString(promoPayload["href"], fallback.promoBanner.href ?? ""),
  };

  const shopTheLook = {
    ...fallback.shopTheLook,
    title: asString(shopPayload["title"], fallback.shopTheLook.title),
    subtitle: asString(shopPayload["description"], fallback.shopTheLook.subtitle),
    image: mediaImage(shopTheLookSection?.media ?? null, fallback.shopTheLook.image),
    hotspots:
      shopTheLookSection?.hotspots
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((hotspot, index) => {
          const title = hotspot.label ?? hotspot.product?.name;
          return {
            id: `${hotspot.productId}-${hotspot.sortOrder}-${index}`,
            xPercent: hotspot.xPercent,
            yPercent: hotspot.yPercent,
            productId: hotspot.productId,
            ...(title ? { title } : {}),
            ...(hotspot.product?.slug
              ? { href: `/produit/${encodeURIComponent(hotspot.product.slug)}` }
              : {}),
          };
        }) ?? [],
  };

  return {
    ...fallback,
    hero,
    promoBanner,
    shopTheLook,
    adviceArticles,
    sections: setManagedSectionVisibility(
      setManagedSectionVisibility(fallback.sections, "hero", heroSection !== undefined),
      "shop_the_look",
      shopTheLookSection !== undefined,
    ),
  };
}

/** Public content reads. Drafts, archived pages and internal identifiers stay server-side. */
export class ApiContentRepository implements ContentRepository {
  private readonly fallback = new MockContentRepository();

  constructor(private readonly client = new HbsApiClient()) {}

  async getHomePage(): Promise<HomePageContent> {
    const fallback = await this.fallback.getHomePage();
    let content: ApiPublicHomeContent | null = null;
    try {
      content = await this.client.get<ApiPublicHomeContent>("/api/v1/content/home");
    } catch (error) {
      // Before the first Admin publication the public API deliberately returns
      // 404. Keep the managed sections on fixtures until content is published;
      // the homepage overlays catalogue-backed collections from its shared
      // navigation query. Real API failures remain visible instead of silently
      // masking incidents.
      if (!(error instanceof HbsApiError && error.status === 404)) throw error;
    }
    if (content === null) {
      return fallback;
    }

    let articles: ArticleList;
    try {
      articles = await this.listArticles({ featured: true, pageSize: 3 });
    } catch (error) {
      if (error instanceof HbsApiError && error.status === 404) {
        articles = { items: [], page: 1, pageSize: 3, total: 0, totalPages: 0 };
      } else {
        throw error;
      }
    }
    if (articles.items.length === 0) {
      try {
        // A newly published article should be eligible for the Magazine even
        // before an Admin explicitly marks it as featured.
        articles = await this.listArticles({ pageSize: 3 });
      } catch (error) {
        if (error instanceof HbsApiError && error.status === 404) {
          articles = { items: [], page: 1, pageSize: 3, total: 0, totalPages: 0 };
        } else {
          throw error;
        }
      }
    }
    const adviceArticles = articles.items
      .filter((article) => article.cover !== null)
      .map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category.name,
        readingTimeMinutes: article.readingTimeMinutes,
        image: { src: article.cover!.publicUrl, alt: article.cover!.alt },
      }));
    return mapPublicHomeContent(content, fallback, adviceArticles);
  }

  async getEditorialPage(slug: string): Promise<EditorialPage | null> {
    try {
      return await this.client.get<ApiEditorialPage>(
        `/api/v1/content/pages/${encodeURIComponent(slug)}`,
      );
    } catch (error) {
      if (error instanceof HbsApiError && error.status === 404) return null;
      throw error;
    }
  }

  async listArticles(params: ArticleListParams = {}): Promise<ArticleList> {
    const query = new URLSearchParams();
    query.set("page", String(params.page ?? 1));
    query.set("pageSize", String(params.pageSize ?? 12));
    if (params.category) query.set("category", params.category);
    if (params.query) query.set("q", params.query);
    if (params.featured !== undefined) query.set("featured", String(params.featured));
    const response = await this.client.get<ApiArticleList>(
      `/api/v1/content/articles?${query.toString()}`,
    );
    return {
      items: response.items.map(mapArticleSummary),
      page: response.page,
      pageSize: response.pageSize,
      total: response.total,
      totalPages: response.totalPages,
    };
  }

  async getArticle(slug: string): Promise<Article | null> {
    try {
      return mapArticle(
        await this.client.get<ApiArticle>(`/api/v1/content/articles/${encodeURIComponent(slug)}`),
      );
    } catch (error) {
      if (error instanceof HbsApiError && error.status === 404) return null;
      throw error;
    }
  }
}
