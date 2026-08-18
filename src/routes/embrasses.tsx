import { createFileRoute, redirect } from "@tanstack/react-router";

/** Ancienne URL conservée : redirection permanente vers la sous-catégorie Accessoires. */
export const Route = createFileRoute("/embrasses")({
  beforeLoad: () => {
    throw redirect({ to: "/accessoires/embrasses", statusCode: 301 });
  },
  component: () => null,
});
