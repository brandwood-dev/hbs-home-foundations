import { useEffect, useMemo, useState } from "react";
import { Archive, Copy, FileText, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import { AdminActionMenu, AdminFormDrawer } from "@/admin/components/ui/AdminOverlays";
import {
  AdminDataTable,
  AdminSearchInput,
  type AdminColumn,
} from "@/admin/components/ui/AdminDataTable";
import { AdminField, AdminSelectField } from "@/admin/components/ui/AdminForm";
import { AdminStatusBadge } from "@/admin/components/ui/AdminStates";
import {
  useAdminArticleCategories,
  useAdminArticles,
  useAdminMedia,
} from "@/admin/hooks/admin.queries";
import { useAdminDraftState } from "@/admin/hooks/useAdminDraftState";
import {
  useArchiveAdminArticle,
  useCreateAdminArticle,
  useDuplicateAdminArticle,
  usePublishAdminArticle,
  useUpdateAdminArticle,
} from "@/admin/hooks/admin-article.mutations";
import type { AdminArticle } from "@/admin/types/admin.types";
import type { AdminArticleInput } from "@/admin/repositories/interfaces";
import { prepareArticleInput } from "./article-form";

type ArticleDraft = {
  id?: string;
  status: AdminArticle["status"];
  version?: number;
  slug: string;
  title: string;
  excerpt: string;
  categoryId: string;
  coverMediaAssetId: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  readingTimeMinutes: string;
  isFeatured: boolean;
  homeSortOrder: string;
  authorName: string;
};

function emptyDraft(): ArticleDraft {
  return {
    status: "draft",
    slug: "",
    title: "",
    excerpt: "",
    categoryId: "",
    coverMediaAssetId: "",
    body: "",
    seoTitle: "",
    seoDescription: "",
    readingTimeMinutes: "",
    isFeatured: false,
    homeSortOrder: "0",
    authorName: "HBS HOME",
  };
}

function bodyText(article: AdminArticle): string {
  const revision = article.draft ?? article.published;
  if (!revision) return "";
  return revision.bodyBlocks
    .map((block) => (typeof block["text"] === "string" ? String(block["text"]) : ""))
    .filter(Boolean)
    .join("\n\n");
}

function toDraft(article: AdminArticle): ArticleDraft {
  const revision = article.draft ?? article.published;
  return {
    ...(article.draft ? { id: article.id } : {}),
    status: article.status,
    ...(article.draft?.version ? { version: article.draft.version } : {}),
    slug: article.slug,
    title: revision?.title ?? "",
    excerpt: revision?.excerpt ?? "",
    categoryId: article.category.id,
    coverMediaAssetId: revision?.cover?.id ?? "",
    body: bodyText(article),
    seoTitle: revision?.seoTitle ?? "",
    seoDescription: revision?.seoDescription ?? "",
    readingTimeMinutes: revision ? String(revision.readingTimeMinutes) : "",
    isFeatured: article.isFeatured,
    homeSortOrder: String(article.homeSortOrder),
    authorName: article.authorName,
  };
}

function statusLabel(status: AdminArticle["status"]): string {
  return status === "published" ? "Publié" : status === "archived" ? "Archivé" : "Brouillon";
}

function statusTone(status: AdminArticle["status"]): "success" | "warning" | "neutral" {
  return status === "published" ? "success" : status === "draft" ? "warning" : "neutral";
}

export function AdminArticlesPage() {
  const { data: articles = [], isLoading, error, refetch } = useAdminArticles();
  const { data: categories = [] } = useAdminArticleCategories();
  const { data: media = [] } = useAdminMedia();
  const createArticle = useCreateAdminArticle();
  const updateArticle = useUpdateAdminArticle();
  const publishArticle = usePublishAdminArticle();
  const archiveArticle = useArchiveAdminArticle();
  const duplicateArticle = useDuplicateAdminArticle();
  const [search, setSearch] = useState("");
  const articleDraftState = useAdminDraftState<ArticleDraft | null>("hbs-admin-article-form", null);
  const { value: draft, setValue: setDraft, setPersist, clear } = articleDraftState;
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => setPersist(draft !== null), [draft, setPersist]);

  const rows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    return query
      ? articles.filter((article) =>
          `${article.draft?.title ?? article.published?.title ?? ""} ${article.slug}`
            .toLocaleLowerCase("fr")
            .includes(query),
        )
      : articles;
  }, [articles, search]);

  const columns: AdminColumn<AdminArticle>[] = [
    {
      id: "article",
      header: "Article",
      cell: (article) => (
        <button
          type="button"
          className="flex items-center gap-2 text-left hover:underline"
          onClick={() => {
            setFormError(null);
            setDraft(toDraft(article));
          }}
        >
          <FileText className="size-4 text-muted-foreground" aria-hidden />
          <span>
            <span className="block font-medium">
              {article.draft?.title ?? article.published?.title ?? "Sans titre"}
            </span>
            <span className="block text-xs text-muted-foreground">
              /inspirations/{article.slug}
            </span>
          </span>
        </button>
      ),
      sortValue: (article) => article.draft?.title ?? article.published?.title ?? article.slug,
    },
    { id: "category", header: "Catégorie", cell: (article) => article.category.name },
    {
      id: "status",
      header: "Statut",
      cell: (article) => (
        <AdminStatusBadge label={statusLabel(article.status)} tone={statusTone(article.status)} />
      ),
    },
    {
      id: "updatedAt",
      header: "Modification",
      cell: (article) => new Date(article.updatedAt).toLocaleString("fr-FR"),
      sortValue: (article) => article.updatedAt,
    },
  ];

  function submit() {
    if (!draft) return;
    setFormError(null);
    const prepared = prepareArticleInput(draft);
    if ("error" in prepared) {
      setFormError(prepared.error);
      return;
    }
    const input: AdminArticleInput = prepared.input;
    const onError = (error: unknown) =>
      setFormError(
        error instanceof Error ? error.message : "L'article n'a pas pu être enregistré.",
      );
    if (draft.id)
      updateArticle.mutate(
        {
          id: draft.id,
          input: { ...input, ...(draft.version ? { expectedVersion: draft.version } : {}) },
        },
        {
          onSuccess: () => {
            setDraft(null);
            clear();
          },
          onError,
        },
      );
    else
      createArticle.mutate(input, {
        onSuccess: () => {
          setDraft(null);
          clear();
        },
        onError,
      });
  }

  const mediaOptions = [
    { value: "__none", label: "Aucune image" },
    ...media
      .filter((item) => item.status !== "archived")
      .map((item) => ({ value: item.id, label: item.name })),
  ];
  const categoryOptions = [
    { value: "__none", label: "Choisir une catégorie" },
    ...categories.map((category) => ({ value: category.id, label: category.name })),
  ];

  return (
    <div>
      <AdminPageHeader
        title="Articles"
        description="Gérez les conseils et inspirations publiés sur le site."
        breadcrumbs={[{ label: "Contenu" }, { label: "Articles" }]}
        actions={
          <Button
            onClick={() => {
              setFormError(null);
              setDraft(emptyDraft());
            }}
          >
            <Plus className="mr-1 size-4" /> Nouvel article
          </Button>
        }
      />
      <AdminDataTable
        rows={rows}
        columns={columns}
        rowKey={(article) => article.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        emptyTitle="Aucun article"
        toolbar={
          <AdminSearchInput value={search} onChange={setSearch} placeholder="Titre ou slug" />
        }
        rowActions={(article) => (
          <AdminActionMenu>
            {article.status === "draft" ? (
              <DropdownMenuItem onClick={() => publishArticle.mutate(article.id)}>
                <Send className="size-4" aria-hidden /> Publier
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={() => duplicateArticle.mutate(article.id)}>
              <Copy className="size-4" aria-hidden /> Dupliquer
            </DropdownMenuItem>
            {article.status !== "archived" ? (
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => archiveArticle.mutate(article.id)}
              >
                <Archive className="size-4" aria-hidden /> Archiver
              </DropdownMenuItem>
            ) : null}
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
        title={draft?.id ? "Modifier l'article" : "Nouvel article"}
        description={
          draft?.status === "published"
            ? "Cet article est publié. Dupliquez-le pour créer une nouvelle version."
            : "Enregistrez un brouillon puis publiez-le lorsque son contenu est validé."
        }
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
            <Button
              onClick={submit}
              disabled={
                Boolean(draft?.status === "published") ||
                createArticle.isPending ||
                updateArticle.isPending
              }
            >
              Enregistrer le brouillon
            </Button>
          </>
        }
      >
        {draft ? (
          <div className="grid gap-4">
            <AdminField
              label="Titre"
              required
              value={draft.title}
              disabled={draft.status === "published"}
              onChange={(value) => setDraft({ ...draft, title: value })}
            />
            <AdminField
              label="Slug"
              required
              value={draft.slug}
              hint="Ex. comment-mesurer-une-fenetre"
              disabled={draft.status === "published"}
              onChange={(value) => setDraft({ ...draft, slug: value })}
            />
            <AdminSelectField
              label="Catégorie"
              value={draft.categoryId || "__none"}
              options={categoryOptions}
              disabled={draft.status === "published"}
              onChange={(value) =>
                setDraft({ ...draft, categoryId: value === "__none" ? "" : value })
              }
            />
            <AdminField
              label="Extrait"
              required
              value={draft.excerpt}
              multiline
              rows={3}
              disabled={draft.status === "published"}
              onChange={(value) => setDraft({ ...draft, excerpt: value })}
            />
            <AdminSelectField
              label="Image de couverture"
              value={draft.coverMediaAssetId || "__none"}
              options={mediaOptions}
              disabled={draft.status === "published"}
              onChange={(value) =>
                setDraft({ ...draft, coverMediaAssetId: value === "__none" ? "" : value })
              }
            />
            <AdminField
              label="Contenu"
              required
              value={draft.body}
              multiline
              rows={12}
              hint="Le texte est enregistré comme bloc éditorial sécurisé."
              disabled={draft.status === "published"}
              onChange={(value) => setDraft({ ...draft, body: value })}
            />
            <AdminField
              label="Temps de lecture (minutes)"
              value={draft.readingTimeMinutes}
              disabled={draft.status === "published"}
              onChange={(value) => setDraft({ ...draft, readingTimeMinutes: value })}
            />
            <AdminField
              label="Auteur"
              value={draft.authorName}
              disabled={draft.status === "published"}
              onChange={(value) => setDraft({ ...draft, authorName: value })}
            />
            <AdminField
              label="Titre SEO"
              value={draft.seoTitle}
              disabled={draft.status === "published"}
              onChange={(value) => setDraft({ ...draft, seoTitle: value })}
            />
            <AdminField
              label="Description SEO"
              value={draft.seoDescription}
              multiline
              rows={3}
              disabled={draft.status === "published"}
              onChange={(value) => setDraft({ ...draft, seoDescription: value })}
            />
            {formError ? (
              <p role="alert" className="text-sm text-red-700">
                {formError}
              </p>
            ) : null}
          </div>
        ) : null}
      </AdminFormDrawer>
    </div>
  );
}
