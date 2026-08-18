import { mainNavigation } from "@/fixtures/navigation.fixture";
import type { CategorySearchHit } from "@/domain/search/search.types";
import {
  normalizeSearchQuery,
  tokenizeSearchQuery,
} from "@/services/search/normalize-search-query";

export interface CategoryIndexEntry {
  id: string;
  label: string;
  href: string;
  description?: string;
  terms: string;
}

/** Aplatit la navigation principale en entrées catégories/sous-catégories recherchables. */
export function buildCategoryIndex(): CategoryIndexEntry[] {
  const entries: CategoryIndexEntry[] = [];
  const seen = new Set<string>();

  const push = (label: string, href: string, parent?: string) => {
    if (seen.has(href)) return;
    seen.add(href);
    entries.push({
      id: href,
      label,
      href,
      ...(parent ? { description: parent } : {}),
      terms: normalizeSearchQuery(`${parent ?? ""} ${label} ${href.replace(/\//g, " ")}`),
    });
  };

  for (const item of mainNavigation) {
    push(item.label, item.href);
    for (const column of item.megaMenu ?? []) {
      for (const link of column.links) push(link.label, link.href, item.label);
    }
  }
  return entries;
}

export function searchCategories(
  index: CategoryIndexEntry[],
  query: string,
  limit: number,
): CategorySearchHit[] {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return [];
  const normalized = normalizeSearchQuery(query);

  return index
    .map((entry) => {
      const allMatch = tokens.every((token) => entry.terms.includes(token));
      if (!allMatch) return null;
      const labelTerms = normalizeSearchQuery(entry.label);
      let score = 40;
      if (labelTerms === normalized) score += 60;
      else if (labelTerms.startsWith(normalized)) score += 40;
      else if (labelTerms.includes(normalized)) score += 20;
      const hit: CategorySearchHit = {
        id: entry.id,
        label: entry.label,
        href: entry.href,
        score,
        ...(entry.description ? { description: entry.description } : {}),
      };
      return hit;
    })
    .filter((hit): hit is CategorySearchHit => hit !== null)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "fr"))
    .slice(0, limit);
}
