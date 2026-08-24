import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import type { ArticleSummary } from "@/domain/content/article.types";

function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <article className="group flex min-w-0 flex-col">
      <Link
        to="/inspirations/$slug"
        params={{ slug: article.slug }}
        className="overflow-hidden rounded-sm bg-surface-muted"
      >
        {article.cover ? (
          <img
            src={article.cover.publicUrl}
            alt={article.cover.alt}
            width={article.cover.width ?? 800}
            height={article.cover.height ?? 600}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="aspect-[4/3] w-full" aria-hidden="true" />
        )}
      </Link>
      <p className="eyebrow mt-4">
        {article.category.name} · {article.readingTimeMinutes} min de lecture
      </p>
      <h2 className="mt-2 text-2xl leading-snug">
        <Link
          to="/inspirations/$slug"
          params={{ slug: article.slug }}
          className="hover:text-accent-dark"
        >
          {article.title}
        </Link>
      </h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-foreground-muted">{article.excerpt}</p>
      <Link
        to="/inspirations/$slug"
        params={{ slug: article.slug }}
        className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm text-accent-dark"
      >
        Lire l'article <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

export function ArticleListView({
  articles,
  total,
}: {
  articles: ArticleSummary[];
  total: number;
}) {
  return (
    <SiteLayout>
      <section
        className="mx-auto max-w-7xl px-6 py-16 sm:py-24"
        aria-labelledby="inspirations-title"
      >
        <header className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Magazine</p>
          <h1 id="inspirations-title" className="mt-4 text-4xl sm:text-5xl">
            Conseils et inspirations
          </h1>
          <p className="mt-5 leading-7 text-foreground-muted">
            Nos idées, guides et conseils pour choisir, mesurer et associer vos textiles.
          </p>
        </header>
        {articles.length > 0 ? (
          <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="mx-auto mt-14 max-w-xl text-center text-foreground-muted">
            Aucun article publié pour le moment.
          </p>
        )}
        <p className="sr-only" aria-live="polite">
          {total} article{total > 1 ? "s" : ""} disponible{total > 1 ? "s" : ""}.
        </p>
      </section>
    </SiteLayout>
  );
}
