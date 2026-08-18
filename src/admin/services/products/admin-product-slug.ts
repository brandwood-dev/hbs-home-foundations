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
