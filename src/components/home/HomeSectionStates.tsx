import type { ReactNode } from "react";

export function HomeSectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4"
      role="status"
      aria-live="polite"
      aria-label="Chargement de la sélection"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[3/4] w-full rounded-md bg-surface-muted" />
          <div className="mt-3 h-3 w-1/2 rounded bg-surface-muted" />
          <div className="mt-2 h-4 w-3/4 rounded bg-surface-muted" />
          <div className="mt-2 h-3 w-1/3 rounded bg-surface-muted" />
        </div>
      ))}
    </div>
  );
}

export function HomeSectionErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-8 text-center">
      <p className="text-lg">Cette sélection est momentanément indisponible</p>
      <p className="mt-2 text-sm text-foreground-muted">
        Vous pouvez réessayer, le reste de la page reste accessible.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-[44px] items-center rounded-sm bg-accent px-6 text-sm text-accent-foreground transition-colors hover:bg-accent-dark"
      >
        Réessayer
      </button>
    </div>
  );
}

export function HomeSectionEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-sm border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
      {children}
    </div>
  );
}

export function HomeSectionHeading({
  eyebrow,
  title,
  subtitle,
  id,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  id?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="mt-3 text-3xl sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-base text-foreground-muted">{subtitle}</p>}
    </div>
  );
}
