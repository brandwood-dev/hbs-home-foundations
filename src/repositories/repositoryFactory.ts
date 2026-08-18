import { MockProductRepository } from "@/repositories/mock/MockProductRepository";
import { MockOrderRepository } from "@/repositories/mock/MockOrderRepository";
import { MockContentRepository } from "@/repositories/mock/MockContentRepository";
import { MockNewsletterRepository } from "@/repositories/mock/MockNewsletterRepository";
import { LocalCartRepository } from "@/repositories/local/LocalCartRepository";
import { LocalFavoritesRepository } from "@/repositories/local/LocalFavoritesRepository";
import { LocalSearchHistoryRepository } from "@/repositories/local/LocalSearchHistoryRepository";
import { MockSearchRepository } from "@/repositories/mock/MockSearchRepository";
import type { ProductRepository } from "@/repositories/interfaces/ProductRepository";
import type { CartRepository } from "@/repositories/interfaces/CartRepository";
import type { OrderRepository } from "@/repositories/interfaces/OrderRepository";
import type { ContentRepository } from "@/repositories/interfaces/ContentRepository";
import type { NewsletterRepository } from "@/repositories/interfaces/NewsletterRepository";
import type { FavoritesRepository } from "@/repositories/interfaces/FavoritesRepository";
import type { SearchRepository } from "@/repositories/interfaces/SearchRepository";
import type { SearchHistoryRepository } from "@/repositories/interfaces/SearchHistoryRepository";

let productRepository: ProductRepository | null = null;
let cartRepository: CartRepository | null = null;
let orderRepository: OrderRepository | null = null;
let contentRepository: ContentRepository | null = null;
let newsletterRepository: NewsletterRepository | null = null;
let favoritesRepository: FavoritesRepository | null = null;
let searchRepository: SearchRepository | null = null;
let searchHistoryRepository: SearchHistoryRepository | null = null;

/**
 * Single entry point for data access.
 * Swap the implementation here when the real API is available.
 */
export function getProductRepository(): ProductRepository {
  if (!productRepository) productRepository = new MockProductRepository();
  return productRepository;
}

/** Panier : LocalCartRepository aujourd'hui, ApiCartRepository demain. */
export function getCartRepository(): CartRepository {
  if (!cartRepository) cartRepository = new LocalCartRepository(getProductRepository());
  return cartRepository;
}

/** Commandes : MockOrderRepository aujourd'hui, ApiOrderRepository demain. */
export function getOrderRepository(): OrderRepository {
  if (!orderRepository) orderRepository = new MockOrderRepository(getProductRepository());
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
