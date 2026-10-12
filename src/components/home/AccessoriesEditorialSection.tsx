import { ArrowRight } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/HomeSectionStates";
import { AppLink } from "@/components/ui/app-link";
import type { AccessoriesEditorialContent } from "@/domain/content/home-content.types";

export function AccessoriesEditorialSection({ content }: { content: AccessoriesEditorialContent }) {
  if (content.cards.length === 0) return null;

  return (
    <section className="border-y border-border bg-surface" aria-labelledby="home-accessories">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
        <HomeSectionHeading
          id="home-accessories"
          eyebrow="Accessoires"
          title={content.title}
          {...(content.subtitle ? { subtitle: content.subtitle } : {})}
        />

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.cards.map((card) => (
            <AppLink key={card.id} href={card.href} className="group flex flex-col">
              <div className="media-frame-editorial overflow-hidden rounded-sm bg-surface-muted">
                <img
                  src={card.image.src}
                  alt={card.image.alt}
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-4 text-lg">{card.title}</h3>
              <p className="mt-1 flex-1 text-sm text-foreground-muted">{card.description}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent-dark">
                Découvrir
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </AppLink>
          ))}
        </div>
      </div>
    </section>
  );
}
