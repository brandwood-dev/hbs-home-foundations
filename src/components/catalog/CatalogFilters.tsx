import { Lock } from "lucide-react";
import { FilterGroup } from "@/components/catalog/FilterGroup";
import type { CatalogFacets, FacetOption } from "@/services/catalog/catalog.filters";
import type { CatalogSearch } from "@/services/catalog/catalog.search-params";
import { toUnits } from "@/lib/money/money";

interface CatalogFiltersProps {
  facets: CatalogFacets;
  search: CatalogSearch;
  lockedFilterLabel?: string;
  onToggle: (key: keyof CatalogSearch, value: string | number) => void;
  onPriceChange: (min?: number, max?: number) => void;
}

function CheckboxRow({
  option,
  checked,
  onChange,
}: {
  option: FacetOption;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-[var(--color-accent)]"
      />
      {option.swatch && (
        <span
          className="h-4 w-4 shrink-0 rounded-full border border-border"
          style={{ backgroundColor: option.swatch }}
          aria-hidden="true"
        />
      )}
      <span className="flex-1 text-foreground-muted">{option.label}</span>
      <span className="text-xs text-taupe">{option.count}</span>
    </label>
  );
}

export function CatalogFilters({
  facets,
  search,
  lockedFilterLabel,
  onToggle,
  onPriceChange,
}: CatalogFiltersProps) {
  const groups: {
    key: keyof CatalogSearch;
    title: string;
    options: FacetOption[];
    numeric?: boolean;
  }[] = [
    { key: "materials", title: "Matière", options: facets.materials },
    { key: "colors", title: "Couleur", options: facets.colors },
    { key: "opacity", title: "Opacité", options: facets.opacity },
    { key: "headers", title: "Finition", options: facets.headers },
    { key: "patterns", title: "Motif", options: facets.patterns },
    { key: "blindTypes", title: "Type de store", options: facets.blindTypes },
    { key: "accessoryTypes", title: "Type d'accessoire", options: facets.accessoryTypes },
    { key: "furnitureTypes", title: "Type de meuble", options: facets.furnitureTypes },
    { key: "furnitureRooms", title: "Pièce", options: facets.furnitureRooms },
    { key: "furnitureStyles", title: "Style", options: facets.furnitureStyles },
    { key: "plantTypes", title: "Type de plante", options: facets.plantTypes },
    { key: "plantNatures", title: "Nature", options: facets.plantNatures },
    { key: "plantSizes", title: "Taille", options: facets.plantSizes },
    { key: "plantCareLevels", title: "Entretien", options: facets.plantCareLevels },
    { key: "plantLightNeeds", title: "Luminosité", options: facets.plantLightNeeds },
    { key: "shapes", title: "Forme", options: facets.shapes },
    { key: "contents", title: "Contenu", options: facets.contents },
    { key: "fastenings", title: "Fixation", options: facets.fastenings },
    { key: "finishes", title: "Finition métal", options: facets.finishes },
    { key: "mountings", title: "Pose", options: facets.mountings },
    { key: "controlSides", title: "Côté de manœuvre", options: facets.controlSides },
    { key: "widths", title: "Largeur", options: facets.widths, numeric: true },
    { key: "heights", title: "Hauteur", options: facets.heights, numeric: true },
    { key: "availability", title: "Disponibilité", options: facets.availability },
  ];

  return (
    <div>
      {lockedFilterLabel && (
        <p className="mb-3 flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2 text-xs text-foreground-muted">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          {lockedFilterLabel}
        </p>
      )}

      {groups
        .filter((group) => group.options.length > 1)
        .map((group) => {
          const selected = search[group.key] as (string | number)[];
          return (
            <FilterGroup key={group.key} title={group.title} activeCount={selected.length}>
              <div className="max-h-64 overflow-y-auto pr-1">
                {group.options.map((option) => (
                  <CheckboxRow
                    key={option.value}
                    option={option}
                    checked={selected.some((entry) => String(entry) === option.value)}
                    onChange={() =>
                      onToggle(group.key, group.numeric ? Number(option.value) : option.value)
                    }
                  />
                ))}
              </div>
            </FilterGroup>
          );
        })}

      <FilterGroup
        title="Prix"
        activeCount={(search.minPrice != null ? 1 : 0) + (search.maxPrice != null ? 1 : 0)}
      >
        <div className="flex items-end gap-3 pt-1">
          <label className="flex-1 text-xs text-foreground-muted">
            Min (DT)
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={search.minPrice ?? ""}
              placeholder={String(toUnits(facets.priceMinMinor))}
              onChange={(event) =>
                onPriceChange(
                  event.target.value === "" ? undefined : Number(event.target.value),
                  search.maxPrice,
                )
              }
              className="mt-1 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
            />
          </label>
          <label className="flex-1 text-xs text-foreground-muted">
            Max (DT)
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={search.maxPrice ?? ""}
              placeholder={String(toUnits(facets.priceMaxMinor))}
              onChange={(event) =>
                onPriceChange(
                  search.minPrice,
                  event.target.value === "" ? undefined : Number(event.target.value),
                )
              }
              className="mt-1 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
            />
          </label>
        </div>
      </FilterGroup>
    </div>
  );
}
