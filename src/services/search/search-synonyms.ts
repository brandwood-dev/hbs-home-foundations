import { normalizeSearchQuery } from "@/services/search/normalize-search-query";

/**
 * Synonymes éditoriaux explicites — volontairement restreints.
 * Aucun système linguistique : uniquement des équivalences métier vérifiées.
 */
export const searchSynonyms: Record<string, string[]> = {
  rideau: ["rideaux", "tenture"],
  voilage: ["voilages", "voile"],
  store: ["stores"],
  coussin: ["coussins", "housse de coussin"],
  galette: ["galettes", "galette de chaise", "assise de chaise"],
  tringle: ["barre a rideau", "barre rideau"],
  embrasse: ["attache rideau", "embrasses"],
  oeillets: ["oeillet"],
  occultant: ["occultants", "obscurcissant"],
  fauteuil: ["fauteuils", "assise", "chaise de salon"],
  canape: ["canapes", "sofa"],
  meridienne: ["chaise longue", "duchesse"],
  banc: ["banquette", "banc coffre"],
  pouf: ["poufs", "repose pieds"],
  buffet: ["enfilade"],
  etagere: ["etageres", "bibliotheque"],
  plante: ["plantes", "vegetal", "verdure"],
  cache_pot: ["cache pot", "cachepot", "pot decoratif"],
  artificielle: ["fausse plante", "plante sans entretien", "synthetique"],
  naturelle: ["plante vivante", "vraie plante"],
};

/** Table inversée normalisée : chaque terme pointe vers l'ensemble de sa famille. */
const synonymFamilies: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>();
  for (const [key, values] of Object.entries(searchSynonyms)) {
    const family = [
      ...new Set([
        normalizeSearchQuery(key.replace(/_/g, " ")),
        ...values.map(normalizeSearchQuery),
      ]),
    ].filter(Boolean);
    for (const term of family) {
      const firstWord = term.split(" ")[0]!;
      map.set(term, family);
      if (!map.has(firstWord)) map.set(firstWord, family);
    }
  }
  return map;
})();

/**
 * Retourne les termes équivalents d'une requête (hors termes déjà saisis).
 * Fonction pure : aucune donnée catalogue n'est consultée.
 */
export function expandSearchTokens(tokens: string[]): string[] {
  const original = new Set(tokens);
  const expanded = new Set<string>();
  for (const token of tokens) {
    for (const term of synonymFamilies.get(token) ?? []) {
      if (!original.has(term)) expanded.add(term);
    }
  }
  return [...expanded];
}
