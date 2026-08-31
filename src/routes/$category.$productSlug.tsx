import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { productBySlugQuery } from "@/services/product/product.queries";

export const Route = createFileRoute("/$category/$productSlug")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(
      productBySlugQuery(params.productSlug),
    );
    const canonicalPath = `/${params.category}/${params.productSlug}`;
    if (!product || product.canonicalPath !== canonicalPath) throw notFound();
    return { seo: product.seo, canonicalPath };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Produit introuvable — HBS HOME" }, { name: "robots", content: "noindex" }],
      };
    }
    const { title, description, ogImage } = loaderData.seo;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `https://hbs-home.com${loaderData.canonicalPath}` }],
    };
  },
  notFoundComponent: ProductNotFound,
  component: ProductPage,
});

function ProductNotFound() {
  return (
    <PlaceholderPage
      title="Produit introuvable"
      intro="Ce produit n'existe plus ou a été renommé. Parcourez le catalogue pour trouver un modèle équivalent."
    />
  );
}

function ProductPage() {
  const { productSlug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productBySlugQuery(productSlug));
  if (!product) return <ProductNotFound />;
  return <ProductDetailView key={product.id} product={product} />;
}
