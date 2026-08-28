import { slugify } from "@/admin/utils/admin.utils";

/** Slug produit canonique : minuscules, sans accents, sans doublons de tirets. */
export function generateProductSlug(name: string, existingSlugs: string[] = []): string {
  const base = slugify(name) || "produit";
  const taken = new Set(existingSlugs);
  if (!taken.has(base)) return base;
  let index = 2;
  while (taken.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

export function publicProductUrl(slug: string): string {
  return `/produit/${slug}`;
}

/**
 * Valeurs SEO sûres par défaut. Elles restent éditables dans le formulaire,
 * mais sont régénérées tant que l'administrateur n'a pas choisi un override.
 */
export function generateProductSeo(
  name: string,
  shortDescription = "",
): {
  title: string;
  description: string;
} {
  const cleanName = name.trim().replace(/\s+/g, " ");
  const title = `${cleanName || "Produit"} — HBS HOME`.slice(0, 60);
  const fallback = cleanName
    ? `Découvrez ${cleanName} chez HBS HOME, avec une qualité pensée pour votre intérieur.`
    : "Découvrez les collections HBS HOME pour votre intérieur.";
  const description = (shortDescription.trim() || fallback).slice(0, 160);
  return { title, description };
}

/** SKU d'aperçu utilisé par l'interface ; le serveur reste l'autorité finale. */
export function generateVariantSku(reference: string, variantIndex: number, colorId = ""): string {
  const base =
    reference
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "HBS-PRODUIT";
  const color = colorId
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${color || "VAR"}-${String(variantIndex + 1).padStart(2, "0")}`;
}

/** Référence provisoire lisible, unique dans le jeu fourni. */
export function generateProductReference(name: string, existingReferences: string[] = []): string {
  const prefix = slugify(name).replace(/-/g, "").slice(0, 4).toUpperCase() || "HBS";
  const taken = new Set(existingReferences.map((item) => item.toUpperCase()));
  let index = 1;
  let reference = `${prefix}-${String(index).padStart(3, "0")}`;
  while (taken.has(reference)) {
    index += 1;
    reference = `${prefix}-${String(index).padStart(3, "0")}`;
  }
  return reference;
}
