import { z } from "zod";
import { CATEGORY_LABELS } from "@/domain/product/product.constants";
import type { ProductCategory } from "@/domain/product/product.types";
import { SEARCH_PAGE_SIZE, SEARCH_SORT_VALUES } from "@/domain/search/search.constants";
import type { GlobalSearchParams, SearchSort } from "@/domain/search/search.types";

/** Schéma d'URL de /recherche — valeurs libres puis normalisées côté composant. */
export const searchPageSchema = z.object({
  q: z.string().catch("").default(""),
  category: z.string().optional().catch(undefined),
  sort: z.string().catch("relevance").default("relevance"),
  page: z.coerce.number().int().catch(1).default(1),
});

export type SearchPageSearch = z.infer<typeof searchPageSchema>;

const CATEGORY_VALUES = Object.keys(CATEGORY_LABELS) as ProductCategory[];

export function normalizeCategory(value: string | undefined): ProductCategory | undefined {
  return value && CATEGORY_VALUES.includes(value as ProductCategory)
    ? (value as ProductCategory)
    : undefined;
}

export function normalizeSort(value: string): SearchSort {
  return SEARCH_SORT_VALUES.includes(value as SearchSort) ? (value as SearchSort) : "relevance";
}

/** Convertit les paramètres d'URL en paramètres de recherche exploitables. */
export function toGlobalSearchParams(search: SearchPageSearch): GlobalSearchParams {
  const category = normalizeCategory(search.category);
  return {
    query: search.q.slice(0, 120),
    sort: normalizeSort(search.sort),
    page: Math.max(1, Math.min(500, search.page)),
    pageSize: SEARCH_PAGE_SIZE,
    ...(category ? { category } : {}),
  };
}
