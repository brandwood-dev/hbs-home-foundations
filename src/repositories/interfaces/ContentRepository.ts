import type { HomePageContent } from "@/domain/content/home-content.types";
import type { EditorialPage } from "@/domain/content/editorial-page.types";
import type { Article, ArticleList, ArticleListParams } from "@/domain/content/article.types";

export interface ContentRepository {
  /** Contenu complet de la page d'accueil — futur `GET /api/v1/content/home`. */
  getHomePage(): Promise<HomePageContent>;
  /** Page publiée administrée dans le CMS éditorial. */
  getEditorialPage(slug: string): Promise<EditorialPage | null>;
  listArticles(params?: ArticleListParams): Promise<ArticleList>;
  getArticle(slug: string): Promise<Article | null>;
}
