import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import {
  AdminDataTable,
  AdminSearchInput,
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
  AdminImageField,
  AdminSelectField,
  AdminSwitchField,
} from "@/admin/components/ui/AdminForm";
import { useAdminCategories, useAdminProducts } from "@/admin/hooks/admin.queries";
import {
  useDeleteAdminCategory,
  useMoveAdminCategory,
  useSaveAdminCategory,
} from "@/admin/hooks/admin-catalog.mutations";
import type { AdminCategory } from "@/admin/types/admin.types";
import { normalizeKey, slugify } from "@/admin/utils/admin.utils";

interface CategoryDraft {
  id?: string;
  name: string;
  slug: string;
  parentId: string;
  order: number;
  isActive: boolean;
  showInNavigation: boolean;
  description: string;
  imageUrl: string;
  seoTitle: string;
  seoDescription: string;
}

function toDraft(category?: AdminCategory): CategoryDraft {
  return {
    ...(category?.id ? { id: category.id } : {}),
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    parentId: category?.parentId ?? "",
    order: category?.order ?? 99,
    isActive: category?.isActive ?? true,
    showInNavigation: category?.showInNavigation ?? true,
    description: category?.description ?? "",
    imageUrl: category?.imageUrl ?? "",
    seoTitle: category?.seoTitle ?? "",
    seoDescription: category?.seoDescription ?? "",
  };
}

export function AdminCategoriesPage() {
  const { data: categories = [], isLoading, error, refetch } = useAdminCategories();
  const { data: products = [] } = useAdminProducts();
  const saveCategory = useSaveAdminCategory();
  const deleteCategory = useDeleteAdminCategory();
  const moveCategory = useMoveAdminCategory();

  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminCategory | null>(null);

  const productCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const rows = useMemo(() => {
    const query = normalizeKey(search);
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    if (!query) return sorted;
    return sorted.filter((category) =>
      `${normalizeKey(category.name)} ${normalizeKey(category.slug)}`.includes(query),
    );
  }, [categories, search]);

  const columns: AdminColumn<AdminCategory>[] = [
    {
      id: "name",
      header: "Catégorie",
      cell: (category) => (
        <div>
          <button
            type="button"
            className="font-medium hover:underline"
            onClick={() => setDraft(toDraft(category))}
          >
            {category.parentId ? "— " : ""}
            {category.name}
          </button>
          <p className="text-xs text-muted-foreground">/{category.slug}</p>
        </div>
      ),
      sortValue: (category) => category.name,
    },
    {
      id: "parent",
      header: "Parent",
      cell: (category) => categories.find((item) => item.id === category.parentId)?.name ?? "—",
    },
    {
      id: "products",
      header: "Produits",
      cell: (category) => productCount.get(category.id) ?? 0,
      sortValue: (category) => productCount.get(category.id) ?? 0,
    },
    {
      id: "nav",
      header: "Navigation",
      cell: (category) => (category.showInNavigation === false ? "Masquée" : "Affichée"),
    },
    {
      id: "status",
      header: "Statut",
      cell: (category) => (
        <AdminStatusBadge
          label={category.isActive ? "Active" : "Inactive"}
          tone={category.isActive ? "success" : "neutral"}
        />
      ),
    },
    {
      id: "order",
      header: "Ordre",
      cell: (category) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label={`Monter ${category.name}`}
            onClick={() => moveCategory.mutate({ id: category.id, direction: "up" })}
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={`Descendre ${category.name}`}
            onClick={() => moveCategory.mutate({ id: category.id, direction: "down" })}
          >
            <ArrowDown className="size-4" />
          </Button>
        </div>
      ),
      sortValue: (category) => category.order,
    },
  ];

  function submit() {
    if (!draft || !draft.name.trim()) return;
    saveCategory.mutate({
      ...(draft.id ? { id: draft.id } : {}),
      input: {
        name: draft.name.trim(),
        slug: draft.slug.trim() || slugify(draft.name),
        ...(draft.parentId ? { parentId: draft.parentId } : {}),
        order: draft.order,
        isActive: draft.isActive,
        showInNavigation: draft.showInNavigation,
        description: draft.description,
        ...(draft.imageUrl ? { imageUrl: draft.imageUrl } : {}),
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
      },
    });
    setDraft(null);
  }

  return (
    <div>
      <AdminPageHeader
        title="Catégories"
        description="Arborescence du catalogue, ordre d'affichage et métadonnées SEO."
        breadcrumbs={[{ label: "Catalogue" }, { label: "Catégories" }]}
        actions={
          <Button onClick={() => setDraft(toDraft())}>
            <Plus className="mr-1 size-4" /> Nouvelle catégorie
          </Button>
        }
      />

      <AdminDataTable
        rows={rows}
        columns={columns}
        rowKey={(category) => category.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        emptyTitle="Aucune catégorie"
        toolbar={<AdminSearchInput value={search} onChange={setSearch} placeholder="Nom ou slug" />}
        rowActions={(category) => (
          <AdminActionMenu>
            <DropdownMenuItem onClick={() => setDraft(toDraft(category))}>
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => setPendingDelete(category)}>
              Supprimer
            </DropdownMenuItem>
          </AdminActionMenu>
        )}
      />

      <AdminFormDrawer
        open={draft !== null}
        onOpenChange={(open) => !open && setDraft(null)}
        title={draft?.id ? "Modifier la catégorie" : "Nouvelle catégorie"}
        description="Le slug détermine l'URL publique de la catégorie."
        footer={
          <>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Annuler
            </Button>
            <Button onClick={submit}>Enregistrer</Button>
          </>
        }
      >
        {draft ? (
          <div className="grid gap-4">
            <AdminField
              label="Nom"
              required
              value={draft.name}
              onChange={(value) =>
                setDraft({
                  ...draft,
                  name: value,
                  slug: draft.id ? draft.slug : slugify(value),
                })
              }
            />
            <AdminField
              label="Slug"
              required
              value={draft.slug}
              onChange={(value) => setDraft({ ...draft, slug: slugify(value) })}
            />
            <AdminSelectField
              label="Catégorie parente"
              value={draft.parentId}
              options={[
                { value: "", label: "Aucune (racine)" },
                ...categories
                  .filter((category) => category.id !== draft.id && !category.parentId)
                  .map((category) => ({ value: category.id, label: category.name })),
              ]}
              onChange={(value) => setDraft({ ...draft, parentId: value })}
            />
            <AdminField
              label="Description"
              multiline
              rows={3}
              value={draft.description}
              onChange={(value) => setDraft({ ...draft, description: value })}
            />
            <AdminImageField
              label="Image de catégorie"
              value={draft.imageUrl}
              onChange={(value) => setDraft({ ...draft, imageUrl: value })}
            />
            <AdminField
              label="Titre SEO"
              value={draft.seoTitle}
              onChange={(value) => setDraft({ ...draft, seoTitle: value })}
            />
            <AdminField
              label="Méta description"
              multiline
              rows={3}
              value={draft.seoDescription}
              onChange={(value) => setDraft({ ...draft, seoDescription: value })}
            />
            <AdminSwitchField
              label="Catégorie active"
              checked={draft.isActive}
              onChange={(checked) => setDraft({ ...draft, isActive: checked })}
            />
            <AdminSwitchField
              label="Afficher dans la navigation"
              checked={draft.showInNavigation}
              onChange={(checked) => setDraft({ ...draft, showInNavigation: checked })}
            />
          </div>
        ) : null}
      </AdminFormDrawer>

      <AdminConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Supprimer cette catégorie ?"
        description="Une catégorie contenant des produits ou des sous-catégories ne peut pas être supprimée."
        confirmLabel="Supprimer"
        destructive
        onConfirm={() => {
          if (pendingDelete) deleteCategory.mutate(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
