export const cartQueryKeys = {
  all: ["cart"] as const,
  current: () => [...cartQueryKeys.all, "current"] as const,
};
