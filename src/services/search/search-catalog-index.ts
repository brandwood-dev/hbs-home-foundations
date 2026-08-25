import { mainNavigation } from "@/fixtures/navigation.fixture";
import type { CategorySearchHit } from "@/domain/search/search.types";
import type { PublicCategory } from "@/repositories/interfaces/CategoryRepository";
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

function buildFixtureCategoryIndex(): CategoryIndexEntry[] {
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

/**
 * Aplatit la taxonomie publiée par l'API en entrées recherchables.
 *
 * Sans argument, le dépôt mock conserve l'index éditorial historique pour le
 * développement local. Une réponse API, y compris une liste vide, est en
 * revanche toujours considérée comme la source de vérité publique.
 */
export function buildCategoryIndex(categories?: readonly PublicCategory[]): CategoryIndexEntry[] {
  if (categories === undefined) return buildFixtureCategoryIndex();

  const entries: CategoryIndexEntry[] = [];
  const seen = new Set<string>();

  const visit = (category: PublicCategory, parent?: string) => {
    if (!seen.has(category.path)) {
      seen.add(category.path);
      entries.push({
        id: category.path,
        label: category.name,
        href: category.path,
        ...(parent ? { description: parent } : {}),
        terms: normalizeSearchQuery(
          `${parent ?? ""} ${category.name} ${category.slug} ${category.path} ${category.description ?? ""}`,
        ),
      });
    }
    category.children.forEach((child) => visit(child, category.name));
  };

  categories.forEach((category) => visit(category));
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
