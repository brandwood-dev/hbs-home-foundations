import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ExternalLink, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AdminField,
  AdminFormSection,
  AdminMoneyField,
  AdminNumberField,
  AdminSelectField,
  AdminSwitchField,
} from "@/admin/components/ui/AdminForm";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import { AdminCard } from "@/admin/components/ui/AdminStates";
import { AdminTabs, AdminUnsavedChangesDialog } from "@/admin/components/ui/AdminOverlays";
import { AdminVariantsEditor } from "@/admin/components/products/AdminVariantsEditor";
import { AdminProductImagesEditor } from "@/admin/components/products/AdminProductImagesEditor";
import {
  ADMIN_PRODUCT_CATEGORY_LABELS,
  type AdminAttribute,
  type AdminProduct,
  type AdminProductCategoryKey,
  type AdminSellingMode,
} from "@/admin/types/admin.types";
import {
  ADMIN_PRODUCT_FIELDS,
  SELLING_MODE_HINTS,
  SELLING_MODE_LABELS,
  adminProductCategoryConfigs,
  visibleProductFields,
} from "@/admin/config/admin-product-fields.config";
import {
  emptyProductForm,
  formToProductDraft,
  formToProductInput,
  productToForm,
  type AdminProductFormValues,
} from "@/admin/services/products/admin-product-mappers";
import {
  validateProductForPublication,
  validateProductIdentity,
} from "@/admin/services/products/admin-product-validation";
import {
  generateProductReference,
  generateProductSlug,
  publicProductUrl,
} from "@/admin/services/products/admin-product-slug";
import {
  useAdminAttributes,
  useAdminCategories,
  useAdminProducts,
} from "@/admin/hooks/admin.queries";
import {
  useCreateAdminProduct,
  useUpdateAdminProduct,
} from "@/admin/hooks/admin-catalog.mutations";

const CATEGORY_OPTIONS = Object.entries(ADMIN_PRODUCT_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function hasProductAttributeValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === "object" && Object.keys(value).length > 0;
}

function validatePublicationWithAttributes(
  values: AdminProductFormValues,
  catalogAttributes: readonly AdminAttribute[],
) {
  const issues = validateProductForPublication(formToProductDraft(values));
  for (const attribute of catalogAttributes) {
    if (attribute.isRequired && !hasProductAttributeValue(values.fields[attribute.key])) {
      issues.push(`L'attribut « ${attribute.name} » est obligatoire.`);
    }
  }
  return issues;
}

function filterFieldsForCatalogCategory(
  fields: AdminProductFormValues["fields"],
  categorySlug: string | undefined,
  attributes: readonly AdminAttribute[],
): AdminProductFormValues["fields"] {
  if (!categorySlug || attributes.length === 0) return fields;
  const definitions = new Map(attributes.map((attribute) => [attribute.key, attribute]));
  return Object.fromEntries(
    Object.entries(fields).filter(([key]) => {
      const definition = definitions.get(key);
      if (!definition) return true;
      if (definition.isActive === false) return false;
      return !definition.categories?.length || definition.categories.includes(categorySlug);
    }),
  );
}

export function AdminProductForm({ product }: { product?: AdminProduct }) {
  const navigate = useNavigate();
  const { data: products = [] } = useAdminProducts();
  const { data: categories = [] } = useAdminCategories();
  const { data: attributes = [] } = useAdminAttributes();
  const createProduct = useCreateAdminProduct(() => navigate({ to: "/admin/produits" }));
  const updateProduct = useUpdateAdminProduct();

  const [values, setValues] = useState<AdminProductFormValues>(() =>
    product ? productToForm(product) : emptyProductForm("rideaux", categories[0]?.id ?? ""),
  );
  const [dirty, setDirty] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (product || values.categoryId || categories.length === 0) return;
    setValues((current) => {
      const matchingCategory = categories.find((category) => category.slug === current.category);
      const selectedCategory = matchingCategory ?? categories[0];
      if (!selectedCategory) return current;
      const nextCategory = Object.prototype.hasOwnProperty.call(
        ADMIN_PRODUCT_CATEGORY_LABELS,
        selectedCategory.slug,
      )
        ? (selectedCategory.slug as AdminProductCategoryKey)
        : current.category;
      return { ...current, category: nextCategory, categoryId: selectedCategory.id };
    });
  }, [categories, product, values.category, values.categoryId]);

  const config = adminProductCategoryConfigs[values.category];
  const selectedCatalogCategorySlug = useMemo(
    () => categories.find((category) => category.id === values.categoryId)?.slug,
    [categories, values.categoryId],
  );
  const catalogAttributes = useMemo(
    () =>
      attributes
        .filter((attribute) => attribute.isActive !== false)
        .filter(
          (attribute) =>
            !attribute.categories?.length ||
            (selectedCatalogCategorySlug !== undefined &&
              attribute.categories.includes(selectedCatalogCategorySlug)),
        )
        .sort((left, right) => left.order - right.order || left.name.localeCompare(right.name)),
    [attributes, selectedCatalogCategorySlug],
  );
  const dynamicAttributes = useMemo(() => {
    const staticKeys = new Set(Object.keys(ADMIN_PRODUCT_FIELDS));
    return catalogAttributes.filter((attribute) => !staticKeys.has(attribute.key));
  }, [catalogAttributes]);
  const others = useMemo(
    () => products.filter((item) => item.id !== values.id),
    [products, values.id],
  );
  const foreignSkus = useMemo(
    () => others.flatMap((item) => item.variants.map((variant) => variant.sku)),
    [others],
  );

  const draft = useMemo(() => formToProductDraft(values), [values]);
  const identityErrors = useMemo(() => validateProductIdentity(draft, { others }), [draft, others]);
  const publicationIssues = useMemo(
    () => validatePublicationWithAttributes(values, catalogAttributes),
    [values, catalogAttributes],
  );
  const isCustomQuote = values.sellingMode === "custom_quote";

  function patch(next: Partial<AdminProductFormValues>) {
    setDirty(true);
    setValues((current) => ({ ...current, ...next }));
  }

  function patchField(key: string, value: string | number | boolean | string[]) {
    setDirty(true);
    setValues((current) => ({ ...current, fields: { ...current.fields, [key]: value } }));
  }

  function handleNameChange(name: string) {
    setDirty(true);
    setValues((current) => ({
      ...current,
      name,
      slug: current.slugTouched
        ? current.slug
        : generateProductSlug(
            name,
            others.map((item) => item.slug),
          ),
      reference:
        current.reference ||
        generateProductReference(
          name,
          others.map((item) => item.reference),
        ),
      seoTitle: current.seoTitle || `${name} — HBS HOME`,
    }));
  }

  function save(status: AdminProduct["status"]) {
    setSubmitted(true);
    const next = { ...values, status };
    const identity = validateProductIdentity(formToProductDraft(next), { others });
    if (Object.keys(identity).length > 0) return;
    if (
      status === "published" &&
      validatePublicationWithAttributes(next, catalogAttributes).length > 0
    )
      return;

    const input = formToProductInput(next);
    setValues(next);
    setDirty(false);
    if (values.id) updateProduct.mutate({ id: values.id, input });
    else createProduct.mutate(input);
  }

  const generalTab = (
    <div className="grid gap-4">
      <AdminFormSection title="Informations générales">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Nom du produit"
            required
            value={values.name}
            error={submitted ? identityErrors["name"] : undefined}
            onChange={handleNameChange}
          />
          <AdminField
            label="Référence interne"
            required
            value={values.reference}
            error={submitted ? identityErrors["reference"] : undefined}
            onChange={(value) => patch({ reference: value.toUpperCase() })}
          />
          <AdminSelectField
            label="Catégorie"
            required
            value={values.category}
            options={CATEGORY_OPTIONS}
            hint="Change les champs spécifiques et les axes de variantes disponibles."
            onChange={(value) => {
              const category = value as AdminProductCategoryKey;
              const nextConfig = adminProductCategoryConfigs[category];
              patch({
                category,
                fields: {},
                ...(nextConfig.sellingModes.includes(values.sellingMode)
                  ? {}
                  : { sellingMode: nextConfig.sellingModes[0] as AdminSellingMode }),
              });
            }}
          />
          <AdminSelectField
            label="Catégorie du catalogue"
            value={values.categoryId}
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            onChange={(value) => {
              const categorySlug = categories.find((category) => category.id === value)?.slug;
              patch({
                categoryId: value,
                fields: filterFieldsForCatalogCategory(values.fields, categorySlug, attributes),
              });
            }}
          />
          <AdminSelectField
            label="Unité de vente"
            required
            value={values.sellingMode}
            options={config.sellingModes.map((mode) => ({
              value: mode,
              label: SELLING_MODE_LABELS[mode],
              description: SELLING_MODE_HINTS[mode],
            }))}
            onChange={(value) => patch({ sellingMode: value as AdminSellingMode })}
          />
          <AdminField label="Marque" value={values.brand} onChange={(v) => patch({ brand: v })} />
        </div>

        <AdminField
          label="Description courte"
          required
          multiline
          rows={2}
          value={values.shortDescription}
          onChange={(value) => patch({ shortDescription: value })}
        />
        <AdminField
          label="Description longue"
          multiline
          rows={6}
          value={values.longDescription}
          onChange={(value) => patch({ longDescription: value })}
        />

        <div className="grid gap-1.5">
          <Label className="text-xs font-medium">Étiquettes</Label>
          <Input
            value={values.tags.join(", ")}
            placeholder="nouveauté, best-seller…"
            aria-label="Étiquettes"
            onChange={(event) =>
              patch({
                tags: event.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
      </AdminFormSection>

      {values.sellingMode === "pack" ? (
        <AdminFormSection title="Configuration du lot">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField
              label="Contenu du lot"
              value={values.packContent}
              onChange={(value) => patch({ packContent: value })}
            />
            <AdminNumberField
              label="Quantité par lot"
              min={1}
              value={values.packQuantity}
              onChange={(value) => patch({ packQuantity: value })}
            />
          </div>
        </AdminFormSection>
      ) : null}

      {values.sellingMode === "per_meter" ? (
        <AdminFormSection title="Vente au mètre">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminMoneyField
              label="Prix au mètre"
              valueMinor={values.perMeterPriceMinor}
              onChange={(value) => patch({ perMeterPriceMinor: value ?? 0 })}
            />
            <AdminNumberField
              label="Longueur min. (cm)"
              value={values.perMeterMinCm}
              onChange={(value) => patch({ perMeterMinCm: value })}
            />
            <AdminNumberField
              label="Longueur max. (cm)"
              value={values.perMeterMaxCm}
              onChange={(value) => patch({ perMeterMaxCm: value })}
            />
            <AdminNumberField
              label="Pas (cm)"
              min={1}
              value={values.perMeterStepCm}
              onChange={(value) => patch({ perMeterStepCm: value })}
            />
          </div>
        </AdminFormSection>
      ) : null}

      {config.supportsCustomQuote ? (
        <AdminFormSection title="Devis">
          <AdminSwitchField
            label="Activer la demande de devis"
            description="Le site public affiche un formulaire de devis au lieu du bouton d'achat."
            checked={values.customQuoteEnabled}
            onChange={(checked) => patch({ customQuoteEnabled: checked })}
          />
        </AdminFormSection>
      ) : null}
    </div>
  );

  const specificTab = (
    <AdminFormSection
      title={`Caractéristiques — ${ADMIN_PRODUCT_CATEGORY_LABELS[values.category]}`}
      description="Ces champs alimentent les filtres et la fiche produit publique."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {visibleProductFields(values.category, values.fields).map((field) => {
          const raw = values.fields[field.key];
          const required = config.requiredFields.includes(field.key);
          if (field.kind === "boolean") {
            return (
              <AdminSwitchField
                key={field.key}
                label={field.label}
                {...(field.hint ? { description: field.hint } : {})}
                checked={raw === true}
                onChange={(checked) => patchField(field.key, checked)}
              />
            );
          }
          if (field.kind === "select") {
            return (
              <AdminSelectField
                key={field.key}
                label={field.label}
                required={required}
                value={typeof raw === "string" ? raw : ""}
                options={field.options ?? []}
                {...(field.hint ? { hint: field.hint } : {})}
                onChange={(value) => patchField(field.key, value)}
              />
            );
          }
          if (field.kind === "number") {
            return (
              <AdminNumberField
                key={field.key}
                label={field.label}
                value={typeof raw === "number" ? raw : 0}
                onChange={(value) => patchField(field.key, value)}
              />
            );
          }
          if (field.kind === "tags") {
            return (
              <AdminField
                key={field.key}
                label={field.label}
                hint={field.hint ?? "Séparez les valeurs par une virgule."}
                value={Array.isArray(raw) ? raw.join(", ") : ""}
                onChange={(value) =>
                  patchField(
                    field.key,
                    value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  )
                }
              />
            );
          }
          return (
            <AdminField
              key={field.key}
              label={field.label}
              required={required}
              multiline={field.kind === "textarea"}
              rows={3}
              {...(field.hint ? { hint: field.hint } : {})}
              value={typeof raw === "string" ? raw : ""}
              onChange={(value) => patchField(field.key, value)}
            />
          );
        })}
      </div>
      {dynamicAttributes.length > 0 ? (
        <div className="mt-6 grid gap-4 border-t border-border pt-5">
          <div>
            <h3 className="text-sm font-medium">Attributs personnalisés</h3>
            <p className="text-xs text-muted-foreground">
              Ces valeurs sont gérées par le catalogue et alimentent les filtres publics.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {dynamicAttributes.map((attribute) => renderDynamicAttribute(attribute))}
          </div>
        </div>
      ) : null}
    </AdminFormSection>
  );

  const seoTab = (
    <AdminFormSection title="Référencement">
      <div className="grid gap-4">
        <AdminField
          label="Slug"
          required
          value={values.slug}
          error={submitted ? identityErrors["slug"] : undefined}
          hint={`URL publique : ${publicProductUrl(values.slug || "…")}`}
          onChange={(value) => patch({ slug: value, slugTouched: true })}
        />
        <AdminField
          label="Titre SEO"
          value={values.seoTitle}
          hint={`${values.seoTitle.length}/60 caractères`}
          onChange={(value) => patch({ seoTitle: value })}
        />
        <AdminField
          label="Méta description"
          multiline
          rows={3}
          value={values.seoDescription}
          hint={`${values.seoDescription.length}/160 caractères`}
          onChange={(value) => patch({ seoDescription: value })}
        />
        <AdminField
          label="Image de partage (og:image)"
          value={values.seoOgImageUrl}
          onChange={(value) => patch({ seoOgImageUrl: value })}
        />
        <AdminSwitchField
          label="Indexable par les moteurs de recherche"
          checked={values.seoIndexable}
          onChange={(checked) => patch({ seoIndexable: checked })}
        />
      </div>
    </AdminFormSection>
  );

  function renderDynamicAttribute(attribute: AdminAttribute) {
    const raw = values.fields[attribute.key];
    const required = attribute.isRequired === true;
    const options = attribute.values
      .filter((value) => value.isActive !== false)
      .map((value) => ({ value: value.slug, label: value.label }));

    if (attribute.fieldType === "boolean") {
      return (
        <AdminSwitchField
          key={attribute.id}
          label={required ? `${attribute.name} *` : attribute.name}
          checked={raw === true}
          onChange={(checked) => patchField(attribute.key, checked)}
        />
      );
    }
    if (attribute.fieldType === "number" || attribute.fieldType === "measurement") {
      return (
        <AdminNumberField
          key={attribute.id}
          label={required ? `${attribute.name} *` : attribute.name}
          value={typeof raw === "number" ? raw : 0}
          onChange={(value) => patchField(attribute.key, value)}
        />
      );
    }
    if (
      attribute.fieldType === "select" ||
      attribute.fieldType === "single_select" ||
      attribute.fieldType === "color"
    ) {
      return (
        <AdminSelectField
          key={attribute.id}
          label={required ? `${attribute.name} *` : attribute.name}
          required={required}
          value={typeof raw === "string" ? raw : ""}
          options={options}
          {...(options.length === 0
            ? { hint: "Ajoutez d'abord les options dans l'attribut." }
            : {})}
          onChange={(value) => patchField(attribute.key, value)}
        />
      );
    }
    if (attribute.fieldType === "multi_select" || attribute.fieldType === "multiselect") {
      return (
        <AdminField
          key={attribute.id}
          label={required ? `${attribute.name} *` : attribute.name}
          required={required}
          hint="Séparez les options par une virgule."
          value={Array.isArray(raw) ? raw.join(", ") : ""}
          onChange={(value) =>
            patchField(
              attribute.key,
              value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
        />
      );
    }
    return (
      <AdminField
        key={attribute.id}
        label={required ? `${attribute.name} *` : attribute.name}
        required={required}
        value={typeof raw === "string" ? raw : ""}
        onChange={(value) => patchField(attribute.key, value)}
      />
    );
  }

  return (
    <div className="pb-24">
      <AdminPageHeader
        title={product ? product.name : "Nouveau produit"}
        description={
          product
            ? `Référence ${product.reference} · dernière modification enregistrée`
            : "Créez la fiche puis publiez-la lorsqu'elle est complète."
        }
        breadcrumbs={[
          { label: "Produits", href: "/admin/produits" },
          { label: product ? product.name : "Nouveau" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={values.status === "published" ? "default" : "secondary"}>
              {values.status === "published"
                ? "Publié"
                : values.status === "archived"
                  ? "Archivé"
                  : "Brouillon"}
            </Badge>
            {values.slug ? (
              <Button variant="outline" size="sm" asChild>
                <a href={publicProductUrl(values.slug)} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1 size-4" /> Voir la fiche
                </a>
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => (dirty ? setShowLeave(true) : navigate({ to: "/admin/produits" }))}
            >
              Retour
            </Button>
          </div>
        }
      />

      {submitted && Object.keys(identityErrors).length > 0 ? (
        <AdminCard className="mb-4 border-red-200 bg-red-50">
          <p className="flex items-center gap-2 text-sm font-medium text-red-800">
            <AlertTriangle className="size-4" /> Corrigez les erreurs avant d'enregistrer.
          </p>
          <ul className="mt-1 list-disc pl-5 text-xs text-red-700">
            {Object.values(identityErrors).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </AdminCard>
      ) : null}

      {publicationIssues.length > 0 ? (
        <AdminCard className="mb-4 border-amber-200 bg-amber-50">
          <p className="text-sm font-medium text-amber-900">
            Éléments requis avant publication ({publicationIssues.length})
          </p>
          <ul className="mt-1 list-disc pl-5 text-xs text-amber-800">
            {publicationIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </AdminCard>
      ) : null}

      <AdminTabs
        tabs={[
          { value: "general", label: "Général", content: generalTab },
          { value: "specifique", label: "Caractéristiques", content: specificTab },
          {
            value: "variantes",
            label: `Variantes (${values.variants.length})`,
            content: (
              <AdminVariantsEditor
                variants={values.variants}
                axes={config.variantAxes}
                foreignSkus={foreignSkus}
                supportsInventory={config.supportsInventory && !isCustomQuote}
                requiresPrice={!isCustomQuote}
                onChange={(variants) => patch({ variants })}
              />
            ),
          },
          {
            value: "medias",
            label: "Médias",
            content: (
              <AdminProductImagesEditor
                images={values.images}
                productSlug={values.slug}
                onChange={(images) => patch({ images })}
              />
            ),
          },
          { value: "seo", label: "SEO", content: seoTab },
        ]}
      />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur lg:pl-64">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-end gap-2">
          {dirty ? (
            <span className="mr-auto text-xs text-muted-foreground">
              Modifications non enregistrées
            </span>
          ) : null}
          <Button variant="outline" onClick={() => save("draft")}>
            <Save className="mr-1 size-4" /> Enregistrer le brouillon
          </Button>
          <Button
            onClick={() => save("published")}
            disabled={publicationIssues.length > 0}
            title={
              publicationIssues.length > 0
                ? "Complétez les éléments requis avant publication."
                : undefined
            }
          >
            Publier
          </Button>
        </div>
      </div>

      <AdminUnsavedChangesDialog
        open={showLeave}
        onOpenChange={setShowLeave}
        onDiscard={() => navigate({ to: "/admin/produits" })}
      />
    </div>
  );
}
