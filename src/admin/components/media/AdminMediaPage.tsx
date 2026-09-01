import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AdminField, AdminSelectField } from "@/admin/components/ui/AdminForm";
import { AdminStatusBadge } from "@/admin/components/ui/AdminStates";
import { useAdminMedia } from "@/admin/hooks/admin.queries";
import { useAdminDraftState } from "@/admin/hooks/useAdminDraftState";
import {
  useCreateAdminMedia,
  useDeleteAdminMedia,
  useUpdateAdminMedia,
} from "@/admin/hooks/admin-media.mutations";
import type { AdminMedia } from "@/admin/types/admin.types";
import type { AdminMediaInput } from "@/admin/repositories/interfaces";
import {
  EDITORIAL_MEDIA_MIME_TYPES,
  uploadEditorialMedia,
} from "@/admin/services/media/editorial-media-storage";

type MediaDraft = AdminMediaInput & { id?: string };

const STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon" },
  { value: "active", label: "Actif" },
];

function emptyDraft(): MediaDraft {
  return {
    name: "",
    url: "",
    alt: "",
    width: null,
    height: null,
    mimeType: "image/jpeg",
    status: "draft",
    usage: "unassigned",
  };
}

function toDraft(media: AdminMedia): MediaDraft {
  return {
    id: media.id,
    name: media.name,
    url: media.url,
    ...(media.storagePath ? { storagePath: media.storagePath } : {}),
    alt: media.alt,
    width: media.width,
    height: media.height,
    mimeType: media.mimeType,
    status: media.status,
    usage: media.usage,
  };
}

function labelForStatus(status: AdminMedia["status"]): string {
  return status === "active" ? "Actif" : status === "archived" ? "Archivé" : "Brouillon";
}

export function AdminMediaPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: media = [], isLoading, error, refetch } = useAdminMedia();
  const createMedia = useCreateAdminMedia();
  const updateMedia = useUpdateAdminMedia();
  const deleteMedia = useDeleteAdminMedia();
  const [search, setSearch] = useState("");
  const mediaDraftState = useAdminDraftState<MediaDraft | null>("hbs-admin-media-form", null);
  const { value: draft, setValue: setDraft, setPersist, clear } = mediaDraftState;
  const [pendingDelete, setPendingDelete] = useState<AdminMedia | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => setPersist(draft !== null), [draft, setPersist]);

  const rows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return media;
    return media.filter((item) =>
      `${item.name} ${item.alt} ${item.usage}`.toLocaleLowerCase().includes(query),
    );
  }, [media, search]);

  const columns: AdminColumn<AdminMedia>[] = [
    {
      id: "preview",
      header: "Aperçu",
      cell: (item) => (
        <img
          src={item.url}
          alt=""
          className="size-14 rounded border border-border object-cover"
          loading="lazy"
        />
      ),
    },
    {
      id: "name",
      header: "Média",
      cell: (item) => (
        <button
          type="button"
          className="text-left font-medium hover:underline"
          onClick={() => setDraft(toDraft(item))}
        >
          {item.name}
          <span className="block max-w-[32rem] truncate text-xs font-normal text-muted-foreground">
            {item.alt}
          </span>
        </button>
      ),
      sortValue: (item) => item.name,
    },
    { id: "usage", header: "Usage", cell: (item) => item.usage },
    {
      id: "status",
      header: "Statut",
      cell: (item) => <AdminStatusBadge label={labelForStatus(item.status)} />,
    },
    {
      id: "dimensions",
      header: "Dimensions",
      cell: (item) => (item.width && item.height ? `${item.width} × ${item.height}` : "—"),
    },
  ];

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadError(null);
    try {
      const result = await uploadEditorialMedia(file);
      const name = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .trim();
      createMedia.mutate({
        name,
        url: result.publicUrl,
        storagePath: result.storagePath,
        alt: name,
        width: null,
        height: null,
        mimeType: result.mimeType,
        // A direct file upload has already passed the client-side format and
        // size checks, so it is ready to be selected by homepage editors.
        // Draft remains available for manually added URLs that still need
        // review before publication.
        status: "active",
        usage: "unassigned",
      });
    } catch (reason) {
      setUploadError(reason instanceof Error ? reason.message : "Téléversement impossible.");
    }
  }

  function submit() {
    if (!draft || !draft.name.trim() || !draft.url.trim() || !draft.alt.trim()) return;
    const { id, storagePath, ...rest } = draft;
    const input: AdminMediaInput = {
      ...rest,
      ...(storagePath ? { storagePath } : {}),
      name: rest.name.trim(),
      url: rest.url.trim(),
      alt: rest.alt.trim(),
      usage: rest.usage.trim() || "unassigned",
    };
    if (id) {
      updateMedia.mutate(
        { id, input },
        {
          onSuccess: () => {
            setDraft(null);
            clear();
          },
        },
      );
    } else {
      createMedia.mutate(input, {
        onSuccess: () => {
          setDraft(null);
          clear();
        },
      });
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Médiathèque"
        description="Images éditoriales stockées dans Supabase Storage et référencées par le contenu public."
        breadcrumbs={[{ label: "Contenu" }, { label: "Médias" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={EDITORIAL_MEDIA_MIME_TYPES.join(",")}
              className="sr-only"
              onChange={upload}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={createMedia.isPending}
            >
              <Upload className="mr-1 size-4" /> Téléverser
            </Button>
            <Button onClick={() => setDraft(emptyDraft())}>
              <Plus className="mr-1 size-4" /> Ajouter une URL
            </Button>
          </div>
        }
      />

      <AdminDataTable
        rows={rows}
        columns={columns}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        emptyTitle="Aucun média"
        toolbar={
          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Nom, texte alternatif ou usage"
          />
        }
        rowActions={(item) => (
          <AdminActionMenu>
            <DropdownMenuItem onClick={() => setDraft(toDraft(item))}>Modifier</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => setPendingDelete(item)}>
              Archiver
            </DropdownMenuItem>
          </AdminActionMenu>
        )}
      />
      {uploadError ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {uploadError}
        </p>
      ) : null}

      <AdminFormDrawer
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDraft(null);
            clear();
          }
        }}
        title={draft?.id ? "Modifier le média" : "Ajouter un média"}
        description="Un texte alternatif descriptif est obligatoire pour l’accessibilité."
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
            <Button onClick={submit} disabled={createMedia.isPending || updateMedia.isPending}>
              Enregistrer
            </Button>
          </>
        }
      >
        {draft ? (
          <div className="grid gap-4">
            <AdminField
              label="Nom"
              required
              value={draft.name}
              onChange={(value) => setDraft({ ...draft, name: value })}
            />
            <AdminField
              label="URL publique"
              required
              value={draft.url}
              onChange={(value) => setDraft({ ...draft, url: value })}
            />
            <AdminField
              label="Texte alternatif"
              required
              value={draft.alt}
              onChange={(value) => setDraft({ ...draft, alt: value })}
            />
            <AdminField
              label="Usage"
              value={draft.usage}
              onChange={(value) => setDraft({ ...draft, usage: value })}
              hint="Ex. accueil.hero, page.about, unassigned"
            />
            <AdminSelectField
              label="Statut"
              value={draft.status}
              options={STATUS_OPTIONS}
              onChange={(value) => setDraft({ ...draft, status: value as MediaDraft["status"] })}
            />
            <p className="text-xs text-muted-foreground">
              Type : {draft.mimeType}. Les dimensions seront enrichies dans la sous-phase
              d’optimisation des médias.
            </p>
            {draft.url ? (
              <img
                src={draft.url}
                alt={draft.alt}
                className="max-h-56 rounded border border-border object-contain"
              />
            ) : null}
          </div>
        ) : null}
      </AdminFormDrawer>

      <AdminConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Archiver ce média ?"
        description="Le fichier Storage est conservé pour permettre une restauration. Il ne sera plus proposé dans la médiathèque."
        confirmLabel="Archiver"
        destructive
        onConfirm={() => {
          if (pendingDelete) deleteMedia.mutate(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
