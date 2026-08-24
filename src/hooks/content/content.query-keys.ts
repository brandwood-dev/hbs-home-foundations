export const contentQueryKeys = {
  all: ["content"] as const,
  home: () => [...contentQueryKeys.all, "home"] as const,
  editorialPage: (slug: string) => [...contentQueryKeys.all, "editorial-page", slug] as const,
  articles: (params: unknown = {}) => [...contentQueryKeys.all, "articles", params] as const,
  article: (slug: string) => [...contentQueryKeys.all, "article", slug] as const,
};
