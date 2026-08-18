import { createFileRoute, redirect } from "@tanstack/react-router";

/** Ancienne URL conservée : redirection permanente vers la sous-catégorie Accessoires. */
export const Route = createFileRoute("/tringles")({
  beforeLoad: () => {
    throw redirect({ to: "/accessoires/tringles", statusCode: 301 });
  },
  component: () => null,
});
