import { z } from "zod";
import {
  SEARCH_HISTORY_MAX_ITEMS,
  SEARCH_HISTORY_STORAGE_KEY,
  SEARCH_HISTORY_VERSION,
} from "@/domain/search/search.constants";
import { SearchError } from "@/domain/search/search.errors";
import type { RecentSearch, SearchHistoryStorage } from "@/domain/search/search.types";
import { migrateSearchHistory } from "@/repositories/local/search-history-migrations";
import { normalizeSearchQuery } from "@/services/search/normalize-search-query";

const recentSearchSchema = z.object({
  query: z.string().min(1),
  normalizedQuery: z.string().min(1),
  searchedAt: z.string().min(1),
});

export const searchHistorySchema = z.object({
  version: z.literal(SEARCH_HISTORY_VERSION),
  items: z.array(recentSearchSchema),
});

export function createEmptyHistory(): SearchHistoryStorage {
  return { version: SEARCH_HISTORY_VERSION, items: [] };
}

/** Déduplique par requête normalisée, la plus récente en tête, limitée à 8 entrées. */
export function dedupeRecentSearches(items: RecentSearch[]): RecentSearch[] {
  const seen = new Set<string>();
  const result: RecentSearch[] = [];
  for (const item of items) {
    if (!item.normalizedQuery || seen.has(item.normalizedQuery)) continue;
    seen.add(item.normalizedQuery);
    result.push(item);
    if (result.length >= SEARCH_HISTORY_MAX_ITEMS) break;
  }
  return result;
}

/** Ajoute une requête en tête. Une requête vide ou d'un seul caractère est ignorée. */
export function addRecentSearch(items: RecentSearch[], rawQuery: string): RecentSearch[] {
  const normalizedQuery = normalizeSearchQuery(rawQuery);
  if (normalizedQuery.length < 2) return dedupeRecentSearches(items);
  const entry: RecentSearch = {
    query: rawQuery.trim(),
    normalizedQuery,
    searchedAt: new Date().toISOString(),
  };
  return dedupeRecentSearches([entry, ...items]);
}

export function parseSearchHistory(raw: string | null): SearchHistoryStorage {
  if (!raw) return createEmptyHistory();
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return createEmptyHistory();
  }
  const parsed = searchHistorySchema.safeParse(migrateSearchHistory(json));
  if (!parsed.success) return createEmptyHistory();
  return { version: SEARCH_HISTORY_VERSION, items: dedupeRecentSearches(parsed.data.items) };
}

function getStorage(): Storage {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new SearchError("storage_unavailable", "localStorage indisponible");
  }
  return window.localStorage;
}

export function readSearchHistory(): RecentSearch[] {
  try {
    return parseSearchHistory(getStorage().getItem(SEARCH_HISTORY_STORAGE_KEY)).items;
  } catch {
    return [];
  }
}

export function writeSearchHistory(items: RecentSearch[]): RecentSearch[] {
  const history: SearchHistoryStorage = {
    version: SEARCH_HISTORY_VERSION,
    items: dedupeRecentSearches(items),
  };
  try {
    getStorage().setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    if (error instanceof SearchError) throw error;
    throw new SearchError("storage_write_failed", "Écriture de l'historique impossible");
  }
  return history.items;
}
