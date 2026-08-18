import type {
  AdminCategory,
  AdminMockDatabase,
  AdminProduct,
  AdminProductCategoryKey,
  AdminProductImage,
} from "@/admin/types/admin.types";
import { slugify } from "@/admin/utils/admin.utils";

/**
 * Migration additive de la base Admin persistée (`hbs-home-admin-demo-v1`).
 * Aucune donnée existante n'est supprimée : seuls des champs par défaut sont
 * ajoutés et les catégories racines manquantes sont créées.
 */

const CATEGORY_KEY_BY_SLUG: Record<string, AdminProductCategoryKey> = {
  rideaux: "rideaux",
  voilages: "voilages",
  stores: "stores",
  coussins: "coussins",
  "galettes-de-chaise": "galettes_de_chaise",
  accessoires: "accessoires",
  tringles: "accessoires",
  rails: "accessoires",
  embrasses: "accessoires",
  supports: "accessoires",
  embouts: "accessoires",
  "attaches-magnetiques": "accessoires",
  "mobilier-d-interieur": "mobilier_interieur",
  "mobilier-interieur": "mobilier_interieur",
  "plantes-et-decoration": "plantes_decoration",
};

const MISSING_ROOT_CATEGORIES: Array<{ key: AdminProductCategoryKey; name: string }> = [
  { key: "rideaux", name: "Rideaux" },
  { key: "voilages", name: "Voilages" },
  { key: "stores", name: "Stores" },
  { key: "coussins", name: "Coussins" },
  { key: "galettes_de_chaise", name: "Galettes de chaise" },
  { key: "accessoires", name: "Accessoires" },
  { key: "mobilier_interieur", name: "Mobilier d'intérieur" },
  { key: "plantes_decoration", name: "Plantes et décoration" },
];

const SYSTEM_ATTRIBUTE_KEYS = new Set([
  "color",
  "color_family",
  "material",
  "width_cm",
  "height_cm",
  "availability",
  "selling_mode",
  "category",
]);

export function categoryKeyFromSlug(slug: string): AdminProductCategoryKey | undefined {
  return CATEGORY_KEY_BY_SLUG[slug];
}

function inferProductCategory(
  db: AdminMockDatabase,
  product: AdminProduct,
): AdminProductCategoryKey {
  const category = db.categories.find((item) => item.id === product.categoryId);
  const parent = category?.parentId
    ? db.categories.find((item) => item.id === category.parentId)
    : undefined;
  return (
    (category ? categoryKeyFromSlug(category.slug) : undefined) ??
    (parent ? categoryKeyFromSlug(parent.slug) : undefined) ??
    "rideaux"
  );
}

function imagesToAssets(product: AdminProduct): AdminProductImage[] {
  const urls =
    product.images.length > 0 ? product.images : product.imageUrl ? [product.imageUrl] : [];
  return urls.map((url, index) => ({
    id: `img_${product.id}_${index}`,
    url,
    alt: `${product.name} — visuel ${index + 1}`,
    order: index + 1,
    isPrimary: index === 0,
  }));
}

/** Applique les valeurs par défaut manquantes, en place. */
export function migrateAdminDatabase(db: AdminMockDatabase): AdminMockDatabase {
  for (const entry of MISSING_ROOT_CATEGORIES) {
    const slug = slugify(entry.name);
    const exists = db.categories.some(
      (category) => !category.parentId && categoryKeyFromSlug(category.slug) === entry.key,
    );
    if (exists) continue;
    const category: AdminCategory = {
      id: `cat_${slug}`,
      name: entry.name,
      slug,
      order: db.categories.length + 1,
      isActive: true,
      showInNavigation: true,
      description: `Sélection HBS HOME — ${entry.name.toLowerCase()}.`,
      seoTitle: `${entry.name} | HBS HOME`,
      seoDescription: `Découvrez notre sélection ${entry.name.toLowerCase()} chez HBS HOME.`,
    };
    db.categories.push(category);
  }

  for (const category of db.categories) {
    if (category.showInNavigation == null) category.showInNavigation = category.isActive;
  }

  for (const product of db.products) {
    if (!product.category) product.category = inferProductCategory(db, product);
    if (!product.attributes) product.attributes = {};
    if (!product.imageAssets || product.imageAssets.length === 0) {
      product.imageAssets = imagesToAssets(product);
    }
    if (product.seoIndexable == null) product.seoIndexable = product.status === "published";
    for (const variant of product.variants) {
      if (!variant.options) variant.options = {};
      if (variant.trackInventory == null) {
        variant.trackInventory = product.sellingMode !== "custom_quote";
      }
    }
  }

  for (const attribute of db.attributes) {
    if (attribute.isActive == null) attribute.isActive = true;
    if (attribute.isSystem == null) attribute.isSystem = SYSTEM_ATTRIBUTE_KEYS.has(attribute.key);
    if (!attribute.categories) attribute.categories = [];
  }

  for (const movement of db.stockMovements) {
    if (movement.resultingStock == null) movement.resultingStock = movement.quantity;
  }

  return db;
}
