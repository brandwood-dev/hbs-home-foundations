import { ArrowRight } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import type { MaterialFocusContent } from "@/domain/content/home-content.types";

export function MaterialFocusSection({ content }: { content: MaterialFocusContent }) {
  return (
    <section
      className="mx-auto max-w-7xl px-6 py-16 lg:py-24"
      aria-labelledby="home-material-focus"
    >
      <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <img
            src={content.image.src}
            alt={content.image.alt}
            loading="lazy"
            decoding="async"
            width={1400}
            height={1000}
            className="h-[260px] w-full rounded-sm object-cover sm:h-[380px] lg:h-[520px]"
          />
        </div>

        <div className="lg:col-span-5">
          <p className="eyebrow">{content.tagline}</p>
          <h2 id="home-material-focus" className="section-title mt-3">
            {content.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground-muted">{content.text}</p>

          <div className="mt-6 flex items-center gap-4">
            <img
              src={content.closeUpImage.src}
              alt={content.closeUpImage.alt}
              loading="lazy"
              decoding="async"
              width={240}
              height={240}
              className="h-20 w-20 rounded-sm object-cover sm:h-24 sm:w-24"
            />
            <AppLink
              href={content.cta.href}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-sm bg-accent px-6 text-sm text-accent-foreground transition-colors hover:bg-accent-dark"
            >
              {content.cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </AppLink>
          </div>
        </div>
      </div>
    </section>
  );
}
