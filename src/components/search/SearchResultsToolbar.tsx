import { CATEGORY_LABELS } from "@/domain/product/product.constants";
import type { ProductCategory } from "@/domain/product/product.types";
import { SEARCH_SORT_LABELS, SEARCH_SORT_VALUES } from "@/domain/search/search.constants";
import type { SearchSort } from "@/domain/search/search.types";

interface SearchResultsToolbarProps {
  total: number;
  categoryCounts: Partial<Record<ProductCategory, number>>;
  activeCategory?: ProductCategory | undefined;
  sort: SearchSort;
  onCategoryChange: (category: ProductCategory | undefined) => void;
  onSortChange: (sort: SearchSort) => void;
}

export function SearchResultsToolbar({
  total,
  categoryCounts,
  activeCategory,
  sort,
  onCategoryChange,
  onSortChange,
}: SearchResultsToolbarProps) {
  const entries = (Object.keys(categoryCounts) as ProductCategory[])
    .filter((category) => (categoryCounts[category] ?? 0) > 0)
    .sort((a, b) => (categoryCounts[b] ?? 0) - (categoryCounts[a] ?? 0));
  const allCount = entries.reduce((sum, category) => sum + (categoryCounts[category] ?? 0), 0);

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4">
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
        aria-label="Filtrer par catégorie"
      >
        <button
          type="button"
          onClick={() => onCategoryChange(undefined)}
          aria-pressed={!activeCategory}
          className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
            !activeCategory
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border hover:border-accent hover:text-accent-dark"
          }`}
        >
          Tout ({allCount})
        </button>
        {entries.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            aria-pressed={activeCategory === category}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
              activeCategory === category
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border hover:border-accent hover:text-accent-dark"
            }`}
          >
            {CATEGORY_LABELS[category]} ({categoryCounts[category]})
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm text-foreground-muted">
          {total} résultat{total > 1 ? "s" : ""}
        </p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-foreground-muted">Trier par</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SearchSort)}
            className="h-11 rounded-md border border-border bg-surface px-3 text-sm"
          >
            {SEARCH_SORT_VALUES.map((value) => (
              <option key={value} value={value}>
                {SEARCH_SORT_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
