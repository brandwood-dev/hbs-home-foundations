import { ArrowRight } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import type {
  HomePromoBannerContent,
  HomePromoBannerMessage,
} from "@/domain/content/home-content.types";

function isInternalHref(href: string): boolean {
  if (href.startsWith("/")) return true;
  try {
    return new URL(href, "https://hbs-home.local").origin === "https://hbs-home.local";
  } catch {
    return false;
  }
}

function PromoMessage({
  message,
  isDuplicate = false,
}: {
  message: HomePromoBannerMessage;
  isDuplicate?: boolean;
}) {
  const content = (
    <span className="inline-flex items-center gap-2">
      {message.label ? <span className="font-medium">{message.label}</span> : null}
      <span>{message.text}</span>
      {message.href ? <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
    </span>
  );

  if (!message.href) return content;
  if (isInternalHref(message.href)) {
    return (
      <AppLink
        href={message.href}
        tabIndex={isDuplicate ? -1 : undefined}
        className="inline-flex min-h-11 items-center rounded-sm px-2 text-accent-foreground transition-colors hover:text-accent-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-dark focus-visible:ring-offset-2"
      >
        {content}
      </AppLink>
    );
  }
  return (
    <a
      href={message.href}
      tabIndex={isDuplicate ? -1 : undefined}
      className="inline-flex min-h-11 items-center rounded-sm px-2 text-accent-foreground transition-colors hover:text-accent-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-dark focus-visible:ring-offset-2"
    >
      {content}
    </a>
  );
}

export function HomePromoBanner({ content }: { content: HomePromoBannerContent }) {
  const messages = content.isEnabled
    ? content.messages
        .filter((message) => message.isEnabled && message.text.trim())
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  if (messages.length === 0) return null;
  const shouldAnimate = messages.length > 1;
  const duplicateMessages = shouldAnimate ? [...messages, ...messages] : messages;

  return (
    <div
      className="border-b border-border bg-accent text-accent-foreground"
      role="region"
      aria-label="Banderole promotionnelle"
    >
      <div className="mx-auto flex min-h-11 max-w-7xl items-center overflow-hidden px-4 py-0 text-center text-sm sm:px-6">
        <div
          className={
            shouldAnimate
              ? "marquee-track flex w-max shrink-0 items-center gap-12"
              : "mx-auto flex items-center"
          }
        >
          {duplicateMessages.map((message, index) => (
            <span
              key={`${message.id}-${index}`}
              className="shrink-0 whitespace-nowrap"
              {...(index >= messages.length && shouldAnimate ? { "aria-hidden": true } : {})}
            >
              <PromoMessage message={message} isDuplicate={index >= messages.length} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
