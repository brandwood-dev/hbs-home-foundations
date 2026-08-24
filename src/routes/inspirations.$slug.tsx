import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { ArticleDetailView } from "@/components/content/ArticleDetailView";
import { articleQuery } from "@/hooks/content/useHomeContent";

export const Route = createFileRoute("/inspirations/$slug")({
  loader: async ({ context, params }) => {
    const article = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!article) throw notFound();
    return {
      title: article.seoTitle ?? `${article.title} — HBS HOME`,
      description: article.seoDescription ?? article.excerpt,
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: loaderData.title },
            { name: "description", content: loaderData.description },
            { property: "og:title", content: loaderData.title },
            { property: "og:description", content: loaderData.description },
            { property: "og:type", content: "article" },
            { name: "twitter:card", content: "summary_large_image" },
          ],
        }
      : {
          meta: [
            { title: "Article introuvable — HBS HOME" },
            { name: "robots", content: "noindex" },
          ],
        },
  notFoundComponent: ArticleNotFound,
  component: ArticlePage,
});

function ArticleNotFound() {
  return (
    <PlaceholderPage
      title="Article introuvable"
      intro="Cet article n'existe plus ou n'est pas encore publié."
    />
  );
}

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data: article } = useSuspenseQuery(articleQuery(slug));
  return article ? <ArticleDetailView article={article} /> : <ArticleNotFound />;
}
