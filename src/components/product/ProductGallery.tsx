import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/domain/product/product.types";

interface ProductGalleryProps {
  images: ProductImage[];
  /** Image mise en avant lorsque la variante change. */
  activeImageId?: string | undefined;
}

export function ProductGallery({ images, activeImageId }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeImageId) return;
    const next = images.findIndex((image) => image.id === activeImageId);
    if (next >= 0) setIndex(next);
  }, [activeImageId, images]);

  useEffect(() => {
    setZoomed(false);
  }, [index]);

  const total = images.length;
  const current = images[Math.min(index, total - 1)];
  if (!current) return null;

  const go = (delta: number) => setIndex((prev) => (prev + delta + total) % total);

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-start lg:gap-4">
      <div className="flex gap-2 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible">
        {images.map((image, imageIndex) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setIndex(imageIndex)}
            aria-label={`Voir l'image ${imageIndex + 1} sur ${total}`}
            aria-current={imageIndex === index}
            className={`h-20 w-16 shrink-0 overflow-hidden rounded-sm border transition-colors lg:h-24 lg:w-full ${
              imageIndex === index ? "border-accent" : "border-border hover:border-taupe"
            }`}
          >
            <img
              src={image.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <div
        ref={trackRef}
        className="relative w-full flex-1 overflow-hidden rounded-md bg-surface-muted lg:sticky lg:top-24"
        tabIndex={0}
        role="group"
        aria-roledescription="galerie"
        aria-label="Images du produit"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            go(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(-1);
          }
        }}
      >
        <div className="aspect-[3/4] w-full">
          <img
            src={current.url}
            alt={current.alt}
            width={1024}
            height={1365}
            decoding="async"
            onClick={() => setZoomed((value) => !value)}
            className={`h-full w-full object-cover transition-transform duration-500 ${
              zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            }`}
          />
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Image précédente"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/85 text-foreground hover:bg-surface"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Image suivante"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/85 text-foreground hover:bg-surface"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="absolute bottom-2 right-2 rounded-full bg-foreground/70 px-2 py-1 text-[11px] text-surface">
              {index + 1} / {total}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
