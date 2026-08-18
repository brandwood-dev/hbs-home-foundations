import type { RecentSearch } from "@/domain/search/search.types";
import type { SearchHistoryRepository } from "@/repositories/interfaces/SearchHistoryRepository";
import {
  addRecentSearch,
  readSearchHistory,
  writeSearchHistory,
} from "@/repositories/local/search-history-storage";

/** Historique de recherche local — jamais envoyé au serveur. */
export class LocalSearchHistoryRepository implements SearchHistoryRepository {
  async list(): Promise<RecentSearch[]> {
    return readSearchHistory();
  }

  async add(query: string): Promise<RecentSearch[]> {
    const next = addRecentSearch(readSearchHistory(), query);
    try {
      return writeSearchHistory(next);
    } catch {
      return next;
    }
  }

  async remove(normalizedQuery: string): Promise<RecentSearch[]> {
    const next = readSearchHistory().filter((item) => item.normalizedQuery !== normalizedQuery);
    try {
      return writeSearchHistory(next);
    } catch {
      return next;
    }
  }

  async clear(): Promise<void> {
    try {
      writeSearchHistory([]);
    } catch {
      /* stockage indisponible : rien à nettoyer */
    }
  }
}
