import { describe, expect, it } from "vitest";
import {
  hasRichTextContent,
  plainTextToRichTextHtml,
  richTextToPlainText,
  sanitizeRichTextHtml,
  toInlineRichTextHtml,
} from "./rich-text";

describe("rich text content", () => {
  it("converts legacy paragraphs and line breaks", () => {
    expect(plainTextToRichTextHtml("Une phrase.\nSuite.\n\nNouveau paragraphe.")).toBe(
      "<p>Une phrase.<br />Suite.</p><p>Nouveau paragraphe.</p>",
    );
  });

  it("keeps formatting while stripping dangerous tags and attributes", () => {
    const html = sanitizeRichTextHtml(
      '<p><strong>Bonjour</strong> 😊</p><script>alert(1)</script><a href="javascript:alert(1)" onclick="bad()">Lien</a>',
    );
    expect(html).toContain("<strong>Bonjour</strong>");
    expect(html).not.toContain("script");
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("javascript:");
  });

  it("provides a text projection for SEO and compact cards", () => {
    expect(richTextToPlainText("<p>Choisissez<br />la finition.</p><ul><li>Salon</li></ul>")).toBe(
      "Choisissez\nla finition.\nSalon",
    );
    expect(hasRichTextContent("<p>✅</p>")).toBe(true);
    expect(toInlineRichTextHtml("<p><strong>Promo</strong></p><p>30 %</p>")).toContain(
      "<strong>Promo</strong>",
    );
  });
});
