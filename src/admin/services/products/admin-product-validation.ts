import type { AdminProduct } from "@/admin/types/admin.types";
import { normalizeKey } from "@/admin/utils/admin.utils";
import { variantCombinationKey } from "@/admin/services/products/admin-variant-validation";

export interface ProductIdentityContext {
  /** Autres produits de la base (pour l'unicité). */
  others: AdminProduct[];
}

/** Conflits de référence, slug et SKU — vérifiés avant enregistrement. */
export function validateProductIdentity(
  product: AdminProduct,
  context: ProductIdentityContext,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!product.name.trim()) errors["name"] = "Le nom du produit est obligatoire.";
  if (product.name.trim().length > 120) errors["name"] = "Le nom est trop long (120 caractères).";
  if (!product.slug.trim()) errors["slug"] = "Le slug est obligatoire.";
  if (!product.reference.trim()) errors["reference"] = "La référence est obligatoire.";

  for (const other of context.others) {
    if (other.id === product.id) continue;
    if (other.slug === product.slug) errors["slug"] = `Le slug « ${product.slug} » existe déjà.`;
    if (normalizeKey(other.reference) === normalizeKey(product.reference)) {
      errors["reference"] = `La référence « ${product.reference} » existe déjà.`;
    }
  }

  const foreignSkus = new Set(
    context.others
      .filter((other) => other.id !== product.id)
      .flatMap((other) => other.variants.map((variant) => variant.sku.trim().toUpperCase())),
  );
  const seenSku = new Set<string>();
  const seenCombo = new Set<string>();
  for (const variant of product.variants) {
    const sku = variant.sku.trim().toUpperCase();
    if (seenSku.has(sku) || foreignSkus.has(sku)) {
      errors["variants"] = `SKU en doublon : ${variant.sku}`;
    }
    seenSku.add(sku);
    const combo = variantCombinationKey(variant);
    if (seenCombo.has(combo)) {
      errors["variants"] = "Deux variantes possèdent la même combinaison d'options.";
    }
    seenCombo.add(combo);
  }
  return errors;
}

/** Éléments bloquants pour la publication. Un brouillon peut rester incomplet. */
export function validateProductForPublication(product: AdminProduct): string[] {
  const blocking: string[] = [];
  const isCustomQuote = product.sellingMode === "custom_quote";

  if (!product.name.trim()) blocking.push("Le nom du produit est manquant.");
  if (!product.slug.trim()) blocking.push("Le slug est manquant.");
  if (!product.reference.trim()) blocking.push("La référence est manquante.");
  if (!product.categoryId || !product.category) blocking.push("La catégorie est manquante.");
  if (!product.shortDescription.trim()) blocking.push("La description courte est manquante.");

  const images = product.imageAssets ?? [];
  const primary = images.find((image) => image.isPrimary) ?? images[0];
  if (!primary) blocking.push("Aucune image principale n'est définie.");
  if (images.some((image) => !image.alt.trim())) {
    blocking.push("Chaque image doit avoir un texte alternatif.");
  }

  if (!product.seoTitle.trim() || !product.seoDescription.trim()) {
    blocking.push("Les métadonnées SEO minimales sont manquantes.");
  }

  if (isCustomQuote) {
    if (!product.customQuoteEnabled) {
      blocking.push("Activez la demande de devis pour un produit sur devis.");
    }
    if (!product.longDescription.trim()) blocking.push("La description longue est manquante.");
    return blocking;
  }

  const activeVariants = product.variants.filter((variant) => variant.isActive);
  if (activeVariants.length === 0) blocking.push("Au moins une variante active est requise.");
  if (activeVariants.length > 0 && activeVariants.every((variant) => variant.priceMinor <= 0)) {
    blocking.push("Au moins une variante doit avoir un prix valide.");
  }
  if (activeVariants.some((variant) => !variant.sku.trim())) {
    blocking.push("Chaque variante active doit avoir un SKU.");
  }
  if (!product.sellingMode) blocking.push("L'unité de vente n'est pas définie.");

  return blocking;
}
