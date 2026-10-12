import { ArrowRight } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import type { HomeHeroContent } from "@/domain/content/home-content.types";
import { RichTextRenderer } from "@/lib/content/rich-text";

export function HomeHero({ content }: { content: HomeHeroContent }) {
  const { tagline, title, text, primaryCta, secondaryCta, image, mobileImage } = content;

  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate min-h-[600px] overflow-hidden bg-foreground sm:min-h-[640px]"
    >
      <picture className="absolute inset-0 -z-20 block h-full w-full">
        {mobileImage ? <source media="(max-width: 639px)" srcSet={mobileImage.src} /> : null}
        <img
          src={image.src}
          alt=""
          aria-hidden="true"
          width={2000}
          height={1125}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          sizes="100vw"
          className="hero-image-drift h-full w-full object-cover object-center"
        />
      </picture>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/25 to-black/5 sm:bg-gradient-to-r sm:from-black/75 sm:via-black/40 sm:to-black/10"
      />

      <div className="relative mx-auto flex min-h-[600px] max-w-7xl items-end px-6 py-14 sm:min-h-[640px] sm:items-center sm:py-20 lg:px-10">
        <div className="hero-content-enter max-w-2xl text-white">
          <p className="eyebrow text-white/80">{tagline}</p>
          <h1 id="home-hero-title" className="hero-title mt-4 max-w-xl text-white">
            {title}
          </h1>
          <RichTextRenderer
            value={text}
            className="mt-5 max-w-xl text-base leading-relaxed text-white/85 [&_a]:text-white"
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <AppLink
              href={primaryCta.href}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-sm bg-accent px-6 text-sm font-medium tracking-wide text-accent-foreground transition-all duration-300 motion-safe:hover:-translate-y-0.5 hover:bg-accent-dark"
            >
              {primaryCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </AppLink>
            <AppLink
              href={secondaryCta.href}
              className="inline-flex min-h-[48px] items-center rounded-sm border border-white/70 px-6 text-sm font-medium tracking-wide text-white transition-all duration-300 motion-safe:hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
            >
              {secondaryCta.label}
            </AppLink>
          </div>
        </div>
      </div>
    </section>
  );
}
