import { createFileRoute } from "@tanstack/react-router";
import { AdminProductsPage } from "@/admin/components/products/AdminProductsPage";

export const Route = createFileRoute("/admin/produits/")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => {
    const query = search["q"];
    return typeof query === "string" && query.trim() ? { q: query } : {};
  },
  head: () => ({
    meta: [
      { title: "Produits — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Gestion du catalogue produits HBS HOME." },
    ],
  }),
  component: ProductsRoute,
});

function ProductsRoute() {
  const search = Route.useSearch();
  return <AdminProductsPage initialQuery={search.q ?? ""} />;
}
