import type { components, operations } from "@/api/generated/hbs-home-api";
import { HbsApiClient, HbsApiError, type ApiAdminCategoryImageUpload } from "@/api";
import { getSupabaseBrowserClient } from "@/auth/supabase-browser";
import type {
  AdminAttribute,
  AdminAttributeValueInput,
  AdminAttributeValue,
  AdminCategory,
  AdminProduct,
  AdminProductCategoryKey,
  AdminProductImage,
  AdminSellingMode,
  AdminVariant,
  ProductPublicationStatus,
  StockMovement,
} from "@/admin/types/admin.types";
import { ADMIN_PRODUCT_CATEGORY_LABELS } from "@/admin/types/admin.types";
import type {
  AdminAttributeInput,
  AdminAttributeRepository,
  AdminCategoryInput,
  AdminCategoryRepository,
  AdminProductInput,
  AdminProductRepository,
  AdminInventoryRepository,
  InventoryRow,
  StockAdjustmentInput,
  StockSettingsInput,
} from "@/admin/repositories/interfaces";

type ApiCategory = components["schemas"]["AdminCategory"];
type ApiAttribute = components["schemas"]["AdminAttribute"];
type ApiProduct = components["schemas"]["AdminProduct"];
type ApiProductMedia = components["schemas"]["AdminProductMedia"];
type ApiVariant = components["schemas"]["AdminProductVariant"];
type ProductCreateBody =
  operations["adminCreateProduct"]["requestBody"]["content"]["application/json"];
type ProductPatchBody =
  operations["adminUpdateProduct"]["requestBody"]["content"]["application/json"];
type VariantCreateBody =
  operations["adminCreateVariant"]["requestBody"]["content"]["application/json"];
type VariantPatchBody =
  operations["adminUpdateVariant"]["requestBody"]["content"]["application/json"];
type CategoryCreateBody =
  operations["adminCreateCategory"]["requestBody"]["content"]["application/json"];
type CategoryPatchBody =
  operations["adminUpdateCategory"]["requestBody"]["content"]["application/json"];
type AttributeCreateBody =
  operations["adminCreateAttribute"]["requestBody"]["content"]["application/json"];
type AttributePatchBody =
  operations["adminUpdateAttribute"]["requestBody"]["content"]["application/json"];

type ApiInventoryRow = components["schemas"]["AdminInventoryRow"];
type ApiStockMovement = components["schemas"]["AdminStockMovement"];

export type AdminAccessTokenProvider = () => Promise<string>;

async function defaultAccessToken(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase Auth n’est pas configuré pour cet environnement.");
  }
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) {
    throw new HbsApiError(401, "Session Admin expirée. Veuillez vous reconnecter.");
  }
  return data.session.access_token;
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function attributeValues(value: unknown): Record<string, AdminAttributeValueInput> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string, AdminAttributeValueInput> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") {
      result[key] = raw;
    } else if (Array.isArray(raw) && raw.every((item) => typeof item === "string")) {
      result[key] = raw as string[];
    }
  }
  return result;
}

function categoryKey(value: string | null): AdminProductCategoryKey | undefined {
  return value && value in ADMIN_PRODUCT_CATEGORY_LABELS
    ? (value as AdminProductCategoryKey)
    : undefined;
}

function mapCategory(category: ApiCategory): AdminCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    ...(category.parentId ? { parentId: category.parentId } : {}),
    order: category.sortOrder,
    isActive: category.status === "active",
    description: category.description ?? "",
    ...(category.imageUrl ? { imageUrl: category.imageUrl } : {}),
    ...(category.imageMediaAssetId ? { imageMediaAssetId: category.imageMediaAssetId } : {}),
    seoTitle: category.seoTitle ?? "",
    seoDescription: category.seoDescription ?? "",
    showInNavigation: category.showInNavigation,
  };
}

function categoryBody(input: AdminCategoryInput): CategoryCreateBody {
  return {
    slug: input.slug.trim(),
    name: input.name.trim(),
    description: input.description?.trim() || null,
    parentId: input.parentId || null,
    status: input.isActive ? "active" : "draft",
    sortOrder: input.order,
    imageUrl: input.imageUrl || null,
    imageMediaAssetId: input.imageMediaAssetId || null,
    seoTitle: input.seoTitle.trim() || null,
    seoDescription: input.seoDescription.trim() || null,
    showInNavigation: input.showInNavigation !== false,
  };
}

function categoryPatch(input: Partial<AdminCategoryInput>): CategoryPatchBody {
  return {
    ...(input.slug === undefined ? {} : { slug: input.slug.trim() }),
    ...(input.name === undefined ? {} : { name: input.name.trim() }),
    ...(input.description === undefined ? {} : { description: input.description.trim() || null }),
    ...(input.parentId === undefined ? {} : { parentId: input.parentId || null }),
    ...(input.isActive === undefined ? {} : { status: input.isActive ? "active" : "draft" }),
    ...(input.order === undefined ? {} : { sortOrder: input.order }),
    ...(input.imageUrl === undefined ? {} : { imageUrl: input.imageUrl || null }),
    ...(input.imageMediaAssetId === undefined
      ? {}
      : { imageMediaAssetId: input.imageMediaAssetId || null }),
    ...(input.seoTitle === undefined ? {} : { seoTitle: input.seoTitle.trim() || null }),
    ...(input.seoDescription === undefined
      ? {}
      : { seoDescription: input.seoDescription.trim() || null }),
    ...(input.showInNavigation === undefined ? {} : { showInNavigation: input.showInNavigation }),
  };
}

function mapAttribute(attribute: ApiAttribute): AdminAttribute {
  const fieldType = attribute.valueType === "dimension" ? "measurement" : attribute.valueType;
  return {
    id: attribute.id,
    key: attribute.key,
    name: attribute.name,
    fieldType,
    isFilterable: attribute.isFilterable,
    isVariantAxis: attribute.isVariantAxis,
    isRequired: attribute.isRequired,
    isActive: attribute.status === "active",
    order: attribute.sortOrder,
    categories: [...attribute.categorySlugs],
    values: attribute.options.map((option): AdminAttributeValue => ({
      id: option.id,
      label: option.label,
      slug: option.value,
      order: option.sortOrder,
      ...(option.hex ? { hex: option.hex } : {}),
      ...(option.family ? { family: option.family } : {}),
      isActive: option.isActive,
    })),
    isSystem: attribute.isSystem,
  };
}

function attributeValueType(
  value: AdminAttributeInput["fieldType"],
): AttributeCreateBody["valueType"] {
  if (value === "measurement") return "dimension";
  if (value === "single_select" || value === "multi_select" || value === "multiselect") {
    return "select";
  }
  return value === "select" ||
    value === "text" ||
    value === "number" ||
    value === "boolean" ||
    value === "color"
    ? value
    : "text";
}

function attributeBody(input: AdminAttributeInput): AttributeCreateBody {
  return {
    key: input.key.trim(),
    name: input.name.trim(),
    valueType: attributeValueType(input.fieldType),
    isFilterable: input.isFilterable,
    isRequired: input.isRequired ?? false,
    status: input.isActive === false ? "draft" : "active",
    isVariantAxis: input.isVariantAxis,
    sortOrder: input.order,
    isSystem: input.isSystem ?? false,
    categorySlugs: input.categories ?? [],
    options: input.values.map((value, index) => ({
      value: value.slug.trim() || value.label.trim(),
      label: value.label.trim(),
      sortOrder: value.order || index + 1,
      ...(value.hex ? { hex: value.hex } : {}),
      ...(value.family ? { family: value.family } : {}),
      isActive: value.isActive,
    })),
  };
}

function attributePatch(input: Partial<AdminAttributeInput>): AttributePatchBody {
  return {
    ...(input.key === undefined ? {} : { key: input.key.trim() }),
    ...(input.name === undefined ? {} : { name: input.name.trim() }),
    ...(input.fieldType === undefined ? {} : { valueType: attributeValueType(input.fieldType) }),
    ...(input.isFilterable === undefined ? {} : { isFilterable: input.isFilterable }),
    ...(input.isRequired === undefined ? {} : { isRequired: input.isRequired }),
    ...(input.isActive === undefined ? {} : { status: input.isActive ? "active" : "draft" }),
    ...(input.isVariantAxis === undefined ? {} : { isVariantAxis: input.isVariantAxis }),
    ...(input.order === undefined ? {} : { sortOrder: input.order }),
    ...(input.isSystem === undefined ? {} : { isSystem: input.isSystem }),
    ...(input.categories === undefined ? {} : { categorySlugs: input.categories }),
    ...(input.values === undefined
      ? {}
      : {
          options: input.values.map((value, index) => ({
            value: value.slug.trim() || value.label.trim(),
            label: value.label.trim(),
            sortOrder: value.order || index + 1,
            ...(value.hex ? { hex: value.hex } : {}),
            ...(value.family ? { family: value.family } : {}),
            isActive: value.isActive,
          })),
        }),
  };
}

function mapVariant(variant: ApiVariant): AdminVariant {
  const options = record(variant.options);
  const payload = record(variant.payload);
  const merged = { ...options, ...payload };
  const stock = numberValue(merged["stock"], 0);
  const lowStockThreshold = numberValue(merged["lowStockThreshold"], 3);
  const availability = stringValue(merged["availability"]);
  const allowedAvailability = new Set<AdminVariant["availability"]>([
    "in_stock",
    "low_stock",
    "out_of_stock",
    "made_to_order",
  ]);
  const resolvedAvailability = allowedAvailability.has(availability as AdminVariant["availability"])
    ? (availability as AdminVariant["availability"])
    : stock <= 0
      ? "out_of_stock"
      : stock <= lowStockThreshold
        ? "low_stock"
        : "in_stock";
  const publicOptions: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(options)) {
    if (typeof value === "string" || typeof value === "number") publicOptions[key] = value;
  }
  const eyeletColor = stringValue(merged["eyeletColor"]);
  const lining = stringValue(merged["lining"]);
  const imageUrl = stringValue(merged["imageUrl"]);
  const packQuantity = merged["packQuantity"];
  const trackInventory = merged["trackInventory"];
  return {
    id: variant.id,
    sku: variant.sku,
    colorId: stringValue(merged["colorId"]) ?? "",
    colorLabel: stringValue(merged["colorLabel"]) ?? "",
    widthCm: numberValue(merged["widthCm"], 0),
    heightCm: numberValue(merged["heightCm"], 0),
    curtainHeader: stringValue(merged["curtainHeader"]) ?? variant.title ?? "",
    ...(eyeletColor ? { eyeletColor } : {}),
    ...(lining ? { lining } : {}),
    priceMinor: variant.priceAmountMinor,
    ...(variant.compareAtPriceAmountMinor === null
      ? {}
      : { compareAtPriceMinor: variant.compareAtPriceAmountMinor }),
    stock,
    lowStockThreshold,
    availability: resolvedAvailability,
    ...(imageUrl ? { imageUrl } : {}),
    isActive: variant.status !== "archived",
    isDefault: variant.isDefault,
    options: publicOptions,
    ...(typeof packQuantity === "number" ? { packQuantity } : {}),
    trackInventory: booleanValue(trackInventory, true),
  };
}

function mapMedia(media: ApiProductMedia): AdminProductImage {
  return {
    id: media.id,
    url: media.publicUrl ?? media.storagePath,
    alt: media.alt,
    order: media.sortOrder + 1,
    isPrimary: media.isPrimary,
    storagePath: media.storagePath,
    ...(media.publicUrl ? { publicUrl: media.publicUrl } : {}),
    type: media.mediaType,
    ...(media.variantId ? { variantId: media.variantId } : {}),
  };
}

function mapProduct(product: ApiProduct): AdminProduct {
  const status: ProductPublicationStatus =
    product.status === "active" ? "published" : product.status;
  const category = categoryKey(product.categorySlug);
  const imageAssets = product.media.map(mapMedia);
  const images = imageAssets.map((image) => image.url);
  const primary = imageAssets.find((image) => image.isPrimary) ?? imageAssets[0];
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    reference: product.reference,
    categoryId: product.categoryId ?? "",
    sellingMode: product.sellingMode as AdminSellingMode,
    shortDescription: product.shortDescription ?? "",
    longDescription: product.longDescription ?? "",
    ...(product.material ? { material: product.material } : {}),
    status,
    attributes: attributeValues(product.attributes),
    ...(primary ? { imageUrl: primary.url } : {}),
    images,
    ...(imageAssets.length > 0 ? { imageAssets } : {}),
    tags: [],
    rooms: [],
    variants: product.variants.map(mapVariant),
    seoTitle: product.name,
    seoDescription: product.shortDescription ?? "",
    ...(category ? { category } : {}),
    publicSlug: product.slug,
    seoIndexable: true,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function productPayload(input: AdminProductInput): Record<string, unknown> {
  return {
    brand: input.brand,
    tags: input.tags,
    rooms: input.rooms,
    style: input.style,
    opacityLevel: input.opacityLevel,
    images: input.images,
    imageAssets: input.imageAssets,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    seoIndexable: input.seoIndexable,
    seoOgImageUrl: input.seoOgImageUrl,
    packContent: input.packContent,
    packQuantity: input.packQuantity,
    perMeter: input.perMeter,
    customQuoteEnabled: input.customQuoteEnabled,
    attributes: input.attributes,
  };
}

function productBody(input: AdminProductInput): ProductCreateBody {
  return {
    slug: input.slug.trim(),
    name: input.name.trim(),
    reference: input.reference.trim(),
    categoryId: input.categoryId,
    material: input.material?.trim() ?? "",
    sellingMode: input.sellingMode,
    ...(input.attributes === undefined ? {} : { attributes: input.attributes }),
    shortDescription: input.shortDescription.trim() || null,
    longDescription: input.longDescription.trim() || null,
    imageAlt: null,
    payload: productPayload(input),
  };
}

function productPatch(
  input: Partial<AdminProductInput>,
  expectedVersion?: number,
): ProductPatchBody {
  const mediaPayload =
    input.imageAssets === undefined && input.images === undefined
      ? {}
      : {
          images: input.images ?? input.imageAssets?.map((image) => image.url) ?? [],
          imageAssets: input.imageAssets ?? [],
        };
  return {
    ...(input.slug === undefined ? {} : { slug: input.slug.trim() }),
    ...(input.name === undefined ? {} : { name: input.name.trim() }),
    ...(input.reference === undefined ? {} : { reference: input.reference.trim() }),
    ...(input.categoryId === undefined ? {} : { categoryId: input.categoryId }),
    ...(input.material === undefined ? {} : { material: input.material?.trim() ?? "" }),
    ...(input.sellingMode === undefined ? {} : { sellingMode: input.sellingMode }),
    ...(input.attributes === undefined ? {} : { attributes: input.attributes }),
    ...(input.shortDescription === undefined
      ? {}
      : { shortDescription: input.shortDescription.trim() || null }),
    ...(input.longDescription === undefined
      ? {}
      : { longDescription: input.longDescription.trim() || null }),
    ...(Object.keys(mediaPayload).length > 0 ? { payload: mediaPayload } : {}),
    ...(expectedVersion === undefined ? {} : { expectedVersion }),
  };
}

function variantOptions(variant: AdminVariant): Record<string, unknown> {
  return {
    ...(variant.options ?? {}),
    colorId: variant.colorId,
    colorLabel: variant.colorLabel,
    widthCm: variant.widthCm,
    heightCm: variant.heightCm,
    curtainHeader: variant.curtainHeader,
    ...(variant.eyeletColor ? { eyeletColor: variant.eyeletColor } : {}),
    ...(variant.lining ? { lining: variant.lining } : {}),
    ...(variant.packQuantity === undefined ? {} : { packQuantity: variant.packQuantity }),
  };
}

function variantPayload(variant: AdminVariant): Record<string, unknown> {
  return {
    stock: variant.stock,
    lowStockThreshold: variant.lowStockThreshold,
    availability: variant.availability,
    trackInventory: variant.trackInventory ?? true,
    ...(variant.imageUrl ? { imageUrl: variant.imageUrl } : {}),
  };
}

function variantBody(variant: AdminVariant): VariantCreateBody {
  return {
    sku: variant.sku.trim(),
    title: variant.curtainHeader.trim() || null,
    priceAmountMinor: variant.priceMinor,
    ...(variant.compareAtPriceMinor === undefined
      ? {}
      : { compareAtPriceAmountMinor: variant.compareAtPriceMinor }),
    status: variant.isActive ? "active" : "archived",
    options: variantOptions(variant),
    payload: variantPayload(variant),
    isDefault: variant.isDefault ?? variant.id.endsWith("-default"),
    sortOrder: 0,
  };
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (typeof value !== "object" || value === null) return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, stableValue(item)]),
  );
}

function variantFingerprint(variant: AdminVariant): string {
  return JSON.stringify(stableValue(variantBody(variant)));
}

function variantPatch(variant: AdminVariant, expectedVersion: number): VariantPatchBody {
  return { ...variantBody(variant), expectedVersion };
}

export class AdminCatalogApi {
  constructor(
    private readonly client = new HbsApiClient(),
    private readonly accessToken: AdminAccessTokenProvider = defaultAccessToken,
  ) {}

  private async token(): Promise<string> {
    return this.accessToken();
  }

  listCategories(): Promise<{ items: ApiCategory[] }> {
    return this.token().then((token) =>
      this.client.get<{ items: ApiCategory[] }>("/api/v1/admin/categories", undefined, token),
    );
  }

  createCategory(input: CategoryCreateBody): Promise<ApiCategory> {
    return this.token().then((token) =>
      this.client.post<ApiCategory>("/api/v1/admin/categories", input, token),
    );
  }

  updateCategory(id: string, input: CategoryPatchBody): Promise<ApiCategory> {
    return this.token().then((token) =>
      this.client.patch<ApiCategory>(
        `/api/v1/admin/categories/${encodeURIComponent(id)}`,
        input,
        token,
      ),
    );
  }

  uploadCategoryImage(file: File, name: string, alt: string): Promise<ApiAdminCategoryImageUpload> {
    return this.token().then((token) =>
      this.client.postFile<ApiAdminCategoryImageUpload>(
        "/api/v1/admin/categories/image",
        file,
        token,
        {
          "content-type": file.type,
          "x-image-name": name.trim().slice(0, 240),
          "x-image-alt": alt.trim().slice(0, 240),
        },
      ),
    );
  }

  reorderCategory(id: string, direction: "up" | "down"): Promise<ApiCategory> {
    return this.token().then((token) =>
      this.client.post<ApiCategory>(
        `/api/v1/admin/categories/${encodeURIComponent(id)}/reorder`,
        { direction },
        token,
      ),
    );
  }

  listAttributes(): Promise<{ items: ApiAttribute[] }> {
    return this.token().then((token) =>
      this.client.get<{ items: ApiAttribute[] }>("/api/v1/admin/attributes", undefined, token),
    );
  }

  createAttribute(input: AttributeCreateBody): Promise<ApiAttribute> {
    return this.token().then((token) =>
      this.client.post<ApiAttribute>("/api/v1/admin/attributes", input, token),
    );
  }

  updateAttribute(id: string, input: AttributePatchBody): Promise<ApiAttribute> {
    return this.token().then((token) =>
      this.client.patch<ApiAttribute>(
        `/api/v1/admin/attributes/${encodeURIComponent(id)}`,
        input,
        token,
      ),
    );
  }

  listProducts(query?: string): Promise<components["schemas"]["AdminProductsResponse"]> {
    const params = new URLSearchParams({ limit: "100", offset: "0" });
    if (query?.trim()) params.set("q", query.trim());
    return this.token().then((token) =>
      this.client.get<components["schemas"]["AdminProductsResponse"]>(
        `/api/v1/admin/products?${params.toString()}`,
        undefined,
        token,
      ),
    );
  }

  getProduct(id: string): Promise<ApiProduct> {
    return this.token().then((token) =>
      this.client.get<ApiProduct>(
        `/api/v1/admin/products/${encodeURIComponent(id)}`,
        undefined,
        token,
      ),
    );
  }

  createProduct(input: ProductCreateBody): Promise<ApiProduct> {
    return this.token().then((token) =>
      this.client.post<ApiProduct>("/api/v1/admin/products", input, token),
    );
  }

  updateProduct(id: string, input: ProductPatchBody): Promise<ApiProduct> {
    return this.token().then((token) =>
      this.client.patch<ApiProduct>(
        `/api/v1/admin/products/${encodeURIComponent(id)}`,
        input,
        token,
      ),
    );
  }

  publishProduct(id: string): Promise<ApiProduct> {
    return this.token().then((token) =>
      this.client.post<ApiProduct>(
        `/api/v1/admin/products/${encodeURIComponent(id)}/publish`,
        {},
        token,
      ),
    );
  }

  archiveProduct(id: string): Promise<ApiProduct> {
    return this.token().then((token) =>
      this.client.post<ApiProduct>(
        `/api/v1/admin/products/${encodeURIComponent(id)}/archive`,
        {},
        token,
      ),
    );
  }

  createVariant(productId: string, input: VariantCreateBody): Promise<ApiProduct> {
    return this.token().then((token) =>
      this.client.post<ApiProduct>(
        `/api/v1/admin/products/${encodeURIComponent(productId)}/variants`,
        input,
        token,
      ),
    );
  }

  updateVariant(
    productId: string,
    variantId: string,
    input: VariantPatchBody,
  ): Promise<ApiProduct> {
    return this.token().then((token) =>
      this.client.patch<ApiProduct>(
        `/api/v1/admin/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
        input,
        token,
      ),
    );
  }

  archiveVariant(productId: string, variantId: string): Promise<ApiProduct> {
    return this.token().then((token) =>
      this.client.post<ApiProduct>(
        `/api/v1/admin/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}/archive`,
        {},
        token,
      ),
    );
  }

  listInventory(): Promise<{ items: ApiInventoryRow[] }> {
    return this.token().then((token) =>
      this.client.get<{ items: ApiInventoryRow[] }>("/api/v1/admin/inventory", undefined, token),
    );
  }

  listStockMovements(variantId?: string): Promise<{ items: ApiStockMovement[] }> {
    const query = variantId ? `?variantId=${encodeURIComponent(variantId)}` : "";
    return this.token().then((token) =>
      this.client.get<{ items: ApiStockMovement[] }>(
        `/api/v1/admin/inventory/movements${query}`,
        undefined,
        token,
      ),
    );
  }

  adjustInventory(input: Record<string, unknown>, operationKey: string): Promise<ApiInventoryRow> {
    return this.token().then((token) =>
      this.client.post<ApiInventoryRow>(
        "/api/v1/admin/inventory/adjustments",
        input,
        token,
        undefined,
        { "idempotency-key": operationKey },
      ),
    );
  }

  updateInventorySettings(
    variantId: string,
    input: Record<string, unknown>,
  ): Promise<ApiInventoryRow> {
    return this.token().then((token) =>
      this.client.patch<ApiInventoryRow>(
        `/api/v1/admin/inventory/${encodeURIComponent(variantId)}`,
        input,
        token,
      ),
    );
  }
}

export class ApiAdminCategoryRepository implements AdminCategoryRepository {
  constructor(private readonly api = new AdminCatalogApi()) {}

  async list(): Promise<AdminCategory[]> {
    return (await this.api.listCategories()).items.map(mapCategory);
  }

  async getById(id: string): Promise<AdminCategory | null> {
    return (await this.list()).find((category) => category.id === id) ?? null;
  }

  async create(input: AdminCategoryInput): Promise<AdminCategory> {
    return mapCategory(await this.api.createCategory(categoryBody(input)));
  }

  async update(id: string, input: Partial<AdminCategoryInput>): Promise<AdminCategory> {
    return mapCategory(await this.api.updateCategory(id, categoryPatch(input)));
  }

  async uploadImage(
    file: File,
    name: string,
    alt: string,
  ): Promise<Awaited<ReturnType<AdminCatalogApi["uploadCategoryImage"]>>> {
    return this.api.uploadCategoryImage(file, name, alt);
  }

  async delete(id: string): Promise<void> {
    await this.api.updateCategory(id, { status: "archived" });
  }

  async move(id: string, direction: "up" | "down"): Promise<void> {
    await this.api.reorderCategory(id, direction);
  }
}

export class ApiAdminAttributeRepository implements AdminAttributeRepository {
  constructor(private readonly api = new AdminCatalogApi()) {}

  async list(): Promise<AdminAttribute[]> {
    return (await this.api.listAttributes()).items.map(mapAttribute);
  }

  async getById(id: string): Promise<AdminAttribute | null> {
    return (await this.list()).find((attribute) => attribute.id === id) ?? null;
  }

  async create(input: AdminAttributeInput): Promise<AdminAttribute> {
    return mapAttribute(await this.api.createAttribute(attributeBody(input)));
  }

  async update(id: string, input: Partial<AdminAttributeInput>): Promise<AdminAttribute> {
    return mapAttribute(await this.api.updateAttribute(id, attributePatch(input)));
  }

  async delete(id: string): Promise<void> {
    await this.api.updateAttribute(id, { status: "archived" });
  }
}

export class ApiAdminProductRepository implements AdminProductRepository {
  constructor(private readonly api = new AdminCatalogApi()) {}

  async list(): Promise<AdminProduct[]> {
    const response = await this.api.listProducts();
    return response.items.map(mapProduct);
  }

  async getById(id: string): Promise<AdminProduct | null> {
    try {
      return mapProduct(await this.api.getProduct(id));
    } catch (error) {
      if (error instanceof HbsApiError && error.status === 404) return null;
      throw error;
    }
  }

  async create(input: AdminProductInput): Promise<AdminProduct> {
    let dto = await this.api.createProduct(productBody(input));
    for (const variant of input.variants) {
      dto = await this.api.createVariant(dto.id, variantBody(variant));
    }
    return mapProduct(dto);
  }

  async update(id: string, input: Partial<AdminProductInput>): Promise<AdminProduct> {
    const current = await this.api.getProduct(id);
    let dto = await this.api.updateProduct(id, productPatch(input, current.version));
    const variants = input.variants;
    if (variants === undefined) return mapProduct(dto);

    // The product PATCH already bumps the product version. Re-read it before
    // touching a real variant so an API response/cache cannot provide a stale
    // expectedVersion to the variant endpoint.
    dto = await this.api.getProduct(id);
    const seen = new Set<string>();

    for (const variant of variants) {
      const existing = current.variants.find((item) => item.id === variant.id);
      if (existing) {
        seen.add(existing.id);
        if (variantFingerprint(variant) === variantFingerprint(mapVariant(existing))) continue;
        dto = await this.api.updateVariant(id, existing.id, variantPatch(variant, dto.version));
      } else {
        dto = await this.api.createVariant(id, variantBody(variant));
      }
    }

    for (const existing of current.variants) {
      if (!seen.has(existing.id) && variants.some((variant) => variant.id === existing.id))
        continue;
      if (!variants.some((variant) => variant.id === existing.id)) {
        dto = await this.api.archiveVariant(id, existing.id);
      }
    }
    return mapProduct(dto);
  }

  async delete(id: string): Promise<void> {
    await this.api.archiveProduct(id);
  }

  async duplicate(id: string): Promise<AdminProduct> {
    const source = await this.getById(id);
    if (!source) throw new Error("Produit introuvable.");
    const suffix = Date.now().toString(36).slice(-5);
    return this.create({
      ...source,
      name: `${source.name} (copie)`,
      slug: `${source.slug}-copie-${suffix}`,
      reference: `${source.reference}-C${suffix.toUpperCase()}`,
      status: "draft",
    });
  }

  async setStatus(id: string, status: AdminProduct["status"]): Promise<AdminProduct> {
    if (status === "published") return mapProduct(await this.api.publishProduct(id));
    if (status === "archived") return mapProduct(await this.api.archiveProduct(id));
    throw new Error("La dépublication sera disponible avec l’endpoint d’unpublish du backend.");
  }

  async isUsedInOrders(): Promise<boolean> {
    return false;
  }
}

function mapInventoryRow(row: ApiInventoryRow): InventoryRow {
  const variant: AdminVariant = {
    id: row.variant.id,
    sku: row.variant.sku,
    colorId: row.variant.colorId,
    colorLabel: row.variant.colorLabel,
    widthCm: row.variant.widthCm,
    heightCm: row.variant.heightCm,
    curtainHeader: row.variant.curtainHeader,
    ...(row.variant.eyeletColor ? { eyeletColor: row.variant.eyeletColor } : {}),
    ...(row.variant.lining ? { lining: row.variant.lining } : {}),
    priceMinor: row.variant.priceMinor,
    ...(row.variant.compareAtPriceMinor === undefined
      ? {}
      : { compareAtPriceMinor: row.variant.compareAtPriceMinor }),
    stock: row.variant.stock,
    lowStockThreshold: row.variant.lowStockThreshold,
    availability: row.variant.availability,
    ...(row.variant.imageUrl ? { imageUrl: row.variant.imageUrl } : {}),
    isActive: row.variant.isActive,
    isDefault: row.variant.isDefault,
    options: row.variant.options,
    ...(row.variant.packQuantity === undefined ? {} : { packQuantity: row.variant.packQuantity }),
    trackInventory: row.variant.trackInventory,
  };
  return {
    productId: row.productId,
    productName: row.productName,
    categoryId: row.categoryId,
    variant,
    updatedAt: row.updatedAt,
  };
}

function mapStockMovement(movement: ApiStockMovement): StockMovement {
  return {
    id: movement.id,
    variantId: movement.variantId,
    productId: movement.productId,
    type: movement.type,
    quantity: movement.quantity,
    reason: movement.reason,
    ...(movement.note ? { note: movement.note } : {}),
    ...(movement.previousStock === undefined ? {} : { previousStock: movement.previousStock }),
    ...(movement.resultingStock === undefined ? {} : { resultingStock: movement.resultingStock }),
    createdAt: movement.createdAt,
    ...(movement.userId ? { userId: movement.userId } : {}),
  };
}

function operationKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `admin-${Date.now()}-${Math.random()}`;
}

export class ApiAdminInventoryRepository implements AdminInventoryRepository {
  constructor(private readonly api = new AdminCatalogApi()) {}

  async list(): Promise<InventoryRow[]> {
    return (await this.api.listInventory()).items.map(mapInventoryRow);
  }

  async adjust(input: StockAdjustmentInput): Promise<InventoryRow> {
    const reason = [
      "purchase",
      "sale_correction",
      "customer_return",
      "damaged",
      "inventory_correction",
      "manual_adjustment",
      "other",
    ].includes(input.reason)
      ? input.reason
      : "other";
    const row = await this.api.adjustInventory(
      {
        productId: input.productId,
        variantId: input.variantId,
        type: input.type,
        quantity: input.quantity,
        reason,
        ...(input.note ? { note: input.note } : {}),
        ...(input.lowStockThreshold === undefined
          ? {}
          : { lowStockThreshold: input.lowStockThreshold }),
        ...(input.availability ? { availability: input.availability } : {}),
      },
      operationKey(),
    );
    return mapInventoryRow(row);
  }

  async updateSettings(input: StockSettingsInput): Promise<InventoryRow> {
    return mapInventoryRow(
      await this.api.updateInventorySettings(input.variantId, {
        productId: input.productId,
        lowStockThreshold: input.lowStockThreshold,
        ...(input.availability ? { availability: input.availability } : {}),
      }),
    );
  }

  async movements(variantId?: string): Promise<StockMovement[]> {
    return (await this.api.listStockMovements(variantId)).items.map(mapStockMovement);
  }
}

export { mapAttribute, mapCategory, mapInventoryRow, mapProduct, mapVariant };
