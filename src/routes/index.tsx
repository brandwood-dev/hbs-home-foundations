import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { HomePage } from "@/components/home/HomePage";
import { homeContentQuery } from "@/hooks/content/useHomeContent";

const title = "HBS HOME — Rideaux, voilages et stores en Tunisie";
const description =
  "Rideaux, voilages, stores, coussins et accessoires pour habiller votre intérieur. Livraison partout en Tunisie et paiement à la livraison.";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(homeContentQuery());
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <HomePage />
    </SiteLayout>
  );
}
