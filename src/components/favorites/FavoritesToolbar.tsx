import { CATEGORY_LABELS } from "@/domain/product/product.constants";
import type { ProductCategory } from "@/domain/product/product.types";
import { FAVORITES_SORT_LABELS, type FavoritesSort } from "@/services/favorites/favorites-sort";
import { cn } from "@/lib/utils";

interface FavoritesToolbarProps {
  counts: Partial<Record<ProductCategory, number>>;
  total: number;
  activeCategory: ProductCategory | undefined;
  sort: FavoritesSort;
  onCategoryChange: (category: ProductCategory | undefined) => void;
  onSortChange: (sort: FavoritesSort) => void;
}

export function FavoritesToolbar({
  counts,
  total,
  activeCategory,
  sort,
  onCategoryChange,
  onSortChange,
}: FavoritesToolbarProps) {
  const categories = (Object.keys(counts) as ProductCategory[]).filter(
    (category) => (counts[category] ?? 0) > 0,
  );

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
      {categories.length > 1 ? (
        <div
          role="group"
          aria-label="Filtrer les favoris par catégorie"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        >
          <CategoryChip
            label={`Tous (${total})`}
            active={!activeCategory}
            onClick={() => onCategoryChange(undefined)}
          />
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={`${CATEGORY_LABELS[category]} (${counts[category]})`}
              active={activeCategory === category}
              onClick={() => onCategoryChange(category)}
            />
          ))}
        </div>
      ) : (
        <span />
      )}

      <label className="flex shrink-0 items-center gap-2 text-sm">
        <span className="text-foreground-muted">Trier par</span>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as FavoritesSort)}
          className="h-11 rounded-md border border-border bg-background px-3 text-sm"
        >
          {(Object.keys(FAVORITES_SORT_LABELS) as FavoritesSort[]).map((value) => (
            <option key={value} value={value}>
              {FAVORITES_SORT_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-11 shrink-0 rounded-full border px-4 text-sm whitespace-nowrap transition-colors",
        active
          ? "border-accent bg-accent/10 text-accent-dark"
          : "border-border hover:border-accent hover:text-accent-dark",
      )}
    >
      {label}
    </button>
  );
}
