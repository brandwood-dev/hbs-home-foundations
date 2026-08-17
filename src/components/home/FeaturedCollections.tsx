import { CollectionCard } from "@/components/home/CollectionCard";
import { HomeSectionHeading } from "@/components/home/HomeSectionStates";
import type { HomeCollection } from "@/domain/content/home-content.types";

export function FeaturedCollections({ collections }: { collections: HomeCollection[] }) {
  if (collections.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24" aria-labelledby="home-collections">
      <HomeSectionHeading
        id="home-collections"
        eyebrow="Collections"
        title="Habillez chaque pièce selon votre style"
      />

      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  );
}
