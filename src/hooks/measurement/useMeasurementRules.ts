import { queryOptions, useQuery } from "@tanstack/react-query";
import { measurementKeys } from "@/hooks/measurement/measurement.query-keys";
import { getMeasurementRulesRepository } from "@/repositories/repositoryFactory";

export function measurementRulesQuery() {
  return queryOptions({
    queryKey: measurementKeys.rules(),
    queryFn: () => getMeasurementRulesRepository().getRules(),
    staleTime: 30 * 60_000,
  });
}

export function useMeasurementRules() {
  return useQuery(measurementRulesQuery());
}
