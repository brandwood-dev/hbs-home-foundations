import { ArrowRight } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import type { CustomProfessionalContent } from "@/domain/content/home-content.types";
import { trackEvent } from "@/lib/analytics/analytics";

export function CustomAndProfessionalSection({ content }: { content: CustomProfessionalContent }) {
  if (content.columns.length === 0) return null;

  return (
    <section
      className="mx-auto max-w-7xl px-6 py-10 lg:py-14"
      aria-label="Sur mesure et professionnels"
    >
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow">Des projets uniques</p>
        <h2 className="section-title mt-3 text-[clamp(1.75rem,3vw,2.35rem)]">
          Des solutions pensées pour chaque intérieur
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-foreground-muted">
          Un accompagnement attentif, du conseil à l’installation, pour donner forme à vos projets.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {content.columns.map((column, index) => (
          <AppLink
            key={column.id}
            href={column.cta.href}
            onClick={() => trackEvent("generate_lead", { lead_type: column.id })}
            className={`group grid min-h-[420px] overflow-hidden rounded-sm border border-border bg-surface transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-dark focus-visible:ring-offset-4 sm:min-h-[460px] lg:grid-cols-[0.92fr_1.08fr] ${index % 2 === 1 ? "lg:grid-cols-[1.08fr_0.92fr]" : ""}`}
          >
            <div
              className={`relative min-h-56 overflow-hidden bg-surface-muted ${index % 2 === 1 ? "lg:order-2" : ""}`}
            >
              <img
                src={column.image.src}
                alt={column.image.alt}
                loading="lazy"
                decoding="async"
                width={1024}
                height={1024}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-dark shadow-sm">
                {column.tagline}
              </span>
            </div>
            <div
              className={`flex flex-col justify-center p-6 sm:p-9 ${index % 2 === 1 ? "lg:order-1" : ""}`}
            >
              <p className="eyebrow">{column.tagline}</p>
              <h3 className="mt-3 max-w-[20ch] text-2xl font-medium leading-[1.1] tracking-[-0.025em] sm:text-3xl">
                {column.title}
              </h3>
              <p className="mt-4 max-w-md flex-1 text-base leading-relaxed text-foreground-muted">
                {column.text}
              </p>
              <span className="mt-6 inline-flex min-h-[44px] w-fit items-center gap-2 text-sm font-medium text-accent-dark transition-[gap,color] duration-300 group-hover:gap-3 group-hover:text-accent">
                {column.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </AppLink>
        ))}
      </div>
    </section>
  );
}
