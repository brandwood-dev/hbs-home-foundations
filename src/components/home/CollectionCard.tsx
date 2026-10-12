import { ArrowRight } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import type { Collection } from "@/types/home.types";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <AppLink
      href={collection.href}
      className="group flex h-full flex-col transition-transform duration-300 motion-safe:hover:-translate-y-1"
    >
      <div className="media-frame-editorial shrink-0 overflow-hidden rounded-sm bg-surface-muted">
        <img
          src={collection.image.src}
          alt={collection.image.alt}
          loading="lazy"
          width={1200}
          height={900}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <h3 className="mt-4 min-h-[3.5rem] line-clamp-2 text-xl">{collection.title}</h3>
      <p className="mt-1 min-h-[4.5rem] line-clamp-3 text-sm text-foreground-muted">
        {collection.description}
      </p>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm text-accent-dark">
        Découvrir
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </AppLink>
  );
}
