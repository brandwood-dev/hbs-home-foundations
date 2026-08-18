import { Heart } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";

const SUGGESTIONS = [
  { label: "Rideaux", href: "/rideaux" },
  { label: "Voilages", href: "/voilages" },
  { label: "Stores", href: "/stores" },
  { label: "Coussins", href: "/coussins" },
  { label: "Accessoires", href: "/accessoires" },
];

export function FavoritesEmptyState() {
  return (
    <div className="py-16 text-center">
      <Heart className="mx-auto h-8 w-8 text-foreground-muted" aria-hidden="true" />
      <h2 className="mt-4 text-2xl">Votre liste de favoris est vide</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-foreground-muted">
        Touchez le cœur sur un article pour le retrouver ici. Vos favoris restent enregistrés sur
        cet appareil.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((item) => (
          <AppLink
            key={item.href}
            href={item.href}
            className="rounded-full border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent-dark"
          >
            {item.label}
          </AppLink>
        ))}
      </div>
    </div>
  );
}
