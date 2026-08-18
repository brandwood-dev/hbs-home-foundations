import { Clock, X } from "lucide-react";
import type { RecentSearch } from "@/domain/search/search.types";
import { popularSearches } from "@/fixtures/search.fixture";

interface SearchRecentQueriesProps {
  recentSearches: RecentSearch[];
  onSelect: (query: string) => void;
  onRemove: (normalizedQuery: string) => void;
  onClear: () => void;
}

export function SearchRecentQueries({
  recentSearches,
  onSelect,
  onRemove,
  onClear,
}: SearchRecentQueriesProps) {
  return (
    <div className="px-3 pb-4 pt-3">
      {recentSearches.length > 0 && (
        <section className="mb-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-muted">
              Recherches récentes
            </p>
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-foreground-muted underline hover:text-accent-dark"
            >
              Effacer
            </button>
          </div>
          <ul className="mt-2 space-y-1">
            {recentSearches.map((item) => (
              <li key={item.normalizedQuery} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelect(item.query)}
                  className="flex flex-1 items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-surface-muted"
                >
                  <Clock className="h-3.5 w-3.5 text-foreground-muted" aria-hidden="true" />
                  {item.query}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(item.normalizedQuery)}
                  aria-label={`Retirer « ${item.query} » de l'historique`}
                  className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-muted"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-muted">
          Recherches populaires
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {popularSearches.map((item) => (
            <button
              key={item.query}
              type="button"
              onClick={() => onSelect(item.query)}
              className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-accent hover:text-accent-dark"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
