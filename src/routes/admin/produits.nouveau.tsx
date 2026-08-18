import { createFileRoute } from "@tanstack/react-router";
import { AdminProductForm } from "@/admin/components/products/AdminProductForm";

export const Route = createFileRoute("/admin/produits/nouveau")({
  head: () => ({
    meta: [
      { title: "Nouveau produit — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Création d'une fiche produit HBS HOME." },
    ],
  }),
  component: NewProductPage,
});

function NewProductPage() {
  return <AdminProductForm />;
}
