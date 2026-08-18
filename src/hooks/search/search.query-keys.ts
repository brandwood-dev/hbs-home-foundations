import type { GlobalSearchParams } from "@/domain/search/search.types";

export const searchQueryKeys = {
  all: ["search"] as const,
  suggestions: (query: string) => ["search", "suggestions", query] as const,
  results: (params: GlobalSearchParams) =>
    [
      "search",
      "results",
      params.query,
      params.category ?? "all",
      params.sort,
      params.page,
      params.pageSize,
    ] as const,
  history: () => ["search", "history"] as const,
};
