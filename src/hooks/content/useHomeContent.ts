import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { contentQueryKeys } from "@/hooks/content/content.query-keys";
import { getContentRepository } from "@/repositories/repositoryFactory";
import type { ArticleListParams } from "@/domain/content/article.types";

export function homeContentQuery() {
  return queryOptions({
    queryKey: contentQueryKeys.home(),
    queryFn: () => getContentRepository().getHomePage(),
    // The homepage now includes catalogue-backed collections. Keep the cache
    // aligned with the public category endpoint so Admin changes become
    // visible without waiting ten minutes for a hard reload.
    staleTime: 60_000,
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

export function articlesQuery(params: ArticleListParams = {}) {
  return queryOptions({
    queryKey: contentQueryKeys.articles(params),
    queryFn: () => getContentRepository().listArticles(params),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

export function articleQuery(slug: string) {
  return queryOptions({
    queryKey: contentQueryKeys.article(slug),
    queryFn: () => getContentRepository().getArticle(slug),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: false,
  });
}
