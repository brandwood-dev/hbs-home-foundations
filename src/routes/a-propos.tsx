import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  EditorialPageError,
  EditorialPageNotFound,
  EditorialPageView,
} from "@/components/content/EditorialPageView";
import { editorialPageQuery } from "@/hooks/content/useHomeContent";

const description = "À propos — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/a-propos")({
  loader: async ({ context }) => {
    const page = await context.queryClient.ensureQueryData(editorialPageQuery("a-propos"));
    if (!page) throw notFound();
    return {
      seoTitle: page.seoTitle ?? `${page.title} — HBS HOME`,
      seoDescription: page.seoDescription ?? description,
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.seoTitle },
          { name: "description", content: loaderData.seoDescription },
          { property: "og:title", content: loaderData.seoTitle },
          { property: "og:description", content: loaderData.seoDescription },
          { property: "og:type", content: "article" },
        ]
      : [{ title: "Page introuvable — HBS HOME" }, { name: "robots", content: "noindex" }],
    links: [{ rel: "canonical", href: "https://hbs-home.com/a-propos" }],
  }),
  notFoundComponent: EditorialPageNotFound,
  errorComponent: EditorialPageError,
  component: AProposPage,
});

function AProposPage() {
  const { data: page } = useSuspenseQuery(editorialPageQuery("a-propos"));
  return page ? <EditorialPageView page={page} /> : <EditorialPageNotFound />;
}
