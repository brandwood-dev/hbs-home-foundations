import type { Product } from "@/domain/product/product.types";

type ProductPathInput =
  | Pick<Product, "slug" | "canonicalPath">
  | {
      slug: string;
      canonicalPath?: string | null;
    };

/**
 * Retourne toujours un lien produit interne.
 *
 * Les réponses API récentes contiennent le chemin SEO canonique. Les données
 * historiques/mockées et les lignes de panier ne le possèdent pas encore :
 * elles conservent l'ancien chemin, qui est redirigé côté route.
 */
export function getProductPath(product: ProductPathInput): string {
  const canonicalPath = product.canonicalPath?.trim();
  if (canonicalPath?.startsWith("/")) return canonicalPath;
  return `/produit/${encodeURIComponent(product.slug)}`;
}
