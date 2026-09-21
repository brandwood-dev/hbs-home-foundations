import { SlidersHorizontal } from "lucide-react";
import { SORT_OPTIONS } from "@/domain/product/product.constants";
import type { CatalogSort } from "@/domain/product/product.types";

interface CatalogToolbarProps {
  total: number;
  sort: CatalogSort;
  activeFilterCount: number;
  filtersOpen?: boolean;
  onSortChange: (sort: CatalogSort) => void;
  onOpenFilters: () => void;
}

export function CatalogToolbar({
  total,
  sort,
  activeFilterCount,
  filtersOpen = false,
  onSortChange,
  onOpenFilters,
}: CatalogToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="shrink-0 text-sm text-foreground-muted" aria-live="polite">
        {total} produit{total > 1 ? "s" : ""}
      </p>

      <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
        <button
          type="button"
          onClick={onOpenFilters}
          aria-expanded={filtersOpen}
          aria-controls="catalog-mobile-filters-dialog"
          className="inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-md border border-border px-2 text-sm lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filtrer
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-accent px-1.5 text-[10px] leading-4 text-accent-foreground">
              {activeFilterCount}
            </span>
          )}
        </button>

        <label className="flex min-w-0 items-center gap-2 text-sm">
          <span className="sr-only sm:not-sr-only sm:text-foreground-muted">Trier par</span>
          <select
            aria-label="Trier les produits"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as CatalogSort)}
            className="min-h-11 w-full min-w-0 max-w-full truncate rounded-md border border-border bg-surface px-2 text-sm text-foreground sm:w-auto sm:min-w-[12rem] sm:px-3"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
