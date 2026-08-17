export const orderQueryKeys = {
  all: ["orders"] as const,
  last: () => [...orderQueryKeys.all, "last"] as const,
  byNumber: (orderNumber: string) => [...orderQueryKeys.all, "number", orderNumber] as const,
};
