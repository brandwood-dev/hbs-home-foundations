export const contentQueryKeys = {
  all: ["content"] as const,
  home: () => [...contentQueryKeys.all, "home"] as const,
  editorialPage: (slug: string) => [...contentQueryKeys.all, "editorial-page", slug] as const,
};
