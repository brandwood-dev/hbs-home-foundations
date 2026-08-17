import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "FAQ — HBS HOME";
const description = "FAQ — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return <PlaceholderPage title="FAQ" />;
}
