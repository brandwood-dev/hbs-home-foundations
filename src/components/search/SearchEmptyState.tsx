import { AppLink } from "@/components/ui/app-link";
import { popularSearches } from "@/fixtures/search.fixture";

interface SearchEmptyStateProps {
  query: string;
  onSuggestionClick?: (query: string) => void;
  compact?: boolean;
}

const HELP_LINKS = [
  { label: "Tous les rideaux", href: "/rideaux" },
  { label: "Voilages", href: "/voilages" },
  { label: "Stores", href: "/stores" },
  { label: "Coussins", href: "/coussins" },
];

export function SearchEmptyState({
  query,
  onSuggestionClick,
  compact = false,
}: SearchEmptyStateProps) {
  return (
    <div className={compact ? "px-3 py-6" : "py-14 text-center"}>
      <p className="text-base">
        Aucun résultat pour <span className="font-semibold">« {query} »</span>
      </p>
      <p className="mt-2 text-sm text-foreground-muted">
        Vérifiez l'orthographe, essayez un terme plus général ou explorez nos catégories.
      </p>

      <div className={`mt-5 flex flex-wrap gap-2 ${compact ? "" : "justify-center"}`}>
        {popularSearches.slice(0, 4).map((item) => (
          <button
            key={item.query}
            type="button"
            onClick={() => onSuggestionClick?.(item.query)}
            className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-accent hover:text-accent-dark"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={`mt-6 flex flex-wrap gap-3 text-sm ${compact ? "" : "justify-center"}`}>
        {HELP_LINKS.map((link) => (
          <AppLink key={link.href} href={link.href} className="underline hover:text-accent-dark">
            {link.label}
          </AppLink>
        ))}
      </div>
    </div>
  );
}
