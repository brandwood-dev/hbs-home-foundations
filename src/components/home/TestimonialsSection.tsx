import { Star } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/HomeSectionStates";
import type { TestimonialContent } from "@/domain/content/home-content.types";

/**
 * Aucun faux avis : la section reste masquée tant qu'aucun avis réel validé
 * n'est fourni par le backend / CMS.
 */
export function TestimonialsSection({ testimonials }: { testimonials: TestimonialContent[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24" aria-labelledby="home-testimonials">
      <HomeSectionHeading id="home-testimonials" eyebrow="Avis" title="Ils nous font confiance" />

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <li key={testimonial.id} className="rounded-sm border border-border bg-surface p-6">
            <p
              className="flex items-center gap-1"
              aria-label={`Note : ${testimonial.rating} sur 5`}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  aria-hidden="true"
                  className={`h-4 w-4 ${
                    index < Math.round(testimonial.rating)
                      ? "fill-accent text-accent"
                      : "text-border"
                  }`}
                />
              ))}
            </p>
            <p className="mt-4 text-sm leading-relaxed">{testimonial.text}</p>
            <p className="mt-4 text-xs text-foreground-muted">
              {testimonial.customerFirstName}
              {testimonial.city ? ` · ${testimonial.city}` : ""}
              {testimonial.isVerifiedPurchase ? " · Achat vérifié" : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
