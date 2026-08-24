import { describe, expect, it } from "vitest";
import { normalizeArticleSlug, prepareArticleInput } from "./article-form";

const categoryId = "11111111-1111-4111-8111-111111111111";

function draft(overrides: Partial<Parameters<typeof prepareArticleInput>[0]> = {}) {
  return {
    slug: "",
    categoryId,
    title: "Mesurer une fenêtre",
    excerpt: "Quelques conseils utiles.",
    body: "Un contenu éditorial.",
    coverMediaAssetId: "",
    readingTimeMinutes: "5",
    seoTitle: "",
    seoDescription: "",
    isFeatured: false,
    homeSortOrder: "0",
    authorName: "HBS HOME",
    ...overrides,
  };
}

describe("article form contract preparation", () => {
  it("normalizes accents, spaces and duplicate separators in slugs", () => {
    expect(normalizeArticleSlug("  Mesurer une fenêtre — facilement  ")).toBe(
      "mesurer-une-fenetre-facilement",
    );
  });

  it("generates a valid slug from the title when the slug is empty", () => {
    const result = prepareArticleInput(draft());
    expect(result).toEqual(expect.objectContaining({ input: expect.any(Object) }));
    if ("input" in result) expect(result.input.slug).toBe("mesurer-une-fenetre");
  });

  it("rejects non-numeric reading times before sending the request", () => {
    expect(prepareArticleInput(draft({ readingTimeMinutes: "5 min" }))).toEqual({
      error: "Le temps de lecture doit être un nombre entier.",
    });
  });

  it("rejects invalid category identifiers before sending the request", () => {
    expect(prepareArticleInput(draft({ categoryId: "rideaux" }))).toEqual({
      error: "La catégorie sélectionnée est invalide. Rechargez la liste des catégories.",
    });
  });
});
