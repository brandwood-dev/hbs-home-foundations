import { queryOptions } from "@tanstack/react-query";
import { getProductRepository } from "@/repositories/repositoryFactory";
import type { CatalogScope, ProductListParams } from "@/repositories/interfaces/ProductRepository";
import { computeFacets } from "@/services/catalog/catalog.filters";

export type CatalogGlobalFilter = "new" | "discounted";

export function catalogListQuery(params: ProductListParams) {
  return queryOptions({
    queryKey: ["catalog", "list", params],
    queryFn: () => getProductRepository().list(params),
    staleTime: 60_000,
  });
}

export function catalogFacetsQuery(
  routeId: string,
  scope?: CatalogScope,
  globalFilter?: CatalogGlobalFilter,
) {
  return queryOptions({
    queryKey: ["catalog", "facets", routeId, scope, globalFilter],
    queryFn: async () => {
      const repository = getProductRepository();

      // Global catalogue pages (Promotions / Nouveautés) must derive their
      // facets from the same filtered product set as the result list. Using
      // listScope alone would expose dimensions from unrelated products,
      // such as 40 cm cushions when no cushion is on sale.
      if (globalFilter) {
        const result = await repository.list({
          page: 1,
          pageSize: 200,
          sort: "recommended",
          ...scope,
          ...(globalFilter === "discounted" ? { onlyDiscounted: true } : { onlyNew: true }),
        });
        return computeFacets(result.items);
      }

      return computeFacets(await repository.listScope(scope));
    },
    staleTime: 5 * 60_000,
  });
}

