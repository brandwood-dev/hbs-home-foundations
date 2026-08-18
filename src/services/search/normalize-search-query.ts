/**
 * Normalisation des requêtes et des champs indexés.
 * Fonction pure : aucune donnée du catalogue n'est modifiée, seule la comparaison l'est.
 */
export function normalizeSearchQuery(input: string): string {
  return (
    input
      .normalize("NFD")
      // apostrophes typographiques → apostrophe simple
      .replace(/[\u2018\u2019\u02BC`´]/g, "'")
      // tirets et espaces insécables → espace
      .replace(/[\u2010-\u2015\u2212\-_/]/g, " ")
      .replace(/[\u00A0\u202F]/g, " ")
      // ligatures françaises
      .replace(/\u0153/g, "oe")
      .replace(/\u0152/g, "OE")
      .replace(/\u00E6/g, "ae")
      .replace(/\u00C6/g, "AE")
      // suppression des diacritiques
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      // ponctuation résiduelle
      .replace(/[.,;:!?()[\]{}"«»&+]/g, " ")
      .replace(/'/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Découpe une requête normalisée en mots significatifs. */
export function tokenizeSearchQuery(input: string): string[] {
  const normalized = normalizeSearchQuery(input);
  if (!normalized) return [];
  return normalized.split(" ").filter((token) => token.length > 0);
}

/** Vrai lorsque la requête est exploitable (au moins `min` caractères après normalisation). */
export function isSearchableQuery(input: string, min = 2): boolean {
  return normalizeSearchQuery(input).length >= min;
}
