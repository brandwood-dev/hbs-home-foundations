import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  EditorialPageError,
  EditorialPageNotFound,
  EditorialPageView,
} from "@/components/content/EditorialPageView";
import { editorialPageQuery } from "@/hooks/content/useHomeContent";

const description = "Contact — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/contact")({
  loader: async ({ context }) => {
    const page = await context.queryClient.ensureQueryData(editorialPageQuery("contact"));
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
    links: [{ rel: "canonical", href: "https://hbs-home.com/contact" }],
  }),
  notFoundComponent: EditorialPageNotFound,
  errorComponent: EditorialPageError,
  component: ContactPage,
});

function ContactPage() {
  const { data: page } = useSuspenseQuery(editorialPageQuery("contact"));
  return page ? <EditorialPageView page={page} /> : <EditorialPageNotFound />;
}
