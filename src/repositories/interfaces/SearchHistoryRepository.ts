import type { RecentSearch } from "@/domain/search/search.types";

export interface SearchHistoryRepository {
  list(): Promise<RecentSearch[]>;
  add(query: string): Promise<RecentSearch[]>;
  remove(normalizedQuery: string): Promise<RecentSearch[]>;
  clear(): Promise<void>;
}
