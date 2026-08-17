import { ArrowRight } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import type { Collection } from "@/types/home.types";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <AppLink href={collection.href} className="group block">
      <div className="overflow-hidden rounded-sm bg-surface-muted">
        <img
          src={collection.image.src}
          alt={collection.image.alt}
          loading="lazy"
          width={900}
          height={1100}
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:h-72 lg:h-80"
        />
      </div>
      <h3 className="mt-4 text-xl">{collection.title}</h3>
      <p className="mt-1 text-sm text-foreground-muted">{collection.description}</p>
      <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent-dark">
        Découvrir
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </AppLink>
  );
}
