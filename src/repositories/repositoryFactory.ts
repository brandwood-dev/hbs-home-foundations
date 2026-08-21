import { MockProductRepository } from "@/repositories/mock/MockProductRepository";
import { MockOrderRepository } from "@/repositories/mock/MockOrderRepository";
import { ApiOrderRepository } from "@/repositories/api/ApiOrderRepository";
import { MockContentRepository } from "@/repositories/mock/MockContentRepository";
import { MockNewsletterRepository } from "@/repositories/mock/MockNewsletterRepository";
import { LocalCartRepository } from "@/repositories/local/LocalCartRepository";
import { LocalFavoritesRepository } from "@/repositories/local/LocalFavoritesRepository";
import { LocalSearchHistoryRepository } from "@/repositories/local/LocalSearchHistoryRepository";
import { MockSearchRepository } from "@/repositories/mock/MockSearchRepository";
import { MockMeasurementRulesRepository } from "@/repositories/mock/MockMeasurementRulesRepository";
import { MockCustomQuoteRepository } from "@/repositories/mock/MockCustomQuoteRepository";
import { MockProfessionalLeadRepository } from "@/repositories/mock/MockProfessionalLeadRepository";
import { ApiProductRepository } from "@/repositories/api/ApiProductRepository";
import { ApiCartRepository } from "@/repositories/api/ApiCartRepository";
import { dataProvider } from "@/config/features.config";
import type { ProductRepository } from "@/repositories/interfaces/ProductRepository";
import type { CartRepository } from "@/repositories/interfaces/CartRepository";
import type { OrderRepository } from "@/repositories/interfaces/OrderRepository";
import type { ContentRepository } from "@/repositories/interfaces/ContentRepository";
import type { NewsletterRepository } from "@/repositories/interfaces/NewsletterRepository";
import type { FavoritesRepository } from "@/repositories/interfaces/FavoritesRepository";
import type { SearchRepository } from "@/repositories/interfaces/SearchRepository";
import type { SearchHistoryRepository } from "@/repositories/interfaces/SearchHistoryRepository";
import type { MeasurementRulesRepository } from "@/repositories/interfaces/MeasurementRulesRepository";
import type { CustomQuoteRepository } from "@/repositories/interfaces/CustomQuoteRepository";
import type { ProfessionalLeadRepository } from "@/repositories/interfaces/ProfessionalLeadRepository";

let productRepository: ProductRepository | null = null;
let cartRepository: CartRepository | null = null;
let orderRepository: OrderRepository | null = null;
let contentRepository: ContentRepository | null = null;
let newsletterRepository: NewsletterRepository | null = null;
let favoritesRepository: FavoritesRepository | null = null;
let searchRepository: SearchRepository | null = null;
let searchHistoryRepository: SearchHistoryRepository | null = null;
let measurementRulesRepository: MeasurementRulesRepository | null = null;
let customQuoteRepository: CustomQuoteRepository | null = null;
let professionalLeadRepository: ProfessionalLeadRepository | null = null;

/**
 * Single entry point for data access.
 * Swap the implementation here when the real API is available.
 */
export function getProductRepository(): ProductRepository {
  if (!productRepository) {
    productRepository =
      dataProvider === "api" ? new ApiProductRepository() : new MockProductRepository();
  }
  return productRepository;
}

/** Panier serveur dès que l'URL API est configurée, local uniquement en développement isolé. */
export function getCartRepository(): CartRepository {
  if (!cartRepository) {
    cartRepository =
      dataProvider === "api"
        ? new ApiCartRepository()
        : new LocalCartRepository(getProductRepository());
  }
  return cartRepository;
}

/** Commandes serveur dès que l'API est configurée, mock en développement isolé. */
export function getOrderRepository(): OrderRepository {
  if (!orderRepository) {
    orderRepository =
      dataProvider === "api"
        ? new ApiOrderRepository()
        : new MockOrderRepository(getProductRepository());
  }
  return orderRepository;
}

/** Contenu éditorial : MockContentRepository aujourd'hui, CMS demain. */
export function getContentRepository(): ContentRepository {
  if (!contentRepository) contentRepository = new MockContentRepository();
  return contentRepository;
}

/** Newsletter : MockNewsletterRepository aujourd'hui, ApiNewsletterRepository demain. */
export function getNewsletterRepository(): NewsletterRepository {
  if (!newsletterRepository) newsletterRepository = new MockNewsletterRepository();
  return newsletterRepository;
}

/** Favoris : LocalFavoritesRepository aujourd'hui, ApiFavoritesRepository (compte client) demain. */
export function getFavoritesRepository(): FavoritesRepository {
  if (!favoritesRepository)
    favoritesRepository = new LocalFavoritesRepository(getProductRepository());
  return favoritesRepository;
}

/** Recherche : MockSearchRepository aujourd'hui, ApiSearchRepository demain. */
export function getSearchRepository(): SearchRepository {
  if (!searchRepository) searchRepository = new MockSearchRepository(getProductRepository());
  return searchRepository;
}

/** Historique de recherche : toujours local, jamais côté serveur. */
export function getSearchHistoryRepository(): SearchHistoryRepository {
  if (!searchHistoryRepository) searchHistoryRepository = new LocalSearchHistoryRepository();
  return searchHistoryRepository;
}

/** Règles de mesure : configuration mock aujourd'hui, CMS ou API demain. */
export function getMeasurementRulesRepository(): MeasurementRulesRepository {
  if (!measurementRulesRepository)
    measurementRulesRepository = new MockMeasurementRulesRepository();
  return measurementRulesRepository;
}

/** Demandes sur mesure : mock sans persistance, POST /api/v1/custom-quotes demain. */
export function getCustomQuoteRepository(): CustomQuoteRepository {
  if (!customQuoteRepository) customQuoteRepository = new MockCustomQuoteRepository();
  return customQuoteRepository;
}

/** Prospects professionnels : mock sans persistance, POST /api/v1/professional-leads demain. */
export function getProfessionalLeadRepository(): ProfessionalLeadRepository {
  if (!professionalLeadRepository)
    professionalLeadRepository = new MockProfessionalLeadRepository();
  return professionalLeadRepository;
}
