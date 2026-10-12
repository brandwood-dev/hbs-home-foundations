import { useMemo } from "react";

const ALLOWED_TAGS = new Set([
  "p",
  "div",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "blockquote",
  "a",
  "hr",
]);

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeHref(value: string): string | null {
  const href = value.trim();
  if (!href || href.startsWith("#") || href.startsWith("/") || href.startsWith("./")) {
    return href || null;
  }
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

/**
 * Conservative HTML sanitizer for administrator-authored content.
 * It intentionally supports a small, presentation-only allow-list so pasted
 * markup cannot inject scripts, event handlers or arbitrary styles.
 */
export function sanitizeRichTextHtml(value: string): string {
  const withoutDangerousBlocks = value.replace(
    /<(script|style|iframe|object|embed|form|input|button|textarea|select|svg|math)[^>]*>[\s\S]*?<\/\1\s*>/gi,
    "",
  );
  const withoutDangerousSingles = withoutDangerousBlocks.replace(
    /<\/?(script|style|iframe|object|embed|form|input|button|textarea|select|svg|math)\b[^>]*>/gi,
    "",
  );

  return withoutDangerousSingles.replace(/<([^>]+)>/g, (full, rawTag: string) => {
    const closing = /^\s*\/\s*/.test(rawTag);
    const match = rawTag.match(/^\s*\/?\s*([a-z0-9]+)([\s\S]*?)\s*\/?\s*$/i);
    if (!match) return "";
    const tag = (match[1] ?? "").toLowerCase();
    const outputTag = tag === "div" ? "p" : tag;
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (closing) return `</${outputTag}>`;
    if (tag === "br" || tag === "hr") return `<${outputTag} />`;
    if (tag !== "a") return `<${outputTag}>`;

    const hrefMatch = (match[2] ?? "").match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = safeHref(hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "");
    return href
      ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">`
      : "<a>";
  });
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][^>]*>/i.test(value);
}

/** Convert legacy plain text to semantic paragraphs without losing line breaks or emoji. */
export function plainTextToRichTextHtml(value: string): string {
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return "";
  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br />")}</p>`)
    .join("");
}

export function toRichTextHtml(value: string | null | undefined): string {
  const raw = typeof value === "string" ? value : "";
  return looksLikeHtml(raw) ? sanitizeRichTextHtml(raw) : plainTextToRichTextHtml(raw);
}

/** Plain-text projection used for SEO, search and compact product cards. */
export function richTextToPlainText(value: string | null | undefined): string {
  const raw = typeof value === "string" ? value : "";
  if (!looksLikeHtml(raw)) return raw.replace(/\s+/g, " ").trim();
  return raw
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function hasRichTextContent(value: string | null | undefined): boolean {
  return richTextToPlainText(value).length > 0;
}

export function toInlineRichTextHtml(value: string | null | undefined): string {
  return toRichTextHtml(value)
    .replace(/<\/?(?:p|div|h2|h3|ul|ol|li|blockquote)>/gi, " ")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function RichTextRenderer({
  value,
  className = "",
}: {
  value: string | null | undefined;
  className?: string;
}) {
  const html = useMemo(() => toRichTextHtml(value), [value]);
  if (!html) return null;
  return (
    <div className={`rich-text ${className}`.trim()} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export function RichTextInlineRenderer({
  value,
  className = "",
}: {
  value: string | null | undefined;
  className?: string;
}) {
  const html = useMemo(() => toInlineRichTextHtml(value), [value]);
  if (!html) return null;
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
