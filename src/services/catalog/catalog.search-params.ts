import { DEFAULT_PAGE_SIZE, SORT_VALUES } from "@/domain/product/product.constants";
import type { CatalogSort } from "@/domain/product/product.types";
import type { CatalogScope, ProductListParams } from "@/repositories/interfaces/ProductRepository";

export interface CatalogSearch {
  materials: string[];
  colors: string[];
  opacity: string[];
  headers: string[];
  widths: number[];
  heights: number[];
  availability: string[];
  minPrice?: number;
  maxPrice?: number;
  sort: CatalogSort;
  page: number;
}

export const EMPTY_SEARCH: CatalogSearch = {
  materials: [],
  colors: [],
  opacity: [],
  headers: [],
  widths: [],
  heights: [],
  availability: [],
  sort: "recommended",
  page: 1,
};

function parseList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.length > 0) return value.split(",").filter(Boolean);
  return [];
}

function parseNumberList(value: unknown): number[] {
  return parseList(value)
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry));
}

function parseNumber(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Tolerant validator: unknown values fall back to defaults instead of throwing. */
export function validateCatalogSearch(search: Record<string, unknown>): CatalogSearch {
  const sortCandidate = String(search["sort"] ?? "");
  const min = parseNumber(search["minPrice"]);
  const max = parseNumber(search["maxPrice"]);
  const page = parseNumber(search["page"]);

  return {
    materials: parseList(search["materials"]),
    colors: parseList(search["colors"]),
    opacity: parseList(search["opacity"]),
    headers: parseList(search["headers"]),
    widths: parseNumberList(search["widths"]),
    heights: parseNumberList(search["heights"]),
    availability: parseList(search["availability"]),
    ...(min != null ? { minPrice: min } : {}),
    ...(max != null ? { maxPrice: max } : {}),
    sort: (SORT_VALUES as string[]).includes(sortCandidate)
      ? (sortCandidate as CatalogSort)
      : "recommended",
    page: page != null && page >= 1 ? Math.trunc(page) : 1,
  };
}

/** Removes defaults so clean URLs stay clean. */
export function serializeCatalogSearch(search: CatalogSearch): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const list = (key: keyof CatalogSearch, values: (string | number)[]) => {
    if (values.length > 0) out[key] = values.join(",");
  };
  list("materials", search["materials"]);
  list("colors", search["colors"]);
  list("opacity", search["opacity"]);
  list("headers", search["headers"]);
  list("widths", search["widths"]);
  list("heights", search["heights"]);
  list("availability", search["availability"]);
  if (search["minPrice"] != null) out.minPrice = search["minPrice"];
  if (search["maxPrice"] != null) out.maxPrice = search["maxPrice"];
  if (search["sort"] !== "recommended") out.sort = search["sort"];
  if (search["page"] > 1) out.page = search["page"];
  return out;
}

export function countActiveFilters(search: CatalogSearch): number {
  return (
    search["materials"].length +
    search["colors"].length +
    search["opacity"].length +
    search["headers"].length +
    search["widths"].length +
    search["heights"].length +
    search["availability"].length +
    (search["minPrice"] != null ? 1 : 0) +
    (search["maxPrice"] != null ? 1 : 0)
  );
}

function mergeUnique<T>(scoped: T[] | undefined, selected: T[]): T[] | undefined {
  if (scoped && scoped.length > 0) {
    if (selected.length === 0) return scoped;
    const intersection = selected.filter((value) => scoped.includes(value));
    return intersection.length > 0 ? intersection : scoped;
  }
  return selected.length > 0 ? selected : undefined;
}

/** Combines the locked route scope with the user search params. */
export function toListParams(
  search: CatalogSearch,
  scope: CatalogScope | undefined,
  pageSize: number = DEFAULT_PAGE_SIZE,
): ProductListParams {
  return {
    page: search["page"],
    pageSize,
    materials: mergeUnique(scope?.materials, search["materials"] as never[]),
    opacityLevels: mergeUnique(scope?.opacityLevels, search["opacity"] as never[]),
    curtainHeaders: mergeUnique(scope?.curtainHeaders, search["headers"] as never[]),
    sellingMode: scope?.sellingMode,
    onlyThermal: scope?.onlyThermal,
    colors: search["colors"].length > 0 ? search["colors"] : undefined,
    widths: search["widths"].length > 0 ? search["widths"] : undefined,
    heights: search["heights"].length > 0 ? search["heights"] : undefined,
    availability: search["availability"].length > 0 ? (search["availability"] as never[]) : undefined,
    minPriceMinor: search["minPrice"] != null ? search["minPrice"] * 1000 : undefined,
    maxPriceMinor: search["maxPrice"] != null ? search["maxPrice"] * 1000 : undefined,
    sort: search["sort"],
  };
}
