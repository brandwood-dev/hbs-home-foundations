import type { AdminArticleInput } from "@/admin/repositories/interfaces";

const ARTICLE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ArticleDraftFormValues {
  slug: string;
  categoryId: string;
  title: string;
  excerpt: string;
  body: string;
  coverMediaAssetId: string;
  readingTimeMinutes: string;
  seoTitle: string;
  seoDescription: string;
  isFeatured: boolean;
  homeSortOrder: string;
  authorName: string;
}

export function normalizeArticleSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseInteger(
  value: string,
  field: string,
  min: number,
  max?: number,
): { value?: number; error?: string } {
  const normalized = value.trim();
  if (!normalized) return {};
  if (!/^\d+$/.test(normalized)) {
    return { error: `${field} doit être un nombre entier.` };
  }
  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed) || parsed < min || (max !== undefined && parsed > max)) {
    const range =
      max === undefined ? `au moins ${String(min)}` : `entre ${String(min)} et ${String(max)}`;
    return { error: `${field} doit être ${range}.` };
  }
  return { value: parsed };
}

export function prepareArticleInput(
  draft: ArticleDraftFormValues,
): { input: AdminArticleInput } | { error: string } {
  const title = draft.title.trim();
  const excerpt = draft.excerpt.trim();
  const body = draft.body.trim();
  const slug = normalizeArticleSlug(draft.slug || title);

  if (!title || !excerpt || !body || !draft.categoryId) {
    return {
      error: "Le titre, le slug, l'extrait, la catégorie et le contenu sont obligatoires.",
    };
  }
  if (!slug || !ARTICLE_SLUG_PATTERN.test(slug)) {
    return { error: "Le slug doit contenir uniquement des lettres, chiffres et tirets simples." };
  }
  if (slug.length > 160) return { error: "Le slug ne peut pas dépasser 160 caractères." };
  if (title.length > 240) return { error: "Le titre ne peut pas dépasser 240 caractères." };
  if (excerpt.length > 600) return { error: "L'extrait ne peut pas dépasser 600 caractères." };
  if (JSON.stringify({ type: "paragraph", text: body }).length > 64_000) {
    return { error: "Le contenu est trop volumineux (64 000 caractères maximum)." };
  }
  if (!UUID_PATTERN.test(draft.categoryId)) {
    return { error: "La catégorie sélectionnée est invalide. Rechargez la liste des catégories." };
  }

  const readingTime = parseInteger(draft.readingTimeMinutes, "Le temps de lecture", 1, 120);
  if (readingTime.error) return { error: readingTime.error };
  const homeSortOrder = parseInteger(draft.homeSortOrder || "0", "L'ordre d'affichage", 0);
  if (homeSortOrder.error) return { error: homeSortOrder.error };

  const seoTitle = draft.seoTitle.trim();
  if (seoTitle.length > 160) return { error: "Le titre SEO ne peut pas dépasser 160 caractères." };
  const seoDescription = draft.seoDescription.trim();
  if (seoDescription.length > 320) {
    return { error: "La description SEO ne peut pas dépasser 320 caractères." };
  }
  const authorName = draft.authorName.trim() || "HBS HOME";
  if (authorName.length > 120)
    return { error: "Le nom de l'auteur ne peut pas dépasser 120 caractères." };

  return {
    input: {
      slug,
      categoryId: draft.categoryId,
      title,
      excerpt,
      bodyBlocks: [{ type: "paragraph", text: body }],
      coverMediaAssetId: draft.coverMediaAssetId.trim() || null,
      ...(readingTime.value === undefined ? {} : { readingTimeMinutes: readingTime.value }),
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      isFeatured: draft.isFeatured,
      homeSortOrder: homeSortOrder.value ?? 0,
      authorName,
    },
  };
}
