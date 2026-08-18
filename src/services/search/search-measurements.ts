import { normalizeSearchQuery } from "@/services/search/normalize-search-query";

export interface SearchMeasurements {
  /** Couples largeur × hauteur (45x45, 300 × 280). */
  pairs: { a: number; b: number }[];
  /** Valeurs simples (150 cm, 24 cm). */
  singles: number[];
  /** Plages extensibles (120-210 cm, 120 à 210 cm). */
  ranges: { min: number; max: number }[];
  /** Représentations normalisées comparables à l'index produit. */
  terms: string[];
}

const PAIR = /(\d{2,4})\s*[x×]\s*(\d{2,4})/g;
const RANGE = /(\d{2,4})\s*(?:-|a|à)\s*(\d{2,4})\s*cm/g;
const SINGLE = /(\d{2,4})\s*(?:cm|mm)?/g;

/**
 * Extraction légère de dimensions dans une requête.
 * Fonction pure ; sert uniquement à améliorer la pertinence.
 */
export function extractSearchMeasurements(rawQuery: string): SearchMeasurements {
  const query = normalizeSearchQuery(rawQuery).replace(/[x×]/g, "x");
  const pairs: SearchMeasurements["pairs"] = [];
  const ranges: SearchMeasurements["ranges"] = [];
  const singles: number[] = [];
  const terms = new Set<string>();

  let rest = query;

  for (const match of query.matchAll(PAIR)) {
    const a = Number(match[1]);
    const b = Number(match[2]);
    pairs.push({ a, b });
    terms.add(`${a}x${b}`);
    terms.add(`${a} x ${b}`);
    rest = rest.replace(match[0], " ");
  }

  for (const match of rest.matchAll(RANGE)) {
    const min = Number(match[1]);
    const max = Number(match[2]);
    ranges.push({ min, max });
    terms.add(`${min} ${max}`);
    terms.add(String(min));
    terms.add(String(max));
    rest = rest.replace(match[0], " ");
  }

  for (const match of rest.matchAll(SINGLE)) {
    const value = Number(match[1]);
    if (!Number.isFinite(value)) continue;
    singles.push(value);
    terms.add(String(value));
  }

  return { pairs, singles, ranges, terms: [...terms] };
}

export function hasMeasurements(measurements: SearchMeasurements): boolean {
  return (
    measurements.pairs.length > 0 ||
    measurements.ranges.length > 0 ||
    measurements.singles.length > 0
  );
}
