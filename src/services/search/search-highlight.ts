import {
  normalizeSearchQuery,
  tokenizeSearchQuery,
} from "@/services/search/normalize-search-query";

export interface HighlightSegment {
  text: string;
  match: boolean;
}

/**
 * Découpe un texte en segments à surligner, sans jamais recourir à du HTML brut.
 * Le rendu reste du texte React ; la comparaison ignore accents et casse.
 */
export function highlightSegments(text: string, query: string): HighlightSegment[] {
  const tokens = tokenizeSearchQuery(query).filter((token) => token.length >= 2);
  if (tokens.length === 0) return [{ text, match: false }];

  const normalizedChars = [...text].map((char) => normalizeSearchQuery(char));
  // Index de correspondance caractère par caractère (la normalisation peut vider un caractère).
  const flags = new Array<boolean>(text.length).fill(false);
  const normalizedText = normalizedChars.join("");
  const offsets: number[] = [];
  normalizedChars.forEach((chunk, index) => {
    for (let i = 0; i < chunk.length; i += 1) offsets.push(index);
  });

  for (const token of tokens) {
    let from = 0;
    for (;;) {
      const found = normalizedText.indexOf(token, from);
      if (found === -1) break;
      for (let i = found; i < found + token.length; i += 1) {
        const original = offsets[i];
        if (original !== undefined) flags[original] = true;
      }
      from = found + token.length;
    }
  }

  const segments: HighlightSegment[] = [];
  let buffer = "";
  let current = flags[0] ?? false;
  for (let i = 0; i < text.length; i += 1) {
    const isMatch = flags[i] ?? false;
    if (isMatch !== current) {
      if (buffer) segments.push({ text: buffer, match: current });
      buffer = "";
      current = isMatch;
    }
    buffer += text[i];
  }
  if (buffer) segments.push({ text: buffer, match: current });
  return segments;
}
