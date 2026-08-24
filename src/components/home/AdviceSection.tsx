import { ArrowRight } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/HomeSectionStates";
import { AppLink } from "@/components/ui/app-link";
import type { AdviceArticlePreview } from "@/domain/content/home-content.types";

export function AdviceSection({ articles }: { articles: AdviceArticlePreview[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24" aria-labelledby="home-advice">
      <HomeSectionHeading
        id="home-advice"
        eyebrow="Magazine"
        title="Conseils et inspirations"
        subtitle="Nos guides pour choisir, mesurer et associer vos textiles."
      />

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {articles.map((article) => (
          <article key={article.id} className="group flex flex-col">
            <AppLink href={`/inspirations/${article.slug}`} className="overflow-hidden rounded-sm">
              <img
                src={article.image.src}
                alt={article.image.alt}
                loading="lazy"
                decoding="async"
                width={800}
                height={600}
                className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </AppLink>
            <p className="eyebrow mt-4">
              {article.category} · {article.readingTimeMinutes} min de lecture
            </p>
            <h3 className="mt-2 text-xl leading-snug">
              <AppLink href={`/inspirations/${article.slug}`} className="hover:text-accent-dark">
                {article.title}
              </AppLink>
            </h3>
            <p className="mt-2 flex-1 text-sm text-foreground-muted">{article.excerpt}</p>
            <AppLink
              href={`/inspirations/${article.slug}`}
              className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-sm text-accent-dark"
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
