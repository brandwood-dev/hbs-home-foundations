import { ArrowRight } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/HomeSectionStates";
import { AppLink } from "@/components/ui/app-link";
import type { ComposeWindowContent } from "@/domain/content/home-content.types";

export function ComposeWindowSection({ content }: { content: ComposeWindowContent }) {
  if (content.steps.length === 0) return null;

  return (
    <section className="border-y border-border bg-surface" aria-labelledby="home-compose-window">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <HomeSectionHeading
          id="home-compose-window"
          eyebrow="Méthode"
          title={content.title}
          subtitle={content.subtitle}
        />

        <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.steps.map((step, index) => (
            <li key={step.id} className="relative">
              <span
                aria-hidden="true"
                className="hidden lg:absolute lg:left-12 lg:right-0 lg:top-5 lg:block lg:border-t lg:border-dashed lg:border-border last:lg:hidden"
              />
              <AppLink href={step.href} className="group relative block">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent bg-background text-sm text-accent-dark">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg group-hover:text-accent-dark">{step.title}</h3>
                <p className="mt-1 text-sm text-foreground-muted">{step.text}</p>
              </AppLink>
            </li>
          ))}
        </ol>

        <AppLink
          href={content.cta.href}
          className="mt-10 inline-flex min-h-[48px] items-center gap-2 rounded-sm bg-accent px-6 text-sm text-accent-foreground transition-colors hover:bg-accent-dark"
        >
          {content.cta.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </AppLink>
      </div>
    </section>
  );
}
