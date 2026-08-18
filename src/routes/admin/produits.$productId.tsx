import { createFileRoute } from "@tanstack/react-router";
import { AdminProductForm } from "@/admin/components/products/AdminProductForm";
import { AdminEmptyState, AdminSkeleton } from "@/admin/components/ui/AdminStates";
import { useAdminProduct } from "@/admin/hooks/admin.queries";

export const Route = createFileRoute("/admin/produits/$productId")({
  head: () => ({
    meta: [
      { title: "Fiche produit — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Édition d'une fiche produit HBS HOME." },
    ],
  }),
  component: EditProductPage,
});

function EditProductPage() {
  const { productId } = Route.useParams();
  const { data: product, isLoading } = useAdminProduct(productId);

  if (isLoading) return <AdminSkeleton rows={8} />;
  if (!product) {
    return (
      <AdminEmptyState
        title="Produit introuvable"
        description="Ce produit a peut-être été supprimé du catalogue de démonstration."
      />
    );
  }
  return <AdminProductForm key={product.id} product={product} />;
}
