export const contentQueryKeys = {
  all: ["content"] as const,
  home: () => [...contentQueryKeys.all, "home"] as const,
};
