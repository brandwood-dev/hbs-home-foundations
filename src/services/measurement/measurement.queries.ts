import { queryOptions } from "@tanstack/react-query";
import type { MeasurementProjectType } from "@/domain/measurement/measurement.types";
import { measurementKeys } from "@/hooks/measurement/measurement.query-keys";
import { getProductRepository } from "@/repositories/repositoryFactory";

/** Produits candidats du guide : uniquement la catégorie du projet. */
export function measurementProductsQuery(projectType: MeasurementProjectType) {
  return queryOptions({
    queryKey: measurementKeys.products(projectType),
    queryFn: () => getProductRepository().listScope({ categories: [projectType] }),
    staleTime: 5 * 60_000,
  });
}

export function measurementAccessoriesQuery() {
  return queryOptions({
    queryKey: measurementKeys.accessories(),
    queryFn: () => getProductRepository().listScope({ categories: ["accessoires"] }),
    staleTime: 5 * 60_000,
  });
}
