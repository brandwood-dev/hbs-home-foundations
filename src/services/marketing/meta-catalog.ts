/**
 * Convert administrator-authored rich text to the plain-text form accepted by
 * Meta catalog feeds. Product descriptions remain rich HTML in the storefront;
 * only this export projection strips presentation markup.
 */
export function toMetaCatalogPlainText(value: unknown): string {
  if (typeof value !== "string") return "";

  return decodeHtmlEntities(
    value
      .trim()
      .replace(/<\s*br\s*\/?>/gi, " ")
      .replace(/<\/\s*(?:p|div|h[1-6]|li|ul|ol|blockquote|hr)\s*>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/[ \t\r\n]+/g, " "),
  )
    .replace(/[ \t\r\n]+/g, " ")
    .trim();
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(?:nbsp|amp|lt|gt|quot|apos|#39|#x[0-9a-f]+|#[0-9]+);/gi, (entity) => {
    const normalized = entity.toLowerCase();
    const named: Record<string, string> = {
      "&nbsp;": " ",
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&apos;": "'",
      "&#39;": "'",
    };
    const namedValue = named[normalized];
    if (namedValue !== undefined) return namedValue;

    const codePoint = normalized.startsWith("&#x")
      ? Number.parseInt(normalized.slice(3, -1), 16)
      : Number.parseInt(normalized.slice(2, -1), 10);
    if (!Number.isInteger(codePoint) || codePoint <= 0 || codePoint > 0x10ffff) {
      return entity;
    }
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return entity;
    }
  });
}
