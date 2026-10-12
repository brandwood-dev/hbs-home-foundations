import { useEffect, useState } from "react";
import { CollectionCard } from "@/components/home/CollectionCard";
import { HomeSectionHeading } from "@/components/home/HomeSectionStates";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { HomeCollection } from "@/domain/content/home-content.types";

export function FeaturedCollections({ collections }: { collections: HomeCollection[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!api) return;

    const updateCarouselState = () => {
      setSelectedIndex(api.selectedScrollSnap());
      setScrollSnaps(api.scrollSnapList());
    };

    updateCarouselState();
    api.on("select", updateCarouselState);
    api.on("reInit", updateCarouselState);

    return () => {
      api.off("select", updateCarouselState);
      api.off("reInit", updateCarouselState);
    };
  }, [api]);

  useEffect(() => {
    if (!api || isPaused || reduceMotion || collections.length < 2) return;

    const interval = window.setInterval(() => api.scrollNext(), 5500);
    return () => window.clearInterval(interval);
  }, [api, collections.length, isPaused, reduceMotion]);

  if (collections.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:py-14" aria-labelledby="home-collections">
      <HomeSectionHeading
        id="home-collections"
        eyebrow="Collections"
        title="Habillez chaque pièce selon votre style"
      />

      <div
        className="relative mt-8"
        onPointerEnter={() => setIsPaused(true)}
        onPointerLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsPaused(false);
          }
        }}
      >
        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: collections.length > 1, skipSnaps: false }}
          aria-label="Collections HBS HOME"
          className="px-0.5"
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {collections.map((collection) => (
              <CarouselItem
                key={collection.id}
                className="basis-[84%] pl-3 sm:basis-[58%] md:basis-1/2 md:pl-4 lg:basis-1/3"
              >
                <CollectionCard collection={collection} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            aria-label="Collection précédente"
            className="left-2 border-border bg-background/95 shadow-sm md:-left-4"
          />
          <CarouselNext
            aria-label="Collection suivante"
            className="right-2 border-border bg-background/95 shadow-sm md:-right-4"
          />
        </Carousel>

        {scrollSnaps.length > 1 && (
          <div
            className="mt-6 flex justify-center gap-2"
            aria-label="Position dans les collections"
          >
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Afficher la collection ${index + 1}`}
                aria-current={selectedIndex === index ? "true" : undefined}
                onClick={() => api?.scrollTo(index)}
                className={`h-1.5 rounded-full transition-all ${
                  selectedIndex === index ? "w-8 bg-accent" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
