import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { HomeHero } from "@/components/home/HomeHero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";

const title = "HBS HOME — Rideaux, voilages et stores en Tunisie";
const description =
  "Rideaux, voilages, stores, coussins et accessoires pour habiller votre intérieur. Livraison partout en Tunisie et paiement à la livraison.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <HomeHero />
      <TrustStrip />
      <FeaturedCollections />
    </SiteLayout>
  );
}
