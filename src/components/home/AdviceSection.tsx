import { ArrowRight } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/HomeSectionStates";
import { AppLink } from "@/components/ui/app-link";
import type { AdviceArticlePreview } from "@/domain/content/home-content.types";
import { RichTextRenderer } from "@/lib/content/rich-text";

export function AdviceSection({ articles }: { articles: AdviceArticlePreview[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:py-14" aria-labelledby="home-advice">
      <HomeSectionHeading
        id="home-advice"
        eyebrow="Magazine"
        title="Conseils et inspirations"
        subtitle="Nos guides pour choisir, mesurer et associer vos textiles."
      />

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        {articles.map((article) => (
          <article
            key={article.id}
            className="group flex h-full flex-col transition-transform duration-300 motion-safe:hover:-translate-y-1"
          >
            <AppLink
              href={`/inspirations/${article.slug}`}
              className="media-frame-editorial block shrink-0 overflow-hidden rounded-sm bg-surface-muted"
            >
              <img
                src={article.image.src}
                alt={article.image.alt}
                loading="lazy"
                decoding="async"
                width={800}
                height={600}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </AppLink>
            <p className="eyebrow mt-4 min-h-[1.25rem]">
              {article.category} · {article.readingTimeMinutes} min de lecture
            </p>
            <h3 className="mt-2 min-h-[3.5rem] line-clamp-2 text-xl leading-snug">
              <AppLink href={`/inspirations/${article.slug}`} className="hover:text-accent-dark">
                {article.title}
              </AppLink>
            </h3>
            <RichTextRenderer
              value={article.excerpt}
              className="mt-2 min-h-[4.5rem] line-clamp-3 flex-1 text-sm text-foreground-muted"
            />
            <AppLink
              href={`/inspirations/${article.slug}`}
              className="mt-auto inline-flex min-h-[44px] items-center gap-1.5 pt-3 text-sm text-accent-dark"
            >
              Lire l'article
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </AppLink>
          </article>
        ))}
      </div>
    </section>
  );
}
