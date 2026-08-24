import { getCategoryRepository } from "@/repositories/repositoryFactory";

export function catalogNavigationQuery() {
  return {
    queryKey: ["catalog", "categories", "navigation"],
    queryFn: () => getCategoryRepository().list({ navigationOnly: true }),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  };
}

export function catalogCategoryQuery(slug: string) {
  return {
    queryKey: ["catalog", "category", slug],
    queryFn: () => getCategoryRepository().getBySlug(slug),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  };
}
