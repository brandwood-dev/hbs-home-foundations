import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { contentQueryKeys } from "@/hooks/content/content.query-keys";
import { getContentRepository } from "@/repositories/repositoryFactory";

export function homeContentQuery() {
  return queryOptions({
    queryKey: contentQueryKeys.home(),
    queryFn: () => getContentRepository().getHomePage(),
    staleTime: 10 * 60_000,
  });
}

export function useHomeContent() {
  return useSuspenseQuery(homeContentQuery());
}

export function editorialPageQuery(slug: string) {
  return queryOptions({
    queryKey: contentQueryKeys.editorialPage(slug),
    queryFn: () => getContentRepository().getEditorialPage(slug),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: false,
  });
}

export function useEditorialPage(slug: string) {
  return useSuspenseQuery(editorialPageQuery(slug));
}
