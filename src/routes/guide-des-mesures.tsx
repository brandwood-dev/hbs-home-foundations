import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Guide des mesures — HBS HOME";
const description = "Guide des mesures — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/guide-des-mesures")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: GuideDesMesuresPage,
});

function GuideDesMesuresPage() {
  return <PlaceholderPage title="Guide des mesures" />;
}
