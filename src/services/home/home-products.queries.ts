import { queryOptions } from "@tanstack/react-query";
import type { ProductSelectionFilter } from "@/domain/content/home-content.types";
import type { ProductListParams } from "@/repositories/interfaces/ProductRepository";
import { getProductRepository } from "@/repositories/repositoryFactory";

/** Paramètres catalogue d'un onglet — fonction pure, testable. */
export function buildSelectionParams(
  filter: ProductSelectionFilter,
  pageSize: number,
): ProductListParams {
  const base = { page: 1, pageSize } as const;
  if (filter === "best_sellers") {
    return { ...base, onlyBestSellers: true, sort: "best_sellers" };
  }
  if (filter === "discounted") {
    return { ...base, onlyDiscounted: true, sort: "discount" };
  }
  return { ...base, onlyNew: true, sort: "newest" };
}

export function homeSelectionQuery(filter: ProductSelectionFilter, pageSize: number) {
  return queryOptions({
    queryKey: ["home", "selection", filter, pageSize],
    queryFn: async () => {
      const result = await getProductRepository().list(buildSelectionParams(filter, pageSize));
      return result.items;
    },
    staleTime: 5 * 60_000,
  });
}

export function homeProductsByIdsQuery(ids: string[]) {
  const stableIds = [...ids].sort();
  return queryOptions({
    queryKey: ["home", "products-by-ids", stableIds],
    queryFn: () => getProductRepository().getByIds(stableIds),
    staleTime: 5 * 60_000,
    enabled: stableIds.length > 0,
  });
}
