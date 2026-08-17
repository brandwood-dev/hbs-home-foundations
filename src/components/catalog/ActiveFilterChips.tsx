import { X } from "lucide-react";
import type { CatalogFacets } from "@/services/catalog/catalog.filters";
import type { CatalogSearch } from "@/services/catalog/catalog.search-params";

interface ActiveFilterChipsProps {
  facets: CatalogFacets;
  search: CatalogSearch;
  onToggle: (key: keyof CatalogSearch, value: string | number) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onReset: () => void;
}

const GROUPS: { key: keyof CatalogSearch; facet: keyof CatalogFacets; numeric?: boolean }[] = [
  { key: "materials", facet: "materials" },
  { key: "colors", facet: "colors" },
  { key: "opacity", facet: "opacity" },
  { key: "headers", facet: "headers" },
  { key: "widths", facet: "widths", numeric: true },
  { key: "heights", facet: "heights", numeric: true },
  { key: "availability", facet: "availability" },
];

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs text-foreground transition-colors hover:border-accent hover:text-accent-dark"
    >
      {label}
      <X className="h-3 w-3" aria-hidden="true" />
      <span className="sr-only">Retirer le filtre</span>
    </button>
  );
}

export function ActiveFilterChips({
  facets,
  search,
  onToggle,
  onPriceChange,
  onReset,
}: ActiveFilterChipsProps) {
  const chips: { label: string; onRemove: () => void }[] = [];

  for (const group of GROUPS) {
    const selected = search[group.key] as (string | number)[];
    const options = facets[group.facet] as { value: string; label: string }[];
    for (const value of selected) {
      const option = options.find((entry) => entry.value === String(value));
      chips.push({
        label: option?.label ?? String(value),
        onRemove: () => onToggle(group.key, value),
      });
    }
  }

  if (search.minPrice != null) {
    chips.push({
      label: `Min ${search.minPrice} DT`,
      onRemove: () => onPriceChange(undefined, search.maxPrice),
    });
  }
  if (search.maxPrice != null) {
    chips.push({
      label: `Max ${search.maxPrice} DT`,
      onRemove: () => onPriceChange(search.minPrice, undefined),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip, index) => (
        <Chip key={`${chip.label}-${index}`} label={chip.label} onRemove={chip.onRemove} />
      ))}
      <button
        type="button"
        onClick={onReset}
        className="min-h-9 px-2 text-xs text-accent-dark underline underline-offset-4"
      >
        Tout effacer
      </button>
    </div>
  );
}
