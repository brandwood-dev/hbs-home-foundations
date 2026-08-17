import { useState, type FormEvent } from "react";
import { AppLink } from "@/components/ui/app-link";
import { dataProvider } from "@/config/features.config";
import type { NewsletterContent } from "@/domain/content/home-content.types";
import { useNewsletterSubscription } from "@/hooks/newsletter/useNewsletterSubscription";
import { trackEvent } from "@/lib/analytics/analytics";
import {
  isValidEmail,
  NEWSLETTER_DEMO_NOTICE,
  NEWSLETTER_ERROR_MESSAGE,
  NEWSLETTER_INVALID_EMAIL_MESSAGE,
} from "@/services/newsletter/newsletter-validation";

type Feedback = { tone: "success" | "error"; message: string } | null;

export function NewsletterSection({ content }: { content: NewsletterContent }) {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const subscription = useNewsletterSubscription();
  const isDemo = dataProvider === "mock";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!isValidEmail(email)) {
      setFeedback({ tone: "error", message: NEWSLETTER_INVALID_EMAIL_MESSAGE });
      return;
    }

    try {
      const result = await subscription.mutateAsync(email);
      setFeedback({ tone: result.success ? "success" : "error", message: result.message });
      if (result.success) {
        setEmail("");
        trackEvent("newsletter_subscribe", { source: "home_page" });
      }
    } catch {
      setFeedback({ tone: "error", message: NEWSLETTER_ERROR_MESSAGE });
    }
  };

  return (
    <section className="border-t border-border bg-surface" aria-labelledby="home-newsletter">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center lg:py-24">
        <p className="eyebrow">Newsletter</p>
        <h2 id="home-newsletter" className="mt-3 text-3xl sm:text-4xl">
          {content.title}
        </h2>
        <p className="mt-4 text-base text-foreground-muted">{content.text}</p>

        <form onSubmit={onSubmit} noValidate className="mx-auto mt-8 max-w-xl">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              {content.fieldLabel}
            </label>
            <input
              id="newsletter-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={content.fieldLabel}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={feedback?.tone === "error"}
              aria-describedby="newsletter-feedback newsletter-consent"
              className="min-h-[48px] flex-1 rounded-sm border border-border bg-background px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
            <button
              type="submit"
              disabled={subscription.isPending}
              className="min-h-[48px] rounded-sm bg-accent px-6 text-sm text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
            >
              {subscription.isPending ? "Inscription…" : content.ctaLabel}
            </button>
          </div>

          <p
            id="newsletter-feedback"
            role="status"
            aria-live="polite"
            className={`mt-3 min-h-[1.25rem] text-sm ${
              feedback?.tone === "error" ? "text-error" : "text-accent-dark"
            }`}
          >
            {feedback?.message ?? ""}
          </p>

          <p id="newsletter-consent" className="mt-2 text-xs text-foreground-muted">
            {content.consentText}{" "}
            <AppLink href={content.privacyHref} className="underline hover:text-accent-dark">
              Politique de confidentialité
            </AppLink>
          </p>

          {isDemo && <p className="mt-2 text-xs text-foreground-muted">{NEWSLETTER_DEMO_NOTICE}</p>}
        </form>
      </div>
    </section>
  );
}
