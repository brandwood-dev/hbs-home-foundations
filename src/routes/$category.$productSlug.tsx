import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { CatalogView } from "@/components/catalog/CatalogView";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import {
  catalogGroups,
  type CatalogGroupId,
  type CatalogPageConfig,
} from "@/fixtures/catalog-pages.fixture";
import {
  catalogCategoryQuery,
  catalogNavigationQuery,
} from "@/services/catalog/catalog-category.queries";
import {
  validateCatalogSearch,
  type CatalogSearch,
} from "@/services/catalog/catalog.search-params";
import { productBySlugQuery } from "@/services/product/product.queries";

export const Route = createFileRoute("/$category/$productSlug")({
  validateSearch: validateCatalogSearch,
  loader: async ({ context, params }) => {
    const canonicalPath = `/${params.category}/${params.productSlug}`;
    const product = await context.queryClient.ensureQueryData(
      productBySlugQuery(params.productSlug),
    );
    if (product?.canonicalPath === canonicalPath) {
      return { kind: "product" as const, seo: product.seo, canonicalPath };
    }

    // A two-segment URL can also be a dynamically managed subcategory
    // (for example /coussins/coussins-en-fourrure). Resolve the product first
    // for backwards-compatible /category/product URLs, then fall back to the
    // published category taxonomy instead of rendering ProductNotFound.
    const category = await context.queryClient.ensureQueryData(
      catalogCategoryQuery(params.productSlug),
    );
    if (category?.path === canonicalPath) {
      return {
        kind: "category" as const,
        seo: {
          title: category.seoTitle ?? `${category.name} | HBS HOME`,
          description: category.seoDescription ?? category.description ?? "",
        },
        canonicalPath,
      };
    }

    throw notFound();
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Produit introuvable — HBS HOME" }, { name: "robots", content: "noindex" }],
      };
    }
    const isProduct = loaderData.kind === "product";
    const { title, description } = loaderData.seo;
    const ogImage = isProduct ? loaderData.seo.ogImage : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: isProduct ? "product" : "website" },
        ...(isProduct && ogImage ? [{ property: "og:image", content: ogImage }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `https://hbs-home.com${loaderData.canonicalPath}` }],
    };
  },
  notFoundComponent: ProductNotFound,
  component: TwoSegmentPage,
});

function ProductNotFound() {
  return (
    <PlaceholderPage
      title="Produit introuvable"
      intro="Ce produit n'existe plus ou a été renommé. Parcourez le catalogue pour trouver un modèle équivalent."
    />
  );
}

function TwoSegmentPage() {
  const loaderData = Route.useLoaderData();
  const { productSlug } = Route.useParams();

  if (loaderData.kind === "product") {
    return <ProductPage productSlug={productSlug} />;
  }
  return <CategoryPage categorySlug={productSlug} />;
}

function ProductPage({ productSlug }: { productSlug: string }) {
  const { data: product } = useSuspenseQuery(productBySlugQuery(productSlug));
  if (!product) return <ProductNotFound />;
  return <ProductDetailView key={product.id} product={product} />;
}

function CategoryPage({ categorySlug }: { categorySlug: string }) {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const categoryQuery = useSuspenseQuery(catalogCategoryQuery(categorySlug));
  const navigationQuery = useQuery(catalogNavigationQuery());
  const category = categoryQuery.data;

  if (!category) return <DynamicNotFound />;

  const rootSlug = category.path.split("/").filter(Boolean)[0] ?? category.slug;
  const categoryGroup =
    navigationQuery.data?.find((item) => item.slug === rootSlug) ??
    (category.parentSlug
      ? navigationQuery.data?.find((item) => item.slug === category.parentSlug)
      : category);
  const group = categoryGroup
    ? {
        id: rootSlug as CatalogGroupId,
        label: categoryGroup.name,
        path: categoryGroup.path,
      }
    : undefined;
  const config: CatalogPageConfig = {
    routeId: category.slug,
    group: rootSlug as CatalogGroupId,
    path: category.path,
    title: category.name,
    description:
      category.description ?? `Découvrez la sélection ${category.name.toLowerCase()} HBS HOME.`,
    seoTitle: category.seoTitle ?? `${category.name} | HBS HOME`,
    seoDescription: category.seoDescription ?? category.description ?? "",
    seoBlock: category.description ?? "",
  };

  const onSearchChange = (next: CatalogSearch) => {
    void navigate({ to: ".", search: next, resetScroll: false });
  };

  return (
    <CatalogView
      config={config}
      search={search}
      onSearchChange={onSearchChange}
      {...(group
        ? { groupOverride: group }
        : catalogGroups.some((item) => item.id === rootSlug)
          ? {}
          : {
              groupOverride: {
                id: rootSlug as CatalogGroupId,
                label: category.name,
                path: category.path,
              },
            })}
    />
  );
}

function DynamicNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-5xl">404</h1>
        <p className="mt-3 text-foreground-muted">
          Cette catégorie n’existe pas ou n’est plus publiée.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex rounded-md bg-accent px-4 py-2 text-accent-foreground"
        >
          Retour à l’accueil
        </a>
      </div>
    </main>
  );
}
