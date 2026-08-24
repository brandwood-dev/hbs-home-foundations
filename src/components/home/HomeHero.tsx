import { ArrowRight } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import type { HomeHeroContent } from "@/domain/content/home-content.types";

export function HomeHero({ content }: { content: HomeHeroContent }) {
  const { tagline, title, text, primaryCta, secondaryCta, image } = content;

  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-10 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="order-2 lg:order-1">
          <p className="eyebrow">{tagline}</p>
          <h1 className="mt-4 text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-foreground-muted">{text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <AppLink
              href={primaryCta.href}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-sm bg-accent px-6 text-sm font-medium tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark"
            >
              {primaryCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </AppLink>
            <AppLink
              href={secondaryCta.href}
              className="inline-flex min-h-[48px] items-center rounded-sm border border-taupe/50 px-6 text-sm font-medium tracking-wide text-foreground transition-colors hover:border-accent hover:text-accent-dark"
            >
              {secondaryCta.label}
            </AppLink>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <picture>
            {content.mobileImage ? (
              <source media="(max-width: 639px)" srcSet={content.mobileImage.src} />
            ) : null}
            <img
              src={image.src}
              alt={image.alt}
              width={1200}
              height={1400}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-[280px] w-full rounded-sm object-cover sm:h-[380px] lg:h-[560px]"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
