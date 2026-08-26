import { ArrowRight } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import type { CustomProfessionalContent } from "@/domain/content/home-content.types";
import { trackEvent } from "@/lib/analytics/analytics";

export function CustomAndProfessionalSection({ content }: { content: CustomProfessionalContent }) {
  if (content.columns.length === 0) return null;

  return (
    <section
      className="mx-auto max-w-7xl px-6 py-16 lg:py-24"
      aria-label="Sur mesure et professionnels"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {content.columns.map((column) => (
          <div
            key={column.id}
            className="flex flex-col rounded-sm border border-border bg-surface p-6 sm:p-10"
          >
            <p className="eyebrow">{column.tagline}</p>
            <h2 className="section-title mt-3">{column.title}</h2>
            <p className="mt-4 flex-1 text-base leading-relaxed text-foreground-muted">
              {column.text}
            </p>
            <AppLink
              href={column.cta.href}
              onClick={() => trackEvent("generate_lead", { lead_type: column.id })}
              className="mt-6 inline-flex min-h-[48px] w-fit items-center gap-2 rounded-sm bg-accent px-6 text-sm text-accent-foreground transition-colors hover:bg-accent-dark"
            >
              {column.cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </AppLink>
          </div>
        ))}
      </div>
    </section>
  );
}
