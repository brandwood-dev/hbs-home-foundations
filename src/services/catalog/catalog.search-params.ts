import { DEFAULT_PAGE_SIZE, SORT_VALUES } from "@/domain/product/product.constants";
import type { CatalogSort } from "@/domain/product/product.types";
import type { CatalogScope, ProductListParams } from "@/repositories/interfaces/ProductRepository";

export interface CatalogSearch {
  materials: string[];
  colors: string[];
  opacity: string[];
  headers: string[];
  patterns: string[];
  blindTypes: string[];
  mountings: string[];
  controlSides: string[];
  shapes: string[];
  contents: string[];
  fastenings: string[];
  accessoryTypes: string[];
  finishes: string[];
  furnitureTypes: string[];
  furnitureRooms: string[];
  furnitureStyles: string[];
  plantNatures: string[];
  plantTypes: string[];
  plantSizes: string[];
  plantCareLevels: string[];
  plantLightNeeds: string[];
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
  patterns: [],
  blindTypes: [],
  mountings: [],
  controlSides: [],
  shapes: [],
  contents: [],
  fastenings: [],
  accessoryTypes: [],
  finishes: [],
  furnitureTypes: [],
  furnitureRooms: [],
  furnitureStyles: [],
  plantNatures: [],
  plantTypes: [],
  plantSizes: [],
  plantCareLevels: [],
  plantLightNeeds: [],
  widths: [],
  heights: [],
  availability: [],
  sort: "recommended",
  page: 1,
};

/** Groupes de filtres à valeurs multiples, dans l'ordre d'affichage. */
export const LIST_FILTER_KEYS = [
  "materials",
  "colors",
  "opacity",
  "headers",
  "patterns",
  "blindTypes",
  "mountings",
  "controlSides",
  "shapes",
  "contents",
  "fastenings",
  "accessoryTypes",
  "finishes",
  "furnitureTypes",
  "furnitureRooms",
  "furnitureStyles",
  "plantNatures",
  "plantTypes",
  "plantSizes",
  "plantCareLevels",
  "plantLightNeeds",
  "widths",
  "heights",
  "availability",
] as const;

export type ListFilterKey = (typeof LIST_FILTER_KEYS)[number];

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
    patterns: parseList(search["patterns"]),
    blindTypes: parseList(search["blindTypes"]),
    mountings: parseList(search["mountings"]),
    controlSides: parseList(search["controlSides"]),
    shapes: parseList(search["shapes"]),
    contents: parseList(search["contents"]),
    fastenings: parseList(search["fastenings"]),
    accessoryTypes: parseList(search["accessoryTypes"]),
    finishes: parseList(search["finishes"]),
    furnitureTypes: parseList(search["furnitureTypes"]),
    furnitureRooms: parseList(search["furnitureRooms"]),
    furnitureStyles: parseList(search["furnitureStyles"]),
    plantNatures: parseList(search["plantNatures"]),
    plantTypes: parseList(search["plantTypes"]),
    plantSizes: parseList(search["plantSizes"]),
    plantCareLevels: parseList(search["plantCareLevels"]),
    plantLightNeeds: parseList(search["plantLightNeeds"]),
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
  for (const key of LIST_FILTER_KEYS) {
    const values = search[key] as (string | number)[];
    if (values.length > 0) out[key] = values.join(",");
  }
  if (search["minPrice"] != null) out["minPrice"] = search["minPrice"];
  if (search["maxPrice"] != null) out["maxPrice"] = search["maxPrice"];
  if (search["sort"] !== "recommended") out["sort"] = search["sort"];
  if (search["page"] > 1) out["page"] = search["page"];
  return out;
}

export function countActiveFilters(search: CatalogSearch): number {
  const lists = LIST_FILTER_KEYS.reduce(
    (total, key) => total + (search[key] as unknown[]).length,
    0,
  );
  return lists + (search["minPrice"] != null ? 1 : 0) + (search["maxPrice"] != null ? 1 : 0);
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
    categories: scope?.categories,
    categorySlugs: scope?.categorySlugs,
    materials: mergeUnique(scope?.materials, search["materials"] as never[]),
    opacityLevels: mergeUnique(scope?.opacityLevels, search["opacity"] as never[]),
    curtainHeaders: mergeUnique(scope?.curtainHeaders, search["headers"] as never[]),
    patterns: mergeUnique(scope?.patterns, search["patterns"] as never[]),
    blindTypes: mergeUnique(scope?.blindTypes, search["blindTypes"] as never[]),
    mountings: mergeUnique(scope?.mountings, search["mountings"] as never[]),
    controlSides:
      search["controlSides"].length > 0 ? (search["controlSides"] as never[]) : undefined,
    shapes: mergeUnique(scope?.shapes, search["shapes"]),
    accessoryTypes: mergeUnique(scope?.accessoryTypes, search["accessoryTypes"] as never[]),
    cushionContents: search["contents"].length > 0 ? (search["contents"] as never[]) : undefined,
    chairPadFastenings:
      search["fastenings"].length > 0 ? (search["fastenings"] as never[]) : undefined,
    accessoryFinishes: search["finishes"].length > 0 ? (search["finishes"] as never[]) : undefined,
    furnitureTypes: mergeUnique(scope?.furnitureTypes, search["furnitureTypes"] as never[]),
    furnitureRooms: mergeUnique(scope?.furnitureRooms, search["furnitureRooms"] as never[]),
    furnitureStyles: mergeUnique(scope?.furnitureStyles, search["furnitureStyles"] as never[]),
    plantNatures: mergeUnique(scope?.plantNatures, search["plantNatures"] as never[]),
    plantTypes: mergeUnique(scope?.plantTypes, search["plantTypes"] as never[]),
    plantSizes: mergeUnique(scope?.plantSizes, search["plantSizes"] as never[]),
    plantCareLevels:
      search["plantCareLevels"].length > 0 ? (search["plantCareLevels"] as never[]) : undefined,
    plantLightNeeds:
      search["plantLightNeeds"].length > 0 ? (search["plantLightNeeds"] as never[]) : undefined,
    sellingMode: scope?.sellingMode,
    onlyThermal: scope?.onlyThermal,
    onlyLargeWidth: scope?.onlyLargeWidth,
    colors: search["colors"].length > 0 ? search["colors"] : undefined,
    widths: search["widths"].length > 0 ? search["widths"] : undefined,
    heights: search["heights"].length > 0 ? search["heights"] : undefined,
    availability:
      search["availability"].length > 0 ? (search["availability"] as never[]) : undefined,
    minPriceMinor: search["minPrice"] != null ? search["minPrice"] * 1000 : undefined,
    maxPriceMinor: search["maxPrice"] != null ? search["maxPrice"] * 1000 : undefined,
    sort: search["sort"],
  };
}
