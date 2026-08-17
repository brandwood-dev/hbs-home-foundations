import { queryOptions } from "@tanstack/react-query";
import { getProductRepository } from "@/repositories/repositoryFactory";
import type { CatalogScope, ProductListParams } from "@/repositories/interfaces/ProductRepository";
import { computeFacets } from "@/services/catalog/catalog.filters";

export function catalogListQuery(params: ProductListParams) {
  return queryOptions({
    queryKey: ["catalog", "list", params],
    queryFn: () => getProductRepository().list(params),
    staleTime: 60_000,
  });
}

export function catalogFacetsQuery(routeId: string, scope?: CatalogScope) {
  return queryOptions({
    queryKey: ["catalog", "facets", routeId],
    queryFn: async () => computeFacets(await getProductRepository().listScope(scope)),
    staleTime: 5 * 60_000,
  });
}
