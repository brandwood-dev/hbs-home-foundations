import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CatalogView } from "@/components/catalog/CatalogView";
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

export const Route = createFileRoute("/$")({
  validateSearch: validateCatalogSearch,
  component: DynamicCatalogPage,
});

function DynamicCatalogPage() {
  const { _splat: splat } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const segments = (splat ?? "")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
  const slug = segments.at(-1) ?? "";
  const categoryQuery = useQuery(catalogCategoryQuery(slug));
  const navigationQuery = useQuery(catalogNavigationQuery());

  if (!slug || categoryQuery.isError || categoryQuery.data === null) {
    return <DynamicNotFound />;
  }
  if (categoryQuery.isPending || !categoryQuery.data) {
    return <div className="min-h-screen bg-background" aria-busy="true" />;
  }

  const category = categoryQuery.data;
  const expectedPath = `/${segments.join("/")}`;
  if (category.path !== expectedPath) return <DynamicNotFound />;

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
