import type {
  AdminAttributeValueInput,
  AdminProduct,
  AdminProductCategoryKey,
  AdminProductImage,
  AdminSellingMode,
  AdminVariant,
} from "@/admin/types/admin.types";
import type { AdminProductInput } from "@/admin/repositories/interfaces";
import { ADMIN_PRODUCT_FIELDS } from "@/admin/config/admin-product-fields.config";
import { adminId } from "@/admin/utils/admin.utils";
import { generateProductSeo } from "@/admin/services/products/admin-product-slug";

export interface AdminProductFormValues {
  id?: string;
  name: string;
  slug: string;
  slugTouched: boolean;
  reference: string;
  category: AdminProductCategoryKey;
  categoryId: string;
  subCategoryId?: string | undefined;
  sellingMode: AdminSellingMode;
  shortDescription: string;
  longDescription: string;
  brand: string;
  tags: string[];
  status: AdminProduct["status"];
  fields: Record<string, AdminAttributeValueInput>;
  variants: AdminVariant[];
  images: AdminProductImage[];
  seoTitle: string;
  seoTitleTouched: boolean;
  seoDescription: string;
  seoDescriptionTouched: boolean;
  seoIndexable: boolean;
  seoOgImageUrl: string;
  packContent: string;
  packQuantity: number;
  perMeterPriceMinor: number;
  perMeterMinCm: number;
  perMeterMaxCm: number;
  perMeterStepCm: number;
  customQuoteEnabled: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
}

export function emptyProductForm(
  category: AdminProductCategoryKey,
  categoryId: string,
): AdminProductFormValues {
  return {
    name: "",
    slug: "",
    slugTouched: false,
    reference: "",
    category,
    categoryId,
    sellingMode: "ready_made",
    shortDescription: "",
    longDescription: "",
    brand: "HBS HOME",
    tags: [],
    status: "draft",
    fields: {},
    variants: [],
    images: [],
    seoTitle: "",
    seoTitleTouched: false,
    seoDescription: "",
    seoDescriptionTouched: false,
    seoIndexable: true,
    seoOgImageUrl: "",
    packContent: "",
    packQuantity: 2,
    perMeterPriceMinor: 0,
    perMeterMinCm: 100,
    perMeterMaxCm: 600,
    perMeterStepCm: 10,
    customQuoteEnabled: false,
    isNew: false,
    isBestSeller: false,
    isOnSale: false,
  };
}

export function productToForm(product: AdminProduct): AdminProductFormValues {
  const fields: Record<string, AdminAttributeValueInput> = { ...(product.attributes ?? {}) };
  if (product.material) fields["material"] = product.material;
  if (product.opacityLevel) fields["opacity"] = product.opacityLevel;
  if (product.style) fields["style"] = product.style;
  if (product.rooms.length > 0) fields["rooms"] = product.rooms;

  const generatedSeo = generateProductSeo(product.name, product.shortDescription);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    slugTouched: true,
    reference: product.reference,
    category: product.category ?? "rideaux",
    categoryId: product.categoryId,
    ...(product.subCategoryId ? { subCategoryId: product.subCategoryId } : {}),
    sellingMode: product.sellingMode,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    brand: product.brand ?? "HBS HOME",
    tags: product.tags,
    status: product.status,
    fields,
    variants: product.variants,
    images: product.imageAssets ?? [],
    seoTitle: product.seoTitle,
    seoTitleTouched: product.seoTitle.trim() !== generatedSeo.title,
    seoDescription: product.seoDescription,
    seoDescriptionTouched: product.seoDescription.trim() !== generatedSeo.description,
    seoIndexable: product.seoIndexable ?? true,
    seoOgImageUrl: product.seoOgImageUrl ?? "",
    packContent: product.packContent ?? "",
    packQuantity: product.packQuantity ?? 2,
    perMeterPriceMinor: product.perMeter?.pricePerMeterMinor ?? 0,
    perMeterMinCm: product.perMeter?.minLengthCm ?? 100,
    perMeterMaxCm: product.perMeter?.maxLengthCm ?? 600,
    perMeterStepCm: product.perMeter?.stepCm ?? 10,
    customQuoteEnabled: product.customQuoteEnabled ?? false,
    isNew: product.isNew ?? false,
    isBestSeller: product.isBestSeller ?? false,
    isOnSale:
      product.isOnSale ??
      product.variants.some(
        (variant) =>
          variant.compareAtPriceMinor != null && variant.compareAtPriceMinor > variant.priceMinor,
      ),
  };
}

function stringValue(value: AdminAttributeValueInput | undefined): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function formToProductInput(values: AdminProductFormValues): AdminProductInput {
  const attributes: Record<string, AdminAttributeValueInput> = {};
  for (const [key, value] of Object.entries(values.fields)) {
    const field = ADMIN_PRODUCT_FIELDS[key];
    if (field?.mappedTo) continue;
    if (value === "" || value == null) continue;
    attributes[key] = value;
  }

  const images = values.images.map((image, index) => ({ ...image, order: index + 1 }));
  const primary = images.find((image) => image.isPrimary) ?? images[0];
  const rooms = Array.isArray(values.fields["rooms"]) ? (values.fields["rooms"] as string[]) : [];

  return {
    name: values.name.trim().replace(/\s+/g, " "),
    slug: values.slug.trim(),
    reference: values.reference.trim(),
    categoryId: values.categoryId,
    ...(values.subCategoryId ? { subCategoryId: values.subCategoryId } : {}),
    sellingMode: values.sellingMode,
    shortDescription: values.shortDescription.trim(),
    longDescription: values.longDescription.trim(),
    ...(values.brand.trim() ? { brand: values.brand.trim() } : {}),
    tags: values.tags,
    rooms,
    ...(stringValue(values.fields["style"]) ? { style: values.fields["style"] as string } : {}),
    ...(stringValue(values.fields["material"])
      ? { material: values.fields["material"] as string }
      : {}),
    ...(stringValue(values.fields["opacity"])
      ? { opacityLevel: values.fields["opacity"] as string }
      : {}),
    status: values.status,
    isNew: values.isNew,
    isBestSeller: values.isBestSeller,
    isFeatured: values.isOnSale,
    ...(primary ? { imageUrl: primary.url } : {}),
    images: images.map((image) => image.url),
    imageAssets: images,
    variants: values.variants,
    seoTitle: values.seoTitle.trim(),
    seoDescription: values.seoDescription.trim(),
    seoIndexable: values.seoIndexable,
    ...(values.seoOgImageUrl.trim() ? { seoOgImageUrl: values.seoOgImageUrl.trim() } : {}),
    category: values.category,
    attributes,
    publicSlug: values.slug.trim(),
    ...(values.sellingMode === "pack"
      ? { packContent: values.packContent, packQuantity: values.packQuantity }
      : {}),
    ...(values.sellingMode === "per_meter"
      ? {
          perMeter: {
            pricePerMeterMinor: values.perMeterPriceMinor,
            minLengthCm: values.perMeterMinCm,
            maxLengthCm: values.perMeterMaxCm,
            stepCm: values.perMeterStepCm,
          },
        }
      : {}),
    customQuoteEnabled: values.customQuoteEnabled,
    isOnSale: values.isOnSale,
  };
}

/** Produit reconstruit pour les validations locales (publication, unicité). */
export function formToProductDraft(values: AdminProductFormValues): AdminProduct {
  const input = formToProductInput(values);
  return {
    ...input,
    id: values.id ?? "new",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptyVariant(): AdminVariant {
  return {
    id: adminId("var"),
    sku: "",
    colorId: "",
    colorLabel: "",
    widthCm: 0,
    heightCm: 0,
    curtainHeader: "",
    priceMinor: 0,
    stock: 0,
    lowStockThreshold: 3,
    availability: "in_stock",
    isActive: true,
    options: {},
    trackInventory: true,
  };
}

export function variantSummary(variant: AdminVariant): string {
  const parts: string[] = [];
  if (variant.colorLabel) parts.push(variant.colorLabel);
  if (variant.widthCm || variant.heightCm) parts.push(`${variant.widthCm}×${variant.heightCm} cm`);
  if (variant.curtainHeader) parts.push(variant.curtainHeader);
  if (variant.eyeletColor) parts.push(`œillets ${variant.eyeletColor}`);
  if (variant.lining && variant.lining !== "sans_doublure") parts.push(variant.lining);
  for (const [key, value] of Object.entries(variant.options ?? {})) {
    if (value === "" || value == null) continue;
    parts.push(`${key.replace(/_/g, " ")} ${String(value)}`);
  }
  if (variant.packQuantity) parts.push(`lot de ${variant.packQuantity}`);
  return parts.join(" · ") || "Variante unique";
}
