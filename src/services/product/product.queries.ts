import { queryOptions } from "@tanstack/react-query";
import { getProductRepository } from "@/repositories/repositoryFactory";

export function productBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["product", "detail", slug],
    queryFn: () => getProductRepository().getBySlug(slug),
    staleTime: 5 * 60_000,
  });
}

export function relatedProductsQuery(slug: string, limit = 4) {
  return queryOptions({
    queryKey: ["product", "related", slug, limit],
    queryFn: () => getProductRepository().listRelated(slug, limit),
    staleTime: 5 * 60_000,
  });
}
