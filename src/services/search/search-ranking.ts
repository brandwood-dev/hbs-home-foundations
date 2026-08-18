import { SEARCH_SCORE_WEIGHTS } from "@/domain/search/search.constants";
import type { Product } from "@/domain/product/product.types";
import type { ProductSearchHit, SearchSort } from "@/domain/search/search.types";
import { getProductStartingPrice } from "@/lib/money/money";
import type { ProductSearchDoc } from "@/services/search/search-index";
import {
  normalizeSearchQuery,
  tokenizeSearchQuery,
} from "@/services/search/normalize-search-query";
import { expandSearchTokens } from "@/services/search/search-synonyms";
import { extractSearchMeasurements } from "@/services/search/search-measurements";

export interface SearchScoreResult {
  score: number;
  matchedFields: string[];
}

function someTermMatches(terms: string[], tokens: string[]): boolean {
  return tokens.every((token) => terms.some((term) => term.includes(token)));
}

function anyTermMatches(terms: string[], tokens: string[]): boolean {
  return tokens.some((token) => terms.some((term) => term.includes(token)));
}

/**
 * Classement déterministe. Fonction pure : mêmes entrées, même score.
 * Les termes très courts ne matchent que sur des débuts de mots pour éviter
 * de faire correspondre presque tout le catalogue.
 */
export function calculateSearchScore(doc: ProductSearchDoc, rawQuery: string): SearchScoreResult {
  const query = normalizeSearchQuery(rawQuery);
  const allTokens = tokenizeSearchQuery(rawQuery);
  if (!query || allTokens.length === 0) return { score: 0, matchedFields: [] };

  const measurements = extractSearchMeasurements(rawQuery);
  // Les nombres alimentent la pertinence dimensionnelle, pas la correspondance texte.
  const tokens = allTokens.filter((token) => !/^\d+(x\d+)?$/.test(token));
  const textTokens = tokens.length > 0 ? tokens : allTokens;

  const matchedFields: string[] = [];
  let score = 0;

  if (doc.reference === query || doc.reference.replace(/\s/g, "") === query.replace(/\s/g, "")) {
    score += SEARCH_SCORE_WEIGHTS.reference;
    matchedFields.push("reference");
  }

  if (
    doc.skus.some((sku) => sku === query || sku.replace(/\s/g, "") === query.replace(/\s/g, ""))
  ) {
    score += SEARCH_SCORE_WEIGHTS.sku;
    matchedFields.push("sku");
  }

  if (doc.name === query) {
    score += SEARCH_SCORE_WEIGHTS.nameExact;
    matchedFields.push("name");
  } else if (doc.name.startsWith(query) || doc.slug.startsWith(query)) {
    score += SEARCH_SCORE_WEIGHTS.namePrefix;
    matchedFields.push("name");
  } else {
    const nameWords = doc.name.split(" ");
    const allTokensInName = textTokens.every((token) =>
      nameWords.some((word) => word.startsWith(token)),
    );
    if (allTokensInName) {
      score += SEARCH_SCORE_WEIGHTS.nameWords;
      matchedFields.push("name");
    }
  }

  // Synonymes éditoriaux : équivalences explicites uniquement.
  const synonymTokens = expandSearchTokens(textTokens);
  if (synonymTokens.length > 0) {
    const searchable = [
      doc.name,
      ...doc.categoryTerms,
      ...doc.productTypeTerms,
      ...doc.materialTerms,
      ...doc.attributeTerms,
    ];
    if (synonymTokens.some((term) => searchable.some((value) => value.includes(term)))) {
      score += SEARCH_SCORE_WEIGHTS.synonym;
      matchedFields.push("synonym");
    }
  }

  if (anyTermMatches(doc.productTypeTerms, textTokens)) {
    const full = someTermMatches(doc.productTypeTerms, textTokens);
    score += full ? SEARCH_SCORE_WEIGHTS.subcategory : SEARCH_SCORE_WEIGHTS.productType;
    matchedFields.push("type");
  }

  if (anyTermMatches(doc.categoryTerms, textTokens)) {
    const full = someTermMatches(doc.categoryTerms, textTokens);
    score += full ? SEARCH_SCORE_WEIGHTS.category : Math.round(SEARCH_SCORE_WEIGHTS.category / 2);
    matchedFields.push("category");
  }

  if (anyTermMatches(doc.materialTerms, textTokens)) {
    score += SEARCH_SCORE_WEIGHTS.material;
    matchedFields.push("material");
  }

  if (anyTermMatches(doc.colorTerms, textTokens)) {
    score += SEARCH_SCORE_WEIGHTS.color;
    matchedFields.push("color");
  }

  if (anyTermMatches(doc.attributeTerms, textTokens)) {
    score += SEARCH_SCORE_WEIGHTS.attributes;
    matchedFields.push("attribute");
  }

  if (
    measurements.terms.length > 0 &&
    measurements.terms.some((term) => doc.measurementTerms.includes(term))
  ) {
    score += SEARCH_SCORE_WEIGHTS.dimensions;
    matchedFields.push("dimensions");
  }

  if (textTokens.every((token) => doc.description.includes(token))) {
    score += SEARCH_SCORE_WEIGHTS.description;
    matchedFields.push("description");
  }

  // Un seul mot très court doit correspondre à un champ fort, pas à une sous-chaîne quelconque.
  if (textTokens.length === 1 && textTokens[0]!.length <= 2) {
    const strong = matchedFields.some((field) =>
      ["reference", "sku", "name", "category", "type"].includes(field),
    );
    if (!strong) return { score: 0, matchedFields: [] };
  }

  return { score, matchedFields: [...new Set(matchedFields)] };
}

/** Tri stable : score, puis recommandation, puis nom. */
export function sortProductHits(hits: ProductSearchHit[], sort: SearchSort): ProductSearchHit[] {
  const withIndex = hits.map((hit, index) => ({ hit, index }));
  const byRelevance = (a: ProductSearchHit, b: ProductSearchHit) =>
    b.score - a.score ||
    b.product.recommendationScore - a.product.recommendationScore ||
    a.product.name.localeCompare(b.product.name, "fr");

  const comparators: Record<SearchSort, (a: ProductSearchHit, b: ProductSearchHit) => number> = {
    relevance: byRelevance,
    newest: (a, b) =>
      new Date(b.product.createdAt).getTime() - new Date(a.product.createdAt).getTime() ||
      byRelevance(a, b),
    price_asc: (a, b) =>
      getProductStartingPrice(a.product).amountMinor -
        getProductStartingPrice(b.product).amountMinor || byRelevance(a, b),
    price_desc: (a, b) =>
      getProductStartingPrice(b.product).amountMinor -
        getProductStartingPrice(a.product).amountMinor || byRelevance(a, b),
  };

  const comparator = comparators[sort] ?? byRelevance;
  withIndex.sort((a, b) => comparator(a.hit, b.hit) || a.index - b.index);
  return withIndex.map((entry) => entry.hit);
}

/** Compte les résultats par catégorie, avant filtrage par catégorie. */
export function countHitsByCategory(hits: ProductSearchHit[]) {
  const counts: Partial<Record<Product["category"], number>> = {};
  for (const hit of hits) {
    counts[hit.product.category] = (counts[hit.product.category] ?? 0) + 1;
  }
  return counts;
}
