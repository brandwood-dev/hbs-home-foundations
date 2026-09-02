import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminRepositories } from "@/admin/repositories/adminRepositoryFactory";
import { isMfaRequiredError, useAdminMfaOptional } from "@/admin/auth/AdminMfaContext";
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

type AdminQueryOptions<T> = ReturnType<typeof clientQuery<T>> & { enabled?: boolean };

/**
 * Read endpoints that expose sensitive operational data may also require
 * AAL2. Handle that response here so opening a protected read page presents
 * the same step-up dialog as a write, without losing the page state.
 */
function useAdminQuery<T>(options: AdminQueryOptions<T>) {
  const mfa = useAdminMfaOptional();
  return useQuery({
    ...options,
    queryFn: async () => {
      try {
        return await options.queryFn();
      } catch (error) {
        if (!mfa || !isMfaRequiredError(error)) throw error;
        await mfa.requireMfa();
        return options.queryFn();
      }
    },
  });
}

export function useAdminDashboard(period: AdminDashboardPeriod = {}) {
  return useAdminQuery(
    clientQuery(adminKeys.dashboard(period), () => adminRepositories.dashboard.metrics(period)),
  );
}

export function useAdminProducts(options: { enabled?: boolean } = {}) {
  return useAdminQuery({
    ...clientQuery(adminKeys.products(), () => adminRepositories.products.list()),
    enabled: options.enabled ?? true,
  });
}

export function useAdminProduct(id: string) {
  return useAdminQuery({
    ...clientQuery(adminKeys.product(id), () => adminRepositories.products.getById(id)),
    enabled: Boolean(id),
  });
}

export function useAdminCategories() {
  return useAdminQuery(
    clientQuery(adminKeys.categories(), () => adminRepositories.categories.list()),
  );
}

export function useAdminAttributes() {
  return useAdminQuery(
    clientQuery(adminKeys.attributes(), () => adminRepositories.attributes.list()),
  );
}

export function useAdminInventory() {
  return useAdminQuery(
    clientQuery(adminKeys.inventory(), () => adminRepositories.inventory.list()),
  );
}

export function useAdminStockMovements() {
  return useAdminQuery(
    clientQuery(adminKeys.movements(), () => adminRepositories.inventory.movements()),
  );
}

export function useAdminOrders(params: AdminOrderListParams, search?: string) {
  return useAdminQuery(
    clientQuery([...adminKeys.orders(), "list", params, search ?? ""], () =>
      adminRepositories.orders.list(params, search),
    ),
  );
}

export function useAdminOrder(id: string) {
  return useAdminQuery({
    ...clientQuery(adminKeys.order(id), () => adminRepositories.orders.getById(id)),
    enabled: Boolean(id),
  });
}

export function useAdminCustomers(params: AdminCustomerListParams, search?: string) {
  return useAdminQuery(
    clientQuery([...adminKeys.customers(), "list", params, search ?? ""], () =>
      adminRepositories.customers.list(params, search),
    ),
  );
}

export function useAdminCustomer(id: string) {
  return useAdminQuery({
    ...clientQuery(adminKeys.customer(id), () => adminRepositories.customers.getById(id)),
    enabled: Boolean(id),
  });
}

export function useAdminPromotions() {
  return useAdminQuery(
    clientQuery(adminKeys.promotions(), () => adminRepositories.promotions.list()),
  );
}

export function useAdminContent() {
  return useAdminQuery(clientQuery(adminKeys.content(), () => adminRepositories.content.get()));
}

export function useAdminHomeContent(sectionKey?: AdminHomeSectionKey) {
  return useAdminQuery(
    clientQuery(adminKeys.homeContent(sectionKey), () =>
      adminRepositories.homeContent.get(sectionKey),
    ),
  );
}

export function useAdminEditorialPages() {
  return useAdminQuery(clientQuery(adminKeys.pages(), () => adminRepositories.pages.list()));
}

export function useAdminEditorialPage(id: string) {
  return useAdminQuery({
    ...clientQuery([...adminKeys.pages(), id], () => adminRepositories.pages.get(id)),
    enabled: Boolean(id),
  });
}

export function useAdminArticles(params?: {
  query?: string;
  status?: "draft" | "published" | "archived";
  categoryId?: string;
}) {
  return useAdminQuery(
    clientQuery([...adminKeys.articles(), params ?? {}], () =>
      adminRepositories.articles.list(params),
    ),
  );
}

export function useAdminArticle(id: string) {
  return useAdminQuery({
    ...clientQuery([...adminKeys.articles(), id], () => adminRepositories.articles.get(id)),
    enabled: Boolean(id),
  });
}

export function useAdminArticleCategories() {
  return useAdminQuery(
    clientQuery(adminKeys.articleCategories(), () => adminRepositories.articles.listCategories()),
  );
}

export function useAdminMedia(options: { enabled?: boolean } = {}) {
  return useAdminQuery({
    ...clientQuery(adminKeys.media(), () => adminRepositories.media.list()),
    enabled: options.enabled ?? true,
  });
}

export function useAdminSettings() {
  return useAdminQuery(clientQuery(adminKeys.settings(), () => adminRepositories.settings.get()));
}

export function useAdminUsers() {
  return useAdminQuery(clientQuery(adminKeys.users(), () => adminRepositories.users.list()));
}

export function useAdminAudit(params?: Parameters<typeof adminRepositories.audit.list>[0]) {
  return useAdminQuery(
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
  const mfa = useAdminMfaOptional();
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        return await options.mutationFn(variables);
      } catch (error) {
        if (!mfa || !isMfaRequiredError(error)) throw error;
        await mfa.requireMfa();
        return options.mutationFn(variables);
      }
    },
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
