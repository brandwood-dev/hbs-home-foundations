import { useEffect, useMemo, useState } from "react";
import { Archive, FileText, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import {
  AdminActionMenu,
  AdminConfirmDialog,
  AdminFormDrawer,
} from "@/admin/components/ui/AdminOverlays";
import {
  AdminDataTable,
  AdminSearchInput,
  type AdminColumn,
} from "@/admin/components/ui/AdminDataTable";
import { AdminField, AdminSelectField } from "@/admin/components/ui/AdminForm";
import { AdminStatusBadge } from "@/admin/components/ui/AdminStates";
import { useAdminEditorialPages } from "@/admin/hooks/admin.queries";
import { useAdminDraftState } from "@/admin/hooks/useAdminDraftState";
import {
  useArchiveAdminEditorialPage,
  useCreateAdminEditorialPage,
  usePublishAdminEditorialPage,
  useUpdateAdminEditorialPage,
} from "@/admin/hooks/admin-editorial-page.mutations";
import { useAdminMedia } from "@/admin/hooks/admin.queries";
import type { AdminEditorialPage } from "@/admin/types/admin.types";
import type { AdminEditorialPageInput } from "@/admin/repositories/interfaces";

type BlockDraft = {
  sortOrder: number;
  blockType: string;
  payload: string;
  mediaAssetId: string;
};

type PageDraft = {
  id?: string;
  slug: string;
  title: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  status: AdminEditorialPage["status"];
  version: number | undefined;
  blocks: BlockDraft[];
};

function emptyDraft(): PageDraft {
  return {
    slug: "",
    title: "",
    body: "",
    seoTitle: "",
    seoDescription: "",
    status: "draft",
    version: undefined,
    blocks: [],
  };
}

function toDraft(page: AdminEditorialPage): PageDraft {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    body: page.body,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    status: page.status,
    version: page.version,
    blocks: (page.blocks ?? []).map((block) => ({
      sortOrder: block.sortOrder,
      blockType: block.blockType,
      payload: JSON.stringify(block.payload, null, 2),
      mediaAssetId: block.media?.id ?? "",
    })),
  };
}

function statusLabel(status: AdminEditorialPage["status"]): string {
  return status === "published" ? "Publiée" : status === "archived" ? "Archivée" : "Brouillon";
}

function statusTone(status: AdminEditorialPage["status"]): "success" | "warning" | "neutral" {
  return status === "published" ? "success" : status === "draft" ? "warning" : "neutral";
}

export function AdminEditorialPagesPage() {
  const { data: pages = [], isLoading, error, refetch } = useAdminEditorialPages();
  const { data: media = [] } = useAdminMedia();
  const createPage = useCreateAdminEditorialPage();
  const updatePage = useUpdateAdminEditorialPage();
  const publishPage = usePublishAdminEditorialPage();
  const archivePage = useArchiveAdminEditorialPage();
  const [search, setSearch] = useState("");
  const pageDraftState = useAdminDraftState<PageDraft | null>(
    "hbs-admin-editorial-page-form",
    null,
  );
  const { value: draft, setValue: setDraft, setPersist, clear } = pageDraftState;
  const [pendingArchive, setPendingArchive] = useState<AdminEditorialPage | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => setPersist(draft !== null), [draft, setPersist]);

  const rows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return pages;
    return pages.filter((page) => `${page.title} ${page.slug}`.toLocaleLowerCase().includes(query));
  }, [pages, search]);

  const columns: AdminColumn<AdminEditorialPage>[] = [
    {
      id: "page",
      header: "Page",
      cell: (page) => (
        <button
          type="button"
          className="flex items-center gap-2 text-left hover:underline"
          onClick={() => setDraft(toDraft(page))}
        >
          <FileText className="size-4 text-muted-foreground" aria-hidden />
          <span>
            <span className="block font-medium">{page.title}</span>
            <span className="block text-xs text-muted-foreground">/{page.slug}</span>
          </span>
        </button>
      ),
      sortValue: (page) => page.title,
    },
    {
      id: "status",
      header: "Statut",
      cell: (page) => (
        <AdminStatusBadge label={statusLabel(page.status)} tone={statusTone(page.status)} />
      ),
    },
    { id: "blocks", header: "Blocs", cell: (page) => String(page.blocks?.length ?? 0) },
    {
      id: "updatedAt",
      header: "Dernière modification",
      cell: (page) => new Date(page.updatedAt).toLocaleString("fr-FR"),
      sortValue: (page) => page.updatedAt,
    },
  ];

  function submit() {
    if (!draft) return;
    setFormError(null);
    if (!draft.title.trim() || !draft.slug.trim()) {
      setFormError("Le titre et le slug sont obligatoires.");
      return;
    }
    let blocks: NonNullable<AdminEditorialPageInput["blocks"]>;
    try {
      blocks = draft.blocks.map((block) => {
        const payload = JSON.parse(block.payload || "{}");
        if (!payload || Array.isArray(payload) || typeof payload !== "object") {
          throw new Error("Le payload de chaque bloc doit être un objet JSON.");
        }
        return {
          sortOrder: block.sortOrder,
          blockType: block.blockType.trim(),
          payload,
          mediaAssetId: block.mediaAssetId || null,
        };
      });
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "Payload JSON invalide.");
      return;
    }
    const input: AdminEditorialPageInput = {
      slug: draft.slug.trim(),
      title: draft.title.trim(),
      body: draft.body,
      seoTitle: draft.seoTitle.trim() || null,
      seoDescription: draft.seoDescription.trim() || null,
      blocks,
    };
    if (draft.id) {
      updatePage.mutate(
        {
          id: draft.id,
          input: { ...input, ...(draft.version ? { expectedVersion: draft.version } : {}) },
        },
        {
          onSuccess: () => {
            setDraft(null);
            clear();
          },
        },
      );
    } else {
      createPage.mutate(input, {
        onSuccess: () => {
          setDraft(null);
          clear();
        },
      });
    }
  }

  const mediaOptions = [
    { value: "__none", label: "Aucun média" },
    ...media
      .filter((item) => item.status !== "archived")
      .map((item) => ({ value: item.id, label: item.name })),
  ];

  return (
    <div>
      <AdminPageHeader
        title="Pages éditoriales"
        description="Gérez les pages en brouillon, leurs blocs et leur publication contrôlée."
        breadcrumbs={[{ label: "Contenu" }, { label: "Pages éditoriales" }]}
        actions={
          <Button
            onClick={() => {
              setFormError(null);
              setDraft(emptyDraft());
            }}
          >
            <Plus className="mr-1 size-4" /> Nouvelle page
          </Button>
        }
      />
      <AdminDataTable
        rows={rows}
        columns={columns}
        rowKey={(page) => page.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        emptyTitle="Aucune page éditoriale"
        toolbar={
          <AdminSearchInput value={search} onChange={setSearch} placeholder="Titre ou slug" />
        }
        rowActions={(page) => (
          <AdminActionMenu>
            {page.status === "draft" ? (
              <DropdownMenuItem onClick={() => publishPage.mutate(page.id)}>
                <Send className="size-4" aria-hidden /> Publier
              </DropdownMenuItem>
            ) : null}
            {page.status !== "archived" ? (
              <DropdownMenuItem className="text-red-600" onClick={() => setPendingArchive(page)}>
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
        title={draft?.id ? "Modifier la page" : "Nouvelle page éditoriale"}
        description="Les pages publiées ne sont pas modifiables directement : archivez-les puis créez un nouveau brouillon."
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
                createPage.isPending || updatePage.isPending || draft?.status === "published"
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
              disabled={draft.status === "published"}
              hint="Ex. a-propos ou conditions-livraison"
              onChange={(value) => setDraft({ ...draft, slug: value })}
            />
            <AdminField
              label="Corps de la page"
              value={draft.body}
              multiline
              rows={8}
              disabled={draft.status === "published"}
              onChange={(value) => setDraft({ ...draft, body: value })}
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
            <div className="rounded-md border border-border p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold">Blocs éditoriaux</h2>
                  <p className="text-xs text-muted-foreground">
                    Chaque bloc peut réutiliser une image de la médiathèque.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={draft.status === "published"}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      blocks: [
                        ...draft.blocks,
                        {
                          sortOrder: draft.blocks.length,
                          blockType: "rich_text",
                          payload: "{}",
                          mediaAssetId: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus className="mr-1 size-3.5" /> Bloc
                </Button>
              </div>
              <div className="grid gap-4">
                {draft.blocks.map((block, index) => (
                  <div
                    key={`${index}-${block.sortOrder}`}
                    className="grid gap-3 rounded border border-border bg-muted/20 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold">Bloc {index + 1}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Supprimer le bloc ${index + 1}`}
                        disabled={draft.status === "published"}
                        onClick={() =>
                          setDraft({
                            ...draft,
                            blocks: draft.blocks
                              .filter((_, candidate) => candidate !== index)
                              .map((item, order) => ({ ...item, sortOrder: order })),
                          })
                        }
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                    <AdminField
                      label="Type"
                      required
                      value={block.blockType}
                      disabled={draft.status === "published"}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          blocks: draft.blocks.map((item, candidate) =>
                            candidate === index ? { ...item, blockType: value } : item,
                          ),
                        })
                      }
                    />
                    <AdminField
                      label="Payload JSON"
                      value={block.payload}
                      multiline
                      rows={4}
                      disabled={draft.status === "published"}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          blocks: draft.blocks.map((item, candidate) =>
                            candidate === index ? { ...item, payload: value } : item,
                          ),
                        })
                      }
                    />
                    <AdminSelectField
                      label="Média associé"
                      value={block.mediaAssetId || "__none"}
                      options={mediaOptions}
                      disabled={draft.status === "published"}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          blocks: draft.blocks.map((item, candidate) =>
                            candidate === index
                              ? { ...item, mediaAssetId: value === "__none" ? "" : value }
                              : item,
                          ),
                        })
                      }
                    />
                  </div>
                ))}
                {draft.blocks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Aucun bloc. Ajoutez-en un pour lier du contenu ou une image.
                  </p>
                ) : null}
              </div>
            </div>
            {formError ? (
              <p role="alert" className="text-sm text-red-700">
                {formError}
              </p>
            ) : null}
            {draft.status === "published" ? (
              <p className="text-sm text-amber-700">
                Cette page est publiée. Archivez-la avant de créer un nouveau brouillon.
              </p>
            ) : null}
          </div>
        ) : null}
      </AdminFormDrawer>

      <AdminConfirmDialog
        open={pendingArchive !== null}
        onOpenChange={(open) => !open && setPendingArchive(null)}
        title="Archiver cette page ?"
        description="La page ne sera plus accessible publiquement. Cette action est auditée."
        confirmLabel="Archiver"
        destructive
        onConfirm={() => {
          if (pendingArchive) archivePage.mutate(pendingArchive.id);
          setPendingArchive(null);
        }}
      />
    </div>
  );
}
