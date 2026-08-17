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
