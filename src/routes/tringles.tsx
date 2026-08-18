import { createFileRoute, redirect } from "@tanstack/react-router";
import { EMPTY_SEARCH } from "@/services/catalog/catalog.search-params";

/** Ancienne URL conservée : redirection permanente vers la sous-catégorie Accessoires. */
export const Route = createFileRoute("/tringles")({
  beforeLoad: () => {
    throw redirect({ to: "/accessoires/tringles", search: EMPTY_SEARCH, statusCode: 301 });
  },
  component: () => null,
});
