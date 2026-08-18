import { createFileRoute } from "@tanstack/react-router";
import { MeasurementGuideView } from "@/components/measurement/MeasurementGuideView";

const title = "Guide des mesures rideaux et stores | HBS HOME";
const description =
  "Calculez en 4 étapes la largeur, la hauteur et le nombre de pans adaptés à votre fenêtre, puis découvrez les rideaux, voilages et stores compatibles.";

export const Route = createFileRoute("/guide-des-mesures")({
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
  component: GuideDesMesuresPage,
});

function GuideDesMesuresPage() {
  return <MeasurementGuideView />;
}
