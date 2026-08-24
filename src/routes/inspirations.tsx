import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArticleListView } from "@/components/content/ArticleListView";
import { ArticleListError } from "@/components/content/ArticleListStates";
import { articlesQuery } from "@/hooks/content/useHomeContent";

const title = "Inspirations — HBS HOME";
const description =
  "Conseils, guides et inspirations HBS HOME pour vos rideaux, voilages et textiles de maison.";

export const Route = createFileRoute("/inspirations")({
  loader: async ({ context }) => {
    const articles = await context.queryClient.ensureQueryData(
      articlesQuery({ page: 1, pageSize: 12 }),
    );
    return { total: articles.total };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://hbs-home.com/inspirations" }],
  }),
  errorComponent: ArticleListError,
  component: InspirationsPage,
});

function InspirationsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data } = useSuspenseQuery(articlesQuery({ page: 1, pageSize: 12 }));
  if (pathname.startsWith("/inspirations/") && pathname !== "/inspirations/") {
    return <Outlet />;
  }

  return <ArticleListView articles={data.items} total={data.total} />;
}
