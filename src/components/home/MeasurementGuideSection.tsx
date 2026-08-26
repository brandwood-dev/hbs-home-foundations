import { AppLink } from "@/components/ui/app-link";
import type { MeasurementGuideContent } from "@/domain/content/home-content.types";

/** Illustration locale (SVG) — fenêtre, tringle et cotes largeur/hauteur. */
function WindowMeasureIllustration() {
  return (
    <svg
      viewBox="0 0 320 260"
      role="img"
      aria-label="Schéma d'une fenêtre avec la mesure de la largeur, de la hauteur et la position de la tringle"
      className="h-auto w-full max-w-md text-foreground"
    >
      <line x1="30" y1="40" x2="290" y2="40" stroke="currentColor" strokeWidth="4" />
      <circle cx="30" cy="40" r="6" fill="currentColor" />
      <circle cx="290" cy="40" r="6" fill="currentColor" />
      <rect
        x="80"
        y="60"
        width="160"
        height="150"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line x1="160" y1="60" x2="160" y2="210" stroke="currentColor" strokeWidth="2" />
      <line x1="80" y1="135" x2="240" y2="135" stroke="currentColor" strokeWidth="2" />
      <g stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4">
        <line x1="80" y1="235" x2="240" y2="235" />
        <line x1="265" y1="60" x2="265" y2="210" />
      </g>
      <text x="160" y="252" textAnchor="middle" fontSize="13" fill="currentColor">
        Largeur
      </text>
      <text
        x="285"
        y="135"
        textAnchor="middle"
        fontSize="13"
        fill="currentColor"
        transform="rotate(90 285 135)"
      >
        Hauteur
      </text>
      <text x="30" y="26" fontSize="13" fill="currentColor">
        Tringle
      </text>
    </svg>
  );
}

export function MeasurementGuideSection({ content }: { content: MeasurementGuideContent }) {
  return (
    <section
      className="mx-auto max-w-7xl px-6 py-16 lg:py-24"
      aria-labelledby="home-measurement-guide"
    >
      <div className="grid items-center gap-10 rounded-sm border border-border bg-surface p-6 sm:p-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Guide</p>
          <h2 id="home-measurement-guide" className="section-title mt-3">
            {content.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground-muted">{content.text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <AppLink
              href={content.primaryCta.href}
              className="inline-flex min-h-[48px] items-center rounded-sm bg-accent px-6 text-sm text-accent-foreground transition-colors hover:bg-accent-dark"
            >
              {content.primaryCta.label}
            </AppLink>
            <AppLink
              href={content.secondaryCta.href}
              className="inline-flex min-h-[48px] items-center rounded-sm border border-taupe/50 px-6 text-sm transition-colors hover:border-accent hover:text-accent-dark"
            >
              {content.secondaryCta.label}
            </AppLink>
          </div>
        </div>

        <div className="flex justify-center">
          <WindowMeasureIllustration />
        </div>
      </div>
    </section>
  );
}
