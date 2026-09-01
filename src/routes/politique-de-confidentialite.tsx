import { createFileRoute, notFound } from "@tanstack/react-router";
import { ConfidentialitePage } from "@/components/content/ConfidentialitePage";
import { EditorialPageError, EditorialPageNotFound } from "@/components/content/EditorialPageView";
import { editorialPageQuery } from "@/hooks/content/useHomeContent";

const description =
  "Politique de confidentialité HBS HOME : données de commande, compte, newsletter, droits et protection des visiteurs en Tunisie.";

/** Long-form public alias retained for SEO and links from the newsletter. */
export const Route = createFileRoute("/politique-de-confidentialite")({
  loader: async ({ context }) => {
    const page = await context.queryClient.ensureQueryData(editorialPageQuery("confidentialite"));
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
    links: [
      {
        rel: "canonical",
        href: "https://hbs-home.com/politique-de-confidentialite",
      },
    ],
  }),
  notFoundComponent: EditorialPageNotFound,
  errorComponent: EditorialPageError,
  component: ConfidentialitePage,
});
