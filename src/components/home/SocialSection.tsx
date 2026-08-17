import { HomeSectionHeading } from "@/components/home/HomeSectionStates";
import { AppLink } from "@/components/ui/app-link";
import type { SocialContent } from "@/domain/content/home-content.types";

/** Masquée tant qu'aucun contenu social réel n'est fourni. */
export function SocialSection({ content }: { content: SocialContent }) {
  if (content.items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24" aria-labelledby="home-social">
      <HomeSectionHeading id="home-social" eyebrow="Communauté" title={content.title} />

      <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {content.items.map((item) => (
          <li key={item.id} className="overflow-hidden rounded-sm bg-surface-muted">
            {item.href ? (
              <a href={item.href} target="_blank" rel="noreferrer noopener">
                <img
                  src={item.imageUrl}
                  alt={item.alt}
                  loading="lazy"
                  width={400}
                  height={400}
                  className="aspect-square w-full object-cover"
                />
              </a>
            ) : (
              <img
                src={item.imageUrl}
                alt={item.alt}
                loading="lazy"
                width={400}
                height={400}
                className="aspect-square w-full object-cover"
              />
            )}
          </li>
        ))}
      </ul>

      {content.cta && (
        <AppLink
          href={content.cta.href}
          className="mt-8 inline-flex min-h-[48px] items-center rounded-sm border border-taupe/50 px-6 text-sm hover:border-accent hover:text-accent-dark"
        >
          {content.cta.label}
        </AppLink>
      )}
    </section>
  );
}
