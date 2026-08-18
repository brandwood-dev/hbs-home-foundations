import { createFileRoute, redirect } from "@tanstack/react-router";
import { EMPTY_SEARCH } from "@/services/catalog/catalog.search-params";

/** Ancienne URL conservée : redirection permanente vers la sous-catégorie Accessoires. */
export const Route = createFileRoute("/embrasses")({
  beforeLoad: () => {
    throw redirect({ to: "/accessoires/embrasses", search: EMPTY_SEARCH, statusCode: 301 });
  },
  component: () => null,
});
