import { createFileRoute } from "@tanstack/react-router";
import { FavoritesPageView } from "@/components/favorites/FavoritesPageView";

const title = "Mes favoris — HBS HOME";
const description =
  "Retrouvez les rideaux, voilages, stores et accessoires HBS HOME que vous avez enregistrés.";

export const Route = createFileRoute("/favoris")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FavoritesPageView,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl">Vos favoris sont momentanément indisponibles</h1>
      <p className="mt-2 text-sm text-foreground-muted">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">Aucun favori.</div>
  ),
});
