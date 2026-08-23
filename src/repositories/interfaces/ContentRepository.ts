import type { HomePageContent } from "@/domain/content/home-content.types";
import type { EditorialPage } from "@/domain/content/editorial-page.types";

export interface ContentRepository {
  /** Contenu complet de la page d'accueil — futur `GET /api/v1/content/home`. */
  getHomePage(): Promise<HomePageContent>;
  /** Page publiée administrée dans le CMS éditorial. */
  getEditorialPage(slug: string): Promise<EditorialPage | null>;
}
