import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { OrderTrackingPage } from "@/components/order-tracking/OrderTrackingPage";

const title = "Suivre ma commande | HBS HOME";
const description =
  "Consultez l'état de votre commande HBS HOME avec votre numéro de commande et votre téléphone.";

export const Route = createFileRoute("/suivi-commande")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: SuiviCommandePage,
});

function SuiviCommandePage() {
  return (
    <SiteLayout>
      <OrderTrackingPage />
    </SiteLayout>
  );
}
