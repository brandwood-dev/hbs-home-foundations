import { ArrowRight } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/HomeSectionStates";
import { AppLink } from "@/components/ui/app-link";
import type { ShopByNeedContent } from "@/domain/content/home-content.types";

export function ShopByNeedSection({ content }: { content: ShopByNeedContent }) {
  if (content.cards.length === 0) return null;

  return (
    <section className="border-y border-border bg-surface" aria-labelledby="home-shop-by-need">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <HomeSectionHeading
          id="home-shop-by-need"
          eyebrow="Besoins"
          title={content.title}
          subtitle={content.subtitle}
        />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.cards.map((card) => (
            <AppLink key={card.id} href={card.href} className="group flex flex-col">
              <div className="overflow-hidden rounded-sm bg-surface-muted">
                <img
                  src={card.image.src}
                  alt={card.image.alt}
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={600}
                  className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:h-52"
                />
              </div>
              <h3 className="mt-4 text-xl">{card.title}</h3>
              <p className="mt-1 flex-1 text-sm text-foreground-muted">{card.text}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent-dark">
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
