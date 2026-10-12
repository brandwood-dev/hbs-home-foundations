import { useEffect, useRef, useState } from "react";
import { Banknote, MessageCircle, PackageCheck, Truck } from "lucide-react";
import type { HomeTrustIcon, HomeTrustItem } from "@/domain/content/home-content.types";

const icons: Record<HomeTrustIcon, typeof Truck> = {
  truck: Truck,
  banknote: Banknote,
  "package-check": PackageCheck,
  "message-circle": MessageCircle,
};

export function TrustStrip({ items }: { items: HomeTrustItem[] }) {
  const carouselRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (items.length < 2 || isPaused || prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      const nextIndex = (activeIndex + 1) % items.length;
      const carousel = carouselRef.current;
      if (carousel) {
        carousel.scrollTo({ left: nextIndex * carousel.clientWidth, behavior: "smooth" });
      }
      setActiveIndex(nextIndex);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [activeIndex, isPaused, items.length, prefersReducedMotion]);

  const handleScroll = () => {
    const carousel = carouselRef.current;
    if (!carousel || carousel.clientWidth === 0) return;
    setActiveIndex(Math.round(carousel.scrollLeft / carousel.clientWidth));
  };

  const goToSlide = (index: number) => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.scrollTo({ left: index * carousel.clientWidth, behavior: "smooth" });
    }
    setActiveIndex(index);
  };

  if (items.length === 0) return null;

  return (
    <section aria-label="Nos engagements" className="border-y border-border bg-surface">
      <ul
        ref={carouselRef}
        onScroll={handleScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        className="mx-auto flex max-w-7xl snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-6 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-6 lg:py-8"
      >
        {items.map((item) => {
          const Icon = icons[item.icon];
          return (
            <li
              key={item.id}
              className="flex min-w-full snap-start items-start gap-3 pr-6 lg:min-w-0 lg:pr-0"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold leading-snug">{item.label}</p>
                <p className="mt-1 text-xs text-foreground-muted">{item.description}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div
        className="flex justify-center gap-1 pb-4 lg:hidden"
        aria-label="Navigation des engagements"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Afficher ${item.label}`}
            aria-current={activeIndex === index ? "true" : undefined}
            onClick={() => goToSlide(index)}
            className="flex min-h-11 min-w-11 items-center justify-center"
          >
            <span
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === index ? "w-6 bg-accent" : "w-1.5 bg-border-strong"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
