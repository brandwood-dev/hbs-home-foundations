import { ArrowRight } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/HomeSectionStates";
import { AppLink } from "@/components/ui/app-link";
import type { ShopByNeedContent } from "@/domain/content/home-content.types";

export function ShopByNeedSection({ content }: { content: ShopByNeedContent }) {
  if (content.cards.length === 0) return null;

  return (
    <section className="border-y border-border bg-surface" aria-labelledby="home-shop-by-need">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
        <HomeSectionHeading
          id="home-shop-by-need"
          eyebrow="Besoins"
          title={content.title}
          subtitle={content.subtitle}
        />

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.cards.map((card) => (
            <AppLink
              key={card.id}
              href={card.href}
              className="group flex h-full flex-col transition-transform duration-300 motion-safe:hover:-translate-y-1"
            >
              <div className="media-frame-editorial shrink-0 overflow-hidden rounded-sm bg-surface-muted">
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
              <h3 className="mt-4 min-h-[3.5rem] line-clamp-2 text-xl">{card.title}</h3>
              <p className="mt-1 min-h-[4.5rem] line-clamp-3 text-sm text-foreground-muted">
                {card.text}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm text-accent-dark">
                Découvrir
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </AppLink>
          ))}
        </div>
      </div>
    </section>
  );
}
