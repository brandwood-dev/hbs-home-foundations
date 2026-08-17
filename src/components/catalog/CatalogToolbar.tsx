import { SlidersHorizontal } from "lucide-react";
import { SORT_OPTIONS } from "@/domain/product/product.constants";
import type { CatalogSort } from "@/domain/product/product.types";

interface CatalogToolbarProps {
  total: number;
  sort: CatalogSort;
  activeFilterCount: number;
  onSortChange: (sort: CatalogSort) => void;
  onOpenFilters: () => void;
}

export function CatalogToolbar({
  total,
  sort,
  activeFilterCount,
  onSortChange,
  onOpenFilters,
}: CatalogToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
      <p className="text-sm text-foreground-muted" aria-live="polite">
        {total} produit{total > 1 ? "s" : ""}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filtrer
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-accent px-1.5 text-[10px] leading-4 text-accent-foreground">
              {activeFilterCount}
            </span>
          )}
        </button>

        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only sm:not-sr-only sm:text-foreground-muted">Trier par</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as CatalogSort)}
            className="min-h-11 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
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
