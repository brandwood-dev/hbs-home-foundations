import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import {
  AdminActionMenu,
  AdminConfirmDialog,
  AdminFormDrawer,
} from "@/admin/components/ui/AdminOverlays";
import {
  AdminCard,
  AdminEmptyState,
  AdminErrorState,
  AdminSkeleton,
  AdminStatusBadge,
} from "@/admin/components/ui/AdminStates";
import {
  AdminField,
  AdminFormSection,
  AdminImageField,
  AdminSelectField,
  AdminSwitchField,
} from "@/admin/components/ui/AdminForm";
import { AdminSearchInput } from "@/admin/components/ui/AdminDataTable";
import { useAdminCategories, useAdminProducts } from "@/admin/hooks/admin.queries";
import {
  useDeleteAdminCategory,
  useMoveAdminCategory,
  useSaveAdminCategory,
} from "@/admin/hooks/admin-catalog.mutations";
import type { AdminCategory } from "@/admin/types/admin.types";
import { normalizeKey, slugify } from "@/admin/utils/admin.utils";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

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

interface CategoryNode extends AdminCategory {
  children: CategoryNode[];
}

type FormErrors = Partial<Record<"name" | "slug" | "parentId", string>>;

function toDraft(category?: AdminCategory, parentId = "", order = 0): CategoryDraft {
  return {
    ...(category?.id ? { id: category.id } : {}),
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    parentId: category?.parentId ?? parentId,
    order: category?.order ?? order,
    isActive: category?.isActive ?? true,
    showInNavigation: category?.showInNavigation ?? true,
    description: category?.description ?? "",
    imageUrl: category?.imageUrl ?? "",
    seoTitle: category?.seoTitle ?? "",
    seoDescription: category?.seoDescription ?? "",
  };
}

function buildTree(categories: readonly AdminCategory[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>();
  for (const category of categories) nodes.set(category.id, { ...category, children: [] });

  const roots: CategoryNode[] = [];
  for (const category of categories) {
    const node = nodes.get(category.id);
    if (!node) continue;
    const parent = category.parentId ? nodes.get(category.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const sort = (items: CategoryNode[]) => {
    items.sort((left, right) => left.order - right.order || left.name.localeCompare(right.name));
    items.forEach((item) => sort(item.children));
  };
  sort(roots);
  return roots;
}

function filterTree(nodes: readonly CategoryNode[], query: string): CategoryNode[] {
  if (!query) return [...nodes];
  return nodes.flatMap((node) => {
    const children = filterTree(node.children, query);
    const matches = `${normalizeKey(node.name)} ${normalizeKey(node.slug)}`.includes(query);
    if (!matches && children.length === 0) return [];
    return [{ ...node, children: matches ? node.children : children }];
  });
}

function categoryPath(category: AdminCategory, categories: readonly AdminCategory[]): string {
  const byId = new Map(categories.map((item) => [item.id, item]));
  const segments: string[] = [];
  let current: AdminCategory | undefined = category;
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    segments.unshift(current.slug);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return `/${segments.join("/")}`;
}

function CategoryThumbnail({ category }: { category: AdminCategory }) {
  const [failed, setFailed] = useState(false);
  if (!category.imageUrl || failed) {
    return (
      <div
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold text-muted-foreground"
      >
        {category.name.slice(0, 1).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={category.imageUrl}
      alt=""
      className="size-12 shrink-0 rounded-md border border-border object-cover"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export function AdminCategoriesPage() {
  const { data: categories = [], isLoading, error, refetch } = useAdminCategories();
  const { data: products = [] } = useAdminProducts();
  const saveCategory = useSaveAdminCategory();
  const deleteCategory = useDeleteAdminCategory();
  const moveCategory = useMoveAdminCategory();

  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [pendingDelete, setPendingDelete] = useState<AdminCategory | null>(null);

  const productCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const tree = useMemo(() => buildTree(categories), [categories]);
  const filteredTree = useMemo(() => filterTree(tree, normalizeKey(search)), [search, tree]);
  const rootCount = tree.length;
  const childCount = categories.length - rootCount;

  function setExpanded(id: string, expanded: boolean) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (expanded) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function openCreate(parentId = "") {
    const siblings = categories.filter((category) => (category.parentId ?? "") === parentId);
    const order = siblings.reduce((max, category) => Math.max(max, category.order), -1) + 1;
    if (parentId) setExpanded(parentId, true);
    setFormErrors({});
    setDraft(toDraft(undefined, parentId, order));
  }

  function openEdit(category: AdminCategory) {
    setFormErrors({});
    setDraft(toDraft(category));
  }

  function validateDraft(value: CategoryDraft): FormErrors {
    const errors: FormErrors = {};
    const resolvedSlug = slugify(value.slug.trim() || value.name);
    if (value.name.trim().length < 2) errors.name = "Le nom doit contenir au moins 2 caractères.";
    if (!resolvedSlug) errors.slug = "Le slug est requis.";
    if (
      categories.some(
        (category) =>
          category.id !== value.id && normalizeKey(category.slug) === normalizeKey(resolvedSlug),
      )
    ) {
      errors.slug = "Ce slug existe déjà.";
    }
    if (value.parentId) {
      const parent = categories.find((category) => category.id === value.parentId);
      if (!parent) errors.parentId = "La catégorie parente est introuvable.";
      else if (parent.parentId)
        errors.parentId = "Une sous-catégorie ne peut pas avoir de sous-catégorie.";
      else if (value.isActive && !parent.isActive) {
        errors.parentId = "Une catégorie active doit avoir un parent actif.";
      }
    }
    return errors;
  }

  async function submit() {
    if (!draft || saveCategory.isPending) return;
    const errors = validateDraft(draft);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await saveCategory.mutateAsync({
        ...(draft.id ? { id: draft.id } : {}),
        input: {
          name: draft.name.trim(),
          slug: slugify(draft.slug.trim() || draft.name),
          ...(draft.parentId ? { parentId: draft.parentId } : {}),
          order: draft.order,
          isActive: draft.isActive,
          showInNavigation: draft.showInNavigation,
          description: draft.description.trim(),
          ...(draft.imageUrl.trim() ? { imageUrl: draft.imageUrl.trim() } : {}),
          seoTitle: draft.seoTitle.trim(),
          seoDescription: draft.seoDescription.trim(),
        },
      });
      setDraft(null);
    } catch {
      // useAdminMutation already exposes the API error through a toast. Keep
      // the drawer open so the user can correct the form or retry.
    }
  }

  function renderNode(node: CategoryNode, depth = 0): React.ReactNode {
    const hasChildren = node.children.length > 0;
    const isExpanded = Boolean(search) || expandedIds.has(node.id);
    const isRoot = depth === 0;
    return (
      <div key={node.id} className="border-b border-border last:border-b-0">
        <div
          className={`flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between ${
            isRoot ? "bg-card" : "bg-muted/20"
          }`}
          style={{ paddingLeft: depth === 0 ? undefined : "3.25rem" }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30"
              aria-label={
                hasChildren
                  ? `${isExpanded ? "Réduire" : "Développer"} ${node.name}`
                  : "Aucune sous-catégorie"
              }
              aria-expanded={hasChildren ? isExpanded : undefined}
              disabled={!hasChildren}
              onClick={() => setExpanded(node.id, !isExpanded)}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )
              ) : null}
            </button>
            <CategoryThumbnail category={node} />
            <div className="min-w-0">
              <p className={`${isRoot ? "font-semibold" : "font-medium"} truncate text-sm`}>
                {node.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {categoryPath(node, categories)}
                {isRoot
                  ? ` · ${node.children.length} sous-catégorie${node.children.length > 1 ? "s" : ""}`
                  : ""}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <AdminStatusBadge
                  label={node.isActive ? "Active" : "Inactive"}
                  tone={node.isActive ? "success" : "neutral"}
                />
                <span className="text-xs text-muted-foreground">
                  {productCount.get(node.id) ?? 0} produit
                  {(productCount.get(node.id) ?? 0) > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:justify-end">
            {isRoot ? (
              <Button variant="outline" size="sm" onClick={() => openCreate(node.id)}>
                <Plus className="mr-1 size-4" /> Sous-catégorie
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Monter ${node.name}`}
              onClick={() => moveCategory.mutate({ id: node.id, direction: "up" })}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Descendre ${node.name}`}
              onClick={() => moveCategory.mutate({ id: node.id, direction: "down" })}
            >
              <ArrowDown className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Voir ${node.name} sur le site public`}
              onClick={() =>
                window.open(categoryPath(node, categories), "_blank", "noopener,noreferrer")
              }
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Modifier ${node.name}`}
              onClick={() => openEdit(node)}
            >
              <Pencil className="size-4" />
            </Button>
            <AdminActionMenu>
              <DropdownMenuItem onClick={() => openEdit(node)}>
                <Pencil className="mr-2 size-4" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  window.open(categoryPath(node, categories), "_blank", "noopener,noreferrer")
                }
              >
                <Eye className="mr-2 size-4" /> Voir le site public
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => setPendingDelete(node)}>
                <Trash2 className="mr-2 size-4" /> Archiver
              </DropdownMenuItem>
            </AdminActionMenu>
          </div>
        </div>
        {hasChildren && isExpanded
          ? node.children.map((child) => renderNode(child, depth + 1))
          : null}
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Catégories"
        description={`${rootCount} catégorie${rootCount > 1 ? "s" : ""} — ${childCount} sous-catégorie${childCount > 1 ? "s" : ""}`}
        breadcrumbs={[{ label: "Catalogue" }, { label: "Catégories" }]}
        actions={
          <Button onClick={() => openCreate()}>
            <Plus className="mr-1 size-4" /> Nouvelle catégorie
          </Button>
        }
      />

      <AdminCard className="p-0">
        <div className="border-b border-border p-3">
          <AdminSearchInput value={search} onChange={setSearch} placeholder="Nom ou slug" />
        </div>
        {isLoading ? <AdminSkeleton rows={6} /> : null}
        {!isLoading && error ? (
          <AdminErrorState
            message={
              error instanceof Error ? error.message : "Impossible de charger les catégories."
            }
            onRetry={() => void refetch()}
          />
        ) : null}
        {!isLoading && !error && filteredTree.length === 0 ? (
          <AdminEmptyState
            title={search ? "Aucun résultat" : "Aucune catégorie"}
            description={
              search ? "Modifiez votre recherche." : "Commencez par créer une catégorie racine."
            }
            action={
              !search ? <Button onClick={() => openCreate()}>Nouvelle catégorie</Button> : undefined
            }
          />
        ) : null}
        {!isLoading && !error && filteredTree.length > 0 ? (
          <div>{filteredTree.map((node) => renderNode(node))}</div>
        ) : null}
      </AdminCard>

      <AdminFormDrawer
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open && !saveCategory.isPending) setDraft(null);
        }}
        title={
          draft?.id
            ? "Modifier la catégorie"
            : draft?.parentId
              ? "Nouvelle sous-catégorie"
              : "Nouvelle catégorie"
        }
        description={
          draft?.parentId
            ? `Sous-catégorie de ${categories.find((category) => category.id === draft.parentId)?.name ?? "la catégorie sélectionnée"}.`
            : "Une catégorie racine organise une famille du catalogue."
        }
        footer={
          <>
            <Button
              variant="outline"
              disabled={saveCategory.isPending}
              onClick={() => setDraft(null)}
            >
              Annuler
            </Button>
            <Button disabled={saveCategory.isPending} onClick={() => void submit()}>
              {saveCategory.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        {draft ? (
          <div className="space-y-6">
            {Object.keys(formErrors).length > 0 ? (
              <p
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                Vérifiez les champs signalés avant d’enregistrer.
              </p>
            ) : null}
            <AdminFormSection title="Identité et hiérarchie">
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField
                  label="Nom"
                  required
                  value={draft.name}
                  error={formErrors.name}
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
                  error={formErrors.slug}
                  hint="L’URL est générée en minuscules, sans accents ni espaces."
                  onChange={(value) => setDraft({ ...draft, slug: slugify(value) })}
                />
              </div>
              <AdminSelectField
                label="Catégorie parente"
                value={draft.parentId}
                error={formErrors.parentId}
                options={[
                  { value: "", label: "Aucune (catégorie racine)" },
                  ...categories
                    .filter((category) => category.id !== draft.id && !category.parentId)
                    .map((category) => ({ value: category.id, label: category.name })),
                ]}
                onChange={(value) => setDraft({ ...draft, parentId: value })}
              />
            </AdminFormSection>

            <AdminFormSection title="Contenu et média">
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
            </AdminFormSection>

            <AdminFormSection title="Navigation et SEO">
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
                label="Afficher dans la navigation"
                checked={draft.showInNavigation}
                onChange={(checked) => setDraft({ ...draft, showInNavigation: checked })}
              />
            </AdminFormSection>

            <AdminFormSection title="Publication">
              <AdminSwitchField
                label="Catégorie active"
                checked={draft.isActive}
                onChange={(checked) => setDraft({ ...draft, isActive: checked })}
              />
            </AdminFormSection>
          </div>
        ) : null}
      </AdminFormDrawer>

      <AdminConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Archiver cette catégorie ?"
        description="Une catégorie contenant des produits, des attributs ou des sous-catégories ne peut pas être archivée. Elle restera conservée pour préserver l’historique."
        confirmLabel="Archiver"
        destructive
        onConfirm={() => {
          if (pendingDelete) deleteCategory.mutate(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
