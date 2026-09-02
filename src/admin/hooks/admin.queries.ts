import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminRepositories } from "@/admin/repositories/adminRepositoryFactory";
import type {
  AdminDashboardPeriod,
  AdminCustomerListParams,
  AdminOrderListParams,
  AdminHomeSectionKey,
} from "@/admin/repositories/interfaces";

/** Clés de cache du back-office. */
export const adminKeys = {
  all: ["admin"] as const,
  dashboard: (period: AdminDashboardPeriod = {}) => ["admin", "dashboard", period] as const,
  products: () => ["admin", "products"] as const,
  product: (id: string) => ["admin", "products", id] as const,
  categories: () => ["admin", "categories"] as const,
  attributes: () => ["admin", "attributes"] as const,
  inventory: () => ["admin", "inventory"] as const,
  movements: () => ["admin", "inventory", "movements"] as const,
  orders: () => ["admin", "orders"] as const,
  order: (id: string) => ["admin", "orders", id] as const,
  customers: () => ["admin", "customers"] as const,
  customer: (id: string) => ["admin", "customers", id] as const,
  promotions: () => ["admin", "promotions"] as const,
  content: () => ["admin", "content"] as const,
  homeContent: (sectionKey?: AdminHomeSectionKey) =>
    sectionKey
      ? (["admin", "content", "home", sectionKey] as const)
      : (["admin", "content", "home"] as const),
  pages: () => ["admin", "content", "pages"] as const,
  articles: () => ["admin", "content", "articles"] as const,
  articleCategories: () => ["admin", "content", "article-categories"] as const,
  media: () => ["admin", "media"] as const,
  settings: () => ["admin", "settings"] as const,
  users: () => ["admin", "users"] as const,
  audit: () => ["admin", "audit"] as const,
};

/**
 * Les données Admin ne doivent pas être refetchées à chaque retour de focus :
 * cela interrompait les formulaires en cours de saisie. Les mutations
 * invalident explicitement les clés concernées après une sauvegarde.
 */
function clientQuery<T>(key: QueryKey, fn: () => Promise<T>) {
  return {
    queryKey: key,
    queryFn: fn,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  };
}

export function useAdminDashboard(period: AdminDashboardPeriod = {}) {
  return useQuery(
    clientQuery(adminKeys.dashboard(period), () => adminRepositories.dashboard.metrics(period)),
  );
}

export function useAdminProducts(options: { enabled?: boolean } = {}) {
  return useQuery({
    ...clientQuery(adminKeys.products(), () => adminRepositories.products.list()),
    enabled: options.enabled ?? true,
  });
}

export function useAdminProduct(id: string) {
  return useQuery({
    ...clientQuery(adminKeys.product(id), () => adminRepositories.products.getById(id)),
    enabled: Boolean(id),
  });
}

export function useAdminCategories() {
  return useQuery(clientQuery(adminKeys.categories(), () => adminRepositories.categories.list()));
}

export function useAdminAttributes() {
  return useQuery(clientQuery(adminKeys.attributes(), () => adminRepositories.attributes.list()));
}

export function useAdminInventory() {
  return useQuery(clientQuery(adminKeys.inventory(), () => adminRepositories.inventory.list()));
}

export function useAdminStockMovements() {
  return useQuery(
    clientQuery(adminKeys.movements(), () => adminRepositories.inventory.movements()),
  );
}

export function useAdminOrders(params: AdminOrderListParams, search?: string) {
  return useQuery(
    clientQuery([...adminKeys.orders(), "list", params, search ?? ""], () =>
      adminRepositories.orders.list(params, search),
    ),
  );
}

export function useAdminOrder(id: string) {
  return useQuery({
    ...clientQuery(adminKeys.order(id), () => adminRepositories.orders.getById(id)),
    enabled: Boolean(id),
  });
}

export function useAdminCustomers(params: AdminCustomerListParams, search?: string) {
  return useQuery(
    clientQuery([...adminKeys.customers(), "list", params, search ?? ""], () =>
      adminRepositories.customers.list(params, search),
    ),
  );
}

export function useAdminCustomer(id: string) {
  return useQuery({
    ...clientQuery(adminKeys.customer(id), () => adminRepositories.customers.getById(id)),
    enabled: Boolean(id),
  });
}

export function useAdminPromotions() {
  return useQuery(clientQuery(adminKeys.promotions(), () => adminRepositories.promotions.list()));
}

export function useAdminContent() {
  return useQuery(clientQuery(adminKeys.content(), () => adminRepositories.content.get()));
}

export function useAdminHomeContent(sectionKey?: AdminHomeSectionKey) {
  return useQuery(
    clientQuery(adminKeys.homeContent(sectionKey), () =>
      adminRepositories.homeContent.get(sectionKey),
    ),
  );
}

export function useAdminEditorialPages() {
  return useQuery(clientQuery(adminKeys.pages(), () => adminRepositories.pages.list()));
}

export function useAdminEditorialPage(id: string) {
  return useQuery({
    ...clientQuery([...adminKeys.pages(), id], () => adminRepositories.pages.get(id)),
    enabled: Boolean(id),
  });
}

export function useAdminArticles(params?: {
  query?: string;
  status?: "draft" | "published" | "archived";
  categoryId?: string;
}) {
  return useQuery(
    clientQuery([...adminKeys.articles(), params ?? {}], () =>
      adminRepositories.articles.list(params),
    ),
  );
}

export function useAdminArticle(id: string) {
  return useQuery({
    ...clientQuery([...adminKeys.articles(), id], () => adminRepositories.articles.get(id)),
    enabled: Boolean(id),
  });
}

export function useAdminArticleCategories() {
  return useQuery(
    clientQuery(adminKeys.articleCategories(), () => adminRepositories.articles.listCategories()),
  );
}

export function useAdminMedia(options: { enabled?: boolean } = {}) {
  return useQuery({
    ...clientQuery(adminKeys.media(), () => adminRepositories.media.list()),
    enabled: options.enabled ?? true,
  });
}

export function useAdminSettings() {
  return useQuery(clientQuery(adminKeys.settings(), () => adminRepositories.settings.get()));
}

export function useAdminUsers() {
  return useQuery(clientQuery(adminKeys.users(), () => adminRepositories.users.list()));
}

export function useAdminAudit(params?: Parameters<typeof adminRepositories.audit.list>[0]) {
  return useQuery(
    clientQuery([...adminKeys.audit(), params ?? {}], () => adminRepositories.audit.list(params)),
  );
}

/**
 * Mutation générique : toast de succès uniquement après la fin réelle de
 * l'opération mock, invalidation ciblée, message d'erreur lisible.
 */
export function useAdminMutation<TVariables, TData>(options: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage: string;
  invalidate?: QueryKey[];
  onSuccess?: (data: TData) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: options.mutationFn,
    onSuccess: (data) => {
      for (const key of options.invalidate ?? [adminKeys.all]) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
      toast.success(options.successMessage);
      options.onSuccess?.(data);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue.");
    },
  });
}
