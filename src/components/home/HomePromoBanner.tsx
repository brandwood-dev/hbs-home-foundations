import { ArrowRight } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import type { HomePromoBannerContent } from "@/domain/content/home-content.types";

export function HomePromoBanner({ content }: { content: HomePromoBannerContent }) {
  if (!content.isEnabled || !content.text.trim()) return null;

  const message = (
    <span className="inline-flex items-center gap-2">
      {content.label ? <span className="font-medium">{content.label}</span> : null}
      <span>{content.text}</span>
      {content.href ? <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
    </span>
  );

  return (
    <div className="border-b border-border bg-surface-muted" role="region" aria-label="Promotion">
      <div className="mx-auto flex min-h-11 max-w-7xl items-center justify-center px-6 py-2 text-center text-sm">
        {content.href ? (
          <AppLink
            href={content.href}
            className="inline-flex min-h-11 items-center text-foreground transition-colors hover:text-accent-dark"
          >
            {message}
          </AppLink>
        ) : (
          message
        )}
      </div>
    </div>
  );
}
