export const measurementKeys = {
  all: ["measurement"] as const,
  rules: () => [...measurementKeys.all, "rules"] as const,
  products: (projectType: string) => [...measurementKeys.all, "products", projectType] as const,
  accessories: () => [...measurementKeys.all, "accessories"] as const,
};
