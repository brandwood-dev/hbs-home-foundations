import { CollectionCard } from "@/components/home/CollectionCard";
import { featuredCollections } from "@/fixtures/home.fixture";

export function FeaturedCollections() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
      <div className="max-w-2xl">
        <p className="eyebrow">Collections</p>
        <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">
          Habillez chaque pièce selon votre style
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
        {featuredCollections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  );
}
