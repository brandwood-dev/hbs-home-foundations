import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import {
  AdminDataTable,
  AdminSearchInput,
  AdminSelectFilter,
  type AdminColumn,
} from "@/admin/components/ui/AdminDataTable";
import {
  AdminActionMenu,
  AdminConfirmDialog,
  AdminFormDrawer,
} from "@/admin/components/ui/AdminOverlays";
import { AdminStatusBadge } from "@/admin/components/ui/AdminStates";
import {
  AdminField,
  AdminNumberField,
  AdminSelectField,
  AdminSwitchField,
} from "@/admin/components/ui/AdminForm";
import { useAdminAttributes, useAdminCategories } from "@/admin/hooks/admin.queries";
import { useAdminDraftState } from "@/admin/hooks/useAdminDraftState";
import {
  useDeleteAdminAttribute,
  useSaveAdminAttribute,
} from "@/admin/hooks/admin-catalog.mutations";
import {
  ADMIN_PRODUCT_CATEGORY_LABELS,
  type AdminAttribute,
  type AdminAttributeFieldType,
  type AdminAttributeValue,
} from "@/admin/types/admin.types";
import { adminId, normalizeKey, slugify } from "@/admin/utils/admin.utils";

const FIELD_TYPES: Array<{ value: AdminAttributeFieldType; label: string }> = [
  { value: "text", label: "Texte" },
  { value: "number", label: "Nombre" },
  { value: "boolean", label: "Oui / Non" },
  { value: "single_select", label: "Liste (choix unique)" },
  { value: "multi_select", label: "Liste (choix multiple)" },
  { value: "color", label: "Couleur" },
  { value: "measurement", label: "Mesure" },
];

const LIST_TYPES: AdminAttributeFieldType[] = [
  "single_select",
  "multi_select",
  "select",
  "multiselect",
  "color",
];

interface AttributeDraft {
  id?: string;
  name: string;
  key: string;
  fieldType: AdminAttributeFieldType;
  isFilterable: boolean;
  isVariantAxis: boolean;
  isRequired: boolean;
  isActive: boolean;
  order: number;
  categories: string[];
  values: AdminAttributeValue[];
  isSystem: boolean;
}

function toDraft(attribute?: AdminAttribute): AttributeDraft {
  return {
    ...(attribute?.id ? { id: attribute.id } : {}),
    name: attribute?.name ?? "",
    key: attribute?.key ?? "",
    fieldType: attribute?.fieldType ?? "single_select",
    isFilterable: attribute?.isFilterable ?? true,
    isVariantAxis: attribute?.isVariantAxis ?? false,
    isRequired: attribute?.isRequired ?? false,
    isActive: attribute?.isActive ?? true,
    order: attribute?.order ?? 99,
    categories: attribute?.categories ?? [],
    values: attribute?.values ?? [],
    isSystem: attribute?.isSystem ?? false,
  };
}

export function AdminAttributesPage() {
  const { data: attributes = [], isLoading, error, refetch } = useAdminAttributes();
  const { data: categories = [] } = useAdminCategories();
  const saveAttribute = useSaveAdminAttribute();
  const deleteAttribute = useDeleteAdminAttribute();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [origin, setOrigin] = useState("all");
  const attributeDraftState = useAdminDraftState<AttributeDraft | null>(
    "hbs-admin-attribute-form",
    null,
  );
  const { value: draft, setValue: setDraft, setPersist, clear } = attributeDraftState;
  const [pendingDelete, setPendingDelete] = useState<AdminAttribute | null>(null);

  useEffect(() => setPersist(draft !== null), [draft, setPersist]);

  const categoryOptions = useMemo(
    () =>
      categories.length > 0
        ? categories.map((item) => ({ value: item.slug, label: item.name }))
        : Object.entries(ADMIN_PRODUCT_CATEGORY_LABELS).map(([value, label]) => ({
            value,
            label,
          })),
    [categories],
  );
  const categoryLabels = useMemo(
    () => new Map(categoryOptions.map((option) => [option.value, option.label])),
    [categoryOptions],
  );

  const rows = useMemo(() => {
    const query = normalizeKey(search);
    return attributes.filter((attribute) => {
      const categories = attribute.categories ?? [];
      if (
        (origin === "system" && attribute.isSystem !== true) ||
        (origin === "custom" && attribute.isSystem === true)
      ) {
        return false;
      }
      if (category !== "all" && categories.length > 0 && !categories.includes(category)) {
        return false;
      }
      if (!query) return true;
      return `${normalizeKey(attribute.name)} ${normalizeKey(attribute.key)}`.includes(query);
    });
  }, [attributes, search, category, origin]);

  const columns: AdminColumn<AdminAttribute>[] = [
    {
      id: "name",
      header: "Attribut",
      cell: (attribute) => (
        <div>
          <button
            type="button"
            className="font-medium hover:underline"
            onClick={() => setDraft(toDraft(attribute))}
          >
            {attribute.name}
          </button>
          <p className="text-xs text-muted-foreground">{attribute.key}</p>
        </div>
      ),
      sortValue: (attribute) => attribute.name,
    },
    {
      id: "type",
      header: "Type",
      cell: (attribute) =>
        FIELD_TYPES.find((type) => type.value === attribute.fieldType)?.label ??
        attribute.fieldType,
    },
    {
      id: "categories",
      header: "Catégories",
      cell: (attribute) =>
        (attribute.categories ?? []).length === 0
          ? "Toutes"
          : (attribute.categories ?? []).map((key) => categoryLabels.get(key) ?? key).join(", "),
    },
    { id: "values", header: "Valeurs", cell: (attribute) => attribute.values.length },
    {
      id: "usage",
      header: "Usage",
      cell: (attribute) => (
        <div className="flex flex-wrap gap-1">
          {attribute.isFilterable ? <AdminStatusBadge label="Filtre" tone="info" /> : null}
          {attribute.isVariantAxis ? <AdminStatusBadge label="Variante" tone="warning" /> : null}
          {attribute.isSystem ? <AdminStatusBadge label="Système" /> : null}
        </div>
      ),
    },
  ];

  function updateValue(index: number, patch: Partial<AdminAttributeValue>) {
    if (!draft) return;
    setDraft({
      ...draft,
      values: draft.values.map((value, i) => (i === index ? { ...value, ...patch } : value)),
    });
  }

  function submit() {
    if (!draft || !draft.name.trim()) return;
    saveAttribute.mutate(
      {
        ...(draft.id ? { id: draft.id } : {}),
        input: {
          name: draft.name.trim(),
          key: draft.key.trim() || slugify(draft.name).replace(/-/g, "_"),
          fieldType: draft.fieldType,
          isFilterable: draft.isFilterable,
          isVariantAxis: draft.isVariantAxis,
          isRequired: draft.isRequired,
          isActive: draft.isActive,
          order: draft.order,
          categories: draft.categories,
          values: draft.values.map((value, index) => ({ ...value, order: index + 1 })),
          isSystem: draft.isSystem,
        },
      },
      {
        onSuccess: () => {
          setDraft(null);
          clear();
        },
      },
    );
  }

  const showValues = draft ? LIST_TYPES.includes(draft.fieldType) : false;

  return (
    <div>
      <AdminPageHeader
        title="Attributs et filtres"
        description="Valeurs partagées par le catalogue et les filtres du site public."
        breadcrumbs={[{ label: "Catalogue" }, { label: "Attributs" }]}
        actions={
          <Button onClick={() => setDraft(toDraft())}>
            <Plus className="mr-1 size-4" /> Nouvel attribut
          </Button>
        }
      />

      <AdminDataTable
        rows={rows}
        columns={columns}
        rowKey={(attribute) => attribute.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        emptyTitle="Aucun attribut"
        toolbar={
          <>
            <AdminSearchInput value={search} onChange={setSearch} placeholder="Nom ou clé" />
            <AdminSelectFilter
              label="Catégorie"
              value={category}
              onChange={setCategory}
              options={categoryOptions}
            />
            <AdminSelectFilter
              label="Origine"
              value={origin}
              onChange={setOrigin}
              options={[
                { value: "all", label: "Toutes" },
                { value: "system", label: "Système" },
                { value: "custom", label: "Personnalisé" },
              ]}
            />
          </>
        }
        rowActions={(attribute) => (
          <AdminActionMenu>
            <DropdownMenuItem onClick={() => setDraft(toDraft(attribute))}>
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              disabled={attribute.isSystem === true}
              onClick={() => setPendingDelete(attribute)}
            >
              Supprimer
            </DropdownMenuItem>
          </AdminActionMenu>
        )}
      />

      <AdminFormDrawer
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDraft(null);
            clear();
          }
        }}
        title={draft?.id ? "Modifier l'attribut" : "Nouvel attribut"}
        description="Les attributs système alimentent les caractéristiques produit et les filtres publics. Leur clé et leur type sont protégés."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setDraft(null);
                clear();
              }}
            >
              Annuler
            </Button>
            <Button onClick={submit}>Enregistrer</Button>
          </>
        }
      >
        {draft ? (
          <div className="grid gap-4">
            {draft.isSystem ? (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                Attribut système : vous pouvez ajuster le libellé, les options et les catégories,
                mais sa clé technique et son type restent stables pour préserver les produits
                existants.
              </div>
            ) : null}
            <AdminField
              label="Nom"
              required
              value={draft.name}
              onChange={(value) =>
                setDraft({
                  ...draft,
                  name: value,
                  key: draft.id ? draft.key : slugify(value).replace(/-/g, "_"),
                })
              }
            />
            <AdminField
              label="Clé technique"
              required
              value={draft.key}
              hint={
                draft.isSystem
                  ? "Clé système protégée : elle est utilisée par les produits et les filtres."
                  : "Utilisée par les filtres et l'API."
              }
              readOnly={draft.isSystem}
              onChange={(value) => setDraft({ ...draft, key: value })}
            />
            <AdminSelectField
              label="Type de champ"
              value={draft.fieldType}
              options={FIELD_TYPES}
              disabled={draft.isSystem}
              onChange={(value) =>
                setDraft({ ...draft, fieldType: value as AdminAttributeFieldType })
              }
            />
            <AdminNumberField
              label="Ordre d'affichage"
              value={draft.order}
              onChange={(value) => setDraft({ ...draft, order: value })}
            />

            <fieldset className="grid gap-2 rounded-md border border-border p-3">
              <legend className="px-1 text-xs font-medium">Catégories concernées</legend>
              <p className="text-[11px] text-muted-foreground">
                Aucune sélection = attribut disponible pour toutes les catégories.
              </p>
              <div className="grid gap-1 sm:grid-cols-2">
                {categoryOptions.map(({ value, label }) => {
                  const checked = draft.categories.includes(value);
                  return (
                    <label key={value} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setDraft({
                            ...draft,
                            categories: checked
                              ? draft.categories.filter((item) => item !== value)
                              : [...draft.categories, value],
                          })
                        }
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <AdminSwitchField
              label="Utilisable comme filtre"
              checked={draft.isFilterable}
              onChange={(checked) => setDraft({ ...draft, isFilterable: checked })}
            />
            <AdminSwitchField
              label="Axe de variante"
              description="Génère des combinaisons de variantes dans la fiche produit."
              checked={draft.isVariantAxis}
              onChange={(checked) => setDraft({ ...draft, isVariantAxis: checked })}
            />
            <AdminSwitchField
              label="Obligatoire à la publication"
              checked={draft.isRequired}
              onChange={(checked) => setDraft({ ...draft, isRequired: checked })}
            />
            <AdminSwitchField
              label="Attribut actif"
              checked={draft.isActive}
              onChange={(checked) => setDraft({ ...draft, isActive: checked })}
            />

            {showValues ? (
              <div className="grid gap-2">
                <Label className="text-xs font-medium">Valeurs</Label>
                {draft.values.map((value, index) => (
                  <div key={value.id} className="flex flex-wrap items-center gap-2">
                    <Input
                      className="min-w-32 flex-1"
                      value={value.label}
                      aria-label="Libellé de la valeur"
                      onChange={(event) =>
                        updateValue(index, {
                          label: event.target.value,
                          slug: slugify(event.target.value),
                        })
                      }
                    />
                    {draft.fieldType === "color" ? (
                      <>
                        <Input
                          type="color"
                          className="w-14 p-1"
                          aria-label="Couleur"
                          value={value.hex ?? "#000000"}
                          onChange={(event) => updateValue(index, { hex: event.target.value })}
                        />
                        <Input
                          className="min-w-28 flex-1"
                          placeholder="Famille"
                          aria-label="Famille de couleur"
                          value={value.family ?? ""}
                          onChange={(event) => updateValue(index, { family: event.target.value })}
                        />
                      </>
                    ) : null}
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={value.isActive !== false}
                        aria-label={`Activer ${value.label}`}
                        onChange={(event) => updateValue(index, { isActive: event.target.checked })}
                      />
                      Active
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`Supprimer ${value.label}`}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          values: draft.values.filter((_, i) => i !== index),
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-self-start"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      values: [
                        ...draft.values,
                        {
                          id: adminId("val"),
                          label: "",
                          slug: "",
                          order: draft.values.length + 1,
                          isActive: true,
                        },
                      ],
                    })
                  }
                >
                  <Plus className="mr-1 size-4" /> Ajouter une valeur
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </AdminFormDrawer>

      <AdminConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Supprimer cet attribut ?"
        description="Les produits qui l'utilisent perdront cette information."
        confirmLabel="Supprimer"
        destructive
        onConfirm={() => {
          if (pendingDelete) deleteAttribute.mutate(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
