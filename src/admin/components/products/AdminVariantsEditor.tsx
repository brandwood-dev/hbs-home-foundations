import { useMemo } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AdminColorSelectField,
  AdminField,
  AdminFormSection,
  AdminMoneyField,
  AdminNumberField,
  AdminSelectField,
  AdminSwitchField,
} from "@/admin/components/ui/AdminForm";
import { AdminEmptyState } from "@/admin/components/ui/AdminStates";
import {
  ADMIN_VARIANT_AXES,
  type AdminVariantAxisKey,
} from "@/admin/config/admin-variant-axes.config";
import type { AdminProductCategoryKey, AdminVariant } from "@/admin/types/admin.types";
import type { AdminColorOption } from "@/admin/components/ui/AdminForm";
import { adminId, discountPercent, marginPercent } from "@/admin/utils/admin.utils";
import {
  validateVariant,
  type VariantValidationContext,
} from "@/admin/services/products/admin-variant-validation";
import {
  createEmptyVariant,
  variantSummary,
} from "@/admin/services/products/admin-product-mappers";
import { generateVariantSku } from "@/admin/services/products/admin-product-slug";

const AVAILABILITY_OPTIONS = [
  { value: "in_stock", label: "En stock" },
  { value: "low_stock", label: "Stock faible" },
  { value: "out_of_stock", label: "Rupture" },
  { value: "made_to_order", label: "Sur commande" },
];

export function AdminVariantsEditor({
  variants,
  axes,
  foreignSkus,
  category,
  material,
  colorOptions,
  productReference,
  supportsInventory,
  requiresPrice,
  onChange,
}: {
  variants: AdminVariant[];
  axes: AdminVariantAxisKey[];
  foreignSkus: string[];
  category: AdminProductCategoryKey;
  material: string;
  colorOptions: AdminColorOption[];
  productReference: string;
  supportsInventory: boolean;
  requiresPrice: boolean;
  onChange: (variants: AdminVariant[]) => void;
}) {
  const context: VariantValidationContext = useMemo(
    () => ({
      axes,
      siblings: variants,
      foreignSkus,
      supportsInventory,
      requiresPrice,
      category,
      material,
    }),
    [axes, variants, foreignSkus, supportsInventory, requiresPrice, category, material],
  );

  function update(id: string, patch: Partial<AdminVariant>) {
    onChange(variants.map((variant) => (variant.id === id ? { ...variant, ...patch } : variant)));
  }

  /** Supprime la clé quand le montant est vide (exactOptionalPropertyTypes). */
  function replaceOptionalMoney(
    variant: AdminVariant,
    key: "compareAtPriceMinor" | "costMinor",
    value: number | undefined,
  ) {
    onChange(
      variants.map((item) => {
        if (item.id !== variant.id) return item;
        const next = { ...item };
        if (value == null) delete next[key];
        else next[key] = value;
        return next;
      }),
    );
  }

  function updateOption(variant: AdminVariant, key: string, value: string | number) {
    update(variant.id, { options: { ...(variant.options ?? {}), [key]: value } });
  }

  function nextSku(colorId = ""): string {
    const taken = new Set(variants.map((variant) => variant.sku));
    for (let index = variants.length; ; index += 1) {
      const candidate = generateVariantSku(productReference || "HBS-PRODUIT", index, colorId);
      if (!taken.has(candidate)) return candidate;
    }
  }

  return (
    <AdminFormSection
      title="Variantes"
      description="Chaque combinaison doit être unique et posséder un SKU distinct."
    >
      {variants.length === 0 ? (
        <AdminEmptyState
          title="Aucune variante"
          description="Ajoutez au moins une variante active pour pouvoir publier ce produit."
        />
      ) : null}

      <div className="grid gap-4">
        {variants.map((variant, index) => {
          const errors = validateVariant(variant, context);
          const discount = discountPercent(variant.priceMinor, variant.compareAtPriceMinor);
          const margin = marginPercent(variant.priceMinor, variant.costMinor);
          return (
            <article key={variant.id} className="rounded-lg border border-border p-4">
              <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">Variante {index + 1}</span>
                  <span className="text-xs text-muted-foreground">{variantSummary(variant)}</span>
                  {discount ? <Badge variant="secondary">-{discount} %</Badge> : null}
                  {margin != null ? <Badge variant="outline">Marge {margin} %</Badge> : null}
                  {Object.keys(errors).length > 0 ? (
                    <Badge variant="destructive">À corriger</Badge>
                  ) : null}
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Dupliquer la variante"
                    onClick={() =>
                      onChange([
                        ...variants,
                        {
                          ...variant,
                          id: adminId("var"),
                          sku: nextSku(variant.colorId),
                        },
                      ])
                    }
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Supprimer la variante"
                    onClick={() => onChange(variants.filter((item) => item.id !== variant.id))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </header>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AdminField
                  label="SKU"
                  required
                  value={variant.sku}
                  error={errors["sku"]}
                  hint="Généré automatiquement à partir de la référence du produit."
                  readOnly
                  onChange={() => undefined}
                />

                {axes.map((axisKey) => {
                  const axis = ADMIN_VARIANT_AXES[axisKey];
                  if (axisKey === "color") {
                    return (
                      <AdminColorSelectField
                        key={axisKey}
                        label={axis.label}
                        required
                        value={variant.colorId}
                        error={errors["colorId"]}
                        options={
                          variant.colorId &&
                          !colorOptions.some((option) => option.value === variant.colorId)
                            ? [
                                ...colorOptions,
                                {
                                  value: variant.colorId,
                                  label: variant.colorLabel || variant.colorId,
                                },
                              ]
                            : colorOptions
                        }
                        onChange={(value) => {
                          const option = colorOptions.find((item) => item.value === value);
                          update(variant.id, {
                            colorId: value,
                            colorLabel: option?.label ?? value,
                          });
                        }}
                      />
                    );
                  }
                  if (axisKey === "dimensions") {
                    return (
                      <div key={axisKey} className="grid grid-cols-2 gap-2">
                        <AdminNumberField
                          label="Largeur (cm)"
                          value={variant.widthCm}
                          error={errors["dimensions"]}
                          onChange={(value) => update(variant.id, { widthCm: value })}
                        />
                        <AdminNumberField
                          label="Hauteur (cm)"
                          value={variant.heightCm}
                          onChange={(value) => update(variant.id, { heightCm: value })}
                        />
                      </div>
                    );
                  }
                  if (axisKey === "curtain_header") {
                    return (
                      <AdminSelectField
                        key={axisKey}
                        label={axis.label}
                        value={variant.curtainHeader}
                        options={axis.options ?? []}
                        onChange={(value) => update(variant.id, { curtainHeader: value })}
                      />
                    );
                  }
                  if (axisKey === "eyelet_color") {
                    return (
                      <AdminSelectField
                        key={axisKey}
                        label={axis.label}
                        value={variant.eyeletColor ?? ""}
                        error={errors["eyeletColor"]}
                        options={axis.options ?? []}
                        {...(axis.hint ? { hint: axis.hint } : {})}
                        onChange={(value) => update(variant.id, { eyeletColor: value })}
                      />
                    );
                  }
                  if (axisKey === "lining") {
                    return (
                      <AdminSelectField
                        key={axisKey}
                        label={axis.label}
                        value={variant.lining ?? ""}
                        error={errors["lining"]}
                        options={axis.options ?? []}
                        onChange={(value) => update(variant.id, { lining: value })}
                      />
                    );
                  }
                  if (axisKey === "pack_quantity") {
                    return (
                      <AdminNumberField
                        key={axisKey}
                        label={axis.label}
                        min={1}
                        value={variant.packQuantity ?? 1}
                        error={errors["packQuantity"]}
                        onChange={(value) => update(variant.id, { packQuantity: value })}
                      />
                    );
                  }
                  const raw = variant.options?.[axisKey];
                  if (axis.kind === "select") {
                    return (
                      <AdminSelectField
                        key={axisKey}
                        label={axis.label}
                        value={typeof raw === "string" ? raw : ""}
                        options={axis.options ?? []}
                        {...(axis.hint ? { hint: axis.hint } : {})}
                        onChange={(value) => updateOption(variant, axisKey, value)}
                      />
                    );
                  }
                  if (axis.kind === "number") {
                    return (
                      <AdminNumberField
                        key={axisKey}
                        label={axis.label}
                        value={typeof raw === "number" ? raw : 0}
                        onChange={(value) => updateOption(variant, axisKey, value)}
                      />
                    );
                  }
                  return (
                    <AdminField
                      key={axisKey}
                      label={axis.label}
                      value={raw == null ? "" : String(raw)}
                      onChange={(value) => updateOption(variant, axisKey, value)}
                    />
                  );
                })}

                <AdminMoneyField
                  label="Prix de vente"
                  required={requiresPrice}
                  valueMinor={variant.priceMinor}
                  error={errors["priceMinor"]}
                  onChange={(value) => update(variant.id, { priceMinor: value ?? 0 })}
                />
                <AdminMoneyField
                  label="Ancien prix"
                  valueMinor={variant.compareAtPriceMinor}
                  error={errors["compareAtPriceMinor"]}
                  onChange={(value) => replaceOptionalMoney(variant, "compareAtPriceMinor", value)}
                />
                <AdminMoneyField
                  label="Coût d'achat"
                  valueMinor={variant.costMinor}
                  onChange={(value) => replaceOptionalMoney(variant, "costMinor", value)}
                />

                {supportsInventory ? (
                  <>
                    <AdminNumberField
                      label="Stock"
                      value={variant.stock}
                      error={errors["stock"]}
                      onChange={(value) => update(variant.id, { stock: value })}
                    />
                    <AdminNumberField
                      label="Seuil de stock faible"
                      value={variant.lowStockThreshold}
                      error={errors["lowStockThreshold"]}
                      onChange={(value) => update(variant.id, { lowStockThreshold: value })}
                    />
                  </>
                ) : null}

                <AdminSelectField
                  label="Disponibilité"
                  value={variant.availability}
                  options={AVAILABILITY_OPTIONS}
                  onChange={(value) =>
                    update(variant.id, { availability: value as AdminVariant["availability"] })
                  }
                />
              </div>

              {errors["combination"] ? (
                <p role="alert" className="mt-2 text-[11px] font-medium text-red-600">
                  {errors["combination"]}
                </p>
              ) : null}

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <AdminSwitchField
                  label="Variante active"
                  description="Une variante inactive n'est pas proposée sur le site."
                  checked={variant.isActive}
                  onChange={(checked) => update(variant.id, { isActive: checked })}
                />
                <AdminSwitchField
                  label="Suivi du stock"
                  description="Désactivez pour les produits sans gestion de stock."
                  checked={variant.trackInventory ?? true}
                  onChange={(checked) => update(variant.id, { trackInventory: checked })}
                />
              </div>
            </article>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="justify-self-start"
        onClick={() =>
          onChange([
            ...variants,
            {
              ...createEmptyVariant(),
              sku: nextSku(),
            },
          ])
        }
      >
        <Plus className="mr-1 size-4" /> Ajouter une variante
      </Button>
    </AdminFormSection>
  );
}
