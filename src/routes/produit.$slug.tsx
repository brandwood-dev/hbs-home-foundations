import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { productBySlugQuery } from "@/services/product/product.queries";

export const Route = createFileRoute("/produit/$slug")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productBySlugQuery(params.slug));
    if (!product) throw notFound();
    return { seo: product.seo };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Produit introuvable — HBS HOME" }, { name: "robots", content: "noindex" }],
      };
    }
    const { title, description } = loaderData.seo;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: ProductNotFound,
  component: ProductPage,
});

function ProductNotFound() {
  return (
    <PlaceholderPage
      title="Produit introuvable"
      intro="Ce rideau n'existe plus ou a été renommé. Parcourez le catalogue pour trouver un modèle équivalent."
    />
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productBySlugQuery(slug));
  if (!product) return <ProductNotFound />;
  return <ProductDetailView key={product.id} product={product} />;
}
