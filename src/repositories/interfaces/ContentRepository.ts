import type { HomePageContent } from "@/domain/content/home-content.types";

export interface ContentRepository {
  /** Contenu complet de la page d'accueil — futur `GET /api/v1/content/home`. */
  getHomePage(): Promise<HomePageContent>;
}
