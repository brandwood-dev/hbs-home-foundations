import type { Product } from "@/domain/product/product.types";
import type { PopularSearch } from "@/domain/search/search.types";
import { normalizeSearchQuery } from "@/services/search/normalize-search-query";

export const POPULAR_SEARCHES_LIMIT = 8;

const POPULAR_SEARCH_LABEL_MAX_LENGTH = 34;

function displayLabel(name: string): string {
  const normalized = name.trim().replace(/\s+/g, " ");
  if (normalized.length <= POPULAR_SEARCH_LABEL_MAX_LENGTH) return normalized;
  return `${normalized.slice(0, POPULAR_SEARCH_LABEL_MAX_LENGTH - 1).trimEnd()}…`;
}

/**
 * Builds search chips from products returned by the public catalogue API.
 * The API only exposes published products, so each generated query points to
 * a product that can be found by the same search index.
 */
export function buildPopularSearches(
  products: readonly Pick<Product, "name">[],
  limit = POPULAR_SEARCHES_LIMIT,
): PopularSearch[] {
  if (limit <= 0) return [];

  const seen = new Set<string>();
  const result: PopularSearch[] = [];

  for (const product of products) {
    const query = product.name.trim().replace(/\s+/g, " ");
    const normalizedQuery = normalizeSearchQuery(query);
    if (!normalizedQuery || seen.has(normalizedQuery)) continue;
    seen.add(normalizedQuery);
    result.push({ label: displayLabel(query), query });
    if (result.length >= limit) break;
  }

  return result;
}
