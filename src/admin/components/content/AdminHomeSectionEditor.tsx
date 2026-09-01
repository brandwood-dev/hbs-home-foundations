import { useEffect, useState } from "react";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Eye,
  MousePointer2,
  Plus,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomePromoBanner } from "@/components/home/HomePromoBanner";
import { promoBanner as fallbackPromoBanner } from "@/fixtures/home.fixture";
import {
  promoBannerPayload,
  readPromoBannerDraftMessages,
  type HomePromoBannerMessage,
} from "@/domain/content/promo-banner";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import { AdminConfirmDialog } from "@/admin/components/ui/AdminOverlays";
import {
  AdminField,
  AdminFormSection,
  AdminNumberField,
  AdminSelectField,
  AdminSwitchField,
} from "@/admin/components/ui/AdminForm";
import {
  AdminCard,
  AdminErrorState,
  AdminSkeleton,
  AdminStatusBadge,
} from "@/admin/components/ui/AdminStates";
import { useAdminAuthorization } from "@/admin/auth/AdminAuthorizationContext";
import { useAdminHomeContent, useAdminMedia, useAdminProducts } from "@/admin/hooks/admin.queries";
import { useAdminDraftState } from "@/admin/hooks/useAdminDraftState";
import {
  useArchiveAdminHomeSection,
  usePublishAdminHomeSection,
  useUpdateAdminHomeSection,
} from "@/admin/hooks/admin-home-content.mutations";
import type {
  AdminHomeContent,
  AdminHomeSection,
  AdminHomeSectionInput,
  AdminHomeSectionKey,
} from "@/admin/repositories/interfaces";
import type { AdminMedia, AdminProduct } from "@/admin/types/admin.types";
import {
  HOME_SECTION_DESCRIPTIONS as SECTION_DESCRIPTIONS,
  HOME_SECTION_LABELS as SECTION_LABELS,
} from "@/admin/components/content/home-overview";

type HotspotDraft = {
  id: string;
  productId: string;
  xPercent: number;
  yPercent: number;
  label: string;
};

type SectionDraft = {
  version?: number;
  sectionKey: AdminHomeSectionKey;
  sortOrder: number;
  isEnabled: boolean;
  payload: Record<string, unknown>;
  mediaAssetId: string;
  mediaUrl: string;
  mediaAlt: string;
  mobileMediaAssetId: string;
  mobileMediaUrl: string;
  mobileMediaAlt: string;
  hotspots: HotspotDraft[];
};

const EMPTY_PAYLOADS: Record<AdminHomeSectionKey, Record<string, unknown>> = {
  hero: {
    eyebrow: "HBS HOME",
    title: "Des intérieurs qui vous ressemblent",
    description: "Découvrez nos collections pensées pour votre maison.",
    primaryCtaLabel: "Découvrir les nouveautés",
    primaryCtaHref: "/nouveautes",
    secondaryCtaLabel: "Nous contacter",
    secondaryCtaHref: "/contact",
  },
  promo_banner: {
    messages: fallbackPromoBanner.messages.map((message) => ({ ...message })),
  },
  shop_the_look: {
    title: "Shop the Look",
    description: "Composez une ambiance complète à partir de nos produits.",
  },
};

function stableId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function stringValue(payload: Record<string, unknown>, key: string): string {
  const value = payload[key];
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function createSection(sectionKey: AdminHomeSectionKey, sortOrder: number): SectionDraft {
  return {
    sectionKey,
    sortOrder,
    isEnabled: true,
    payload:
      sectionKey === "promo_banner"
        ? promoBannerPayload(fallbackPromoBanner.messages)
        : { ...EMPTY_PAYLOADS[sectionKey] },
    mediaAssetId: "",
    mediaUrl: "",
    mediaAlt: "",
    mobileMediaAssetId: "",
    mobileMediaUrl: "",
    mobileMediaAlt: "",
    hotspots: [],
  };
}

function fromSection(section: AdminHomeSection): SectionDraft {
  const mergedPayload = { ...EMPTY_PAYLOADS[section.sectionKey], ...section.payload };
  return {
    sectionKey: section.sectionKey,
    sortOrder: section.sortOrder,
    isEnabled: section.isEnabled,
    payload:
      section.sectionKey === "promo_banner"
        ? promoBannerPayload(
            readPromoBannerDraftMessages(mergedPayload, fallbackPromoBanner.messages),
          )
        : mergedPayload,
    mediaAssetId: section.media?.id ?? "",
    mediaUrl: section.media?.publicUrl ?? "",
    mediaAlt: section.media?.alt ?? "",
    mobileMediaAssetId: section.mobileMedia?.id ?? "",
    mobileMediaUrl: section.mobileMedia?.publicUrl ?? "",
    mobileMediaAlt: section.mobileMedia?.alt ?? "",
    hotspots: section.hotspots.map((hotspot) => ({
      id: hotspot.id,
      productId: hotspot.productId,
      xPercent: hotspot.xPercent,
      yPercent: hotspot.yPercent,
      label: hotspot.label ?? "",
    })),
  };
}

function toSectionDraft(content: AdminHomeContent, sectionKey: AdminHomeSectionKey): SectionDraft {
  const source = content.draft ?? content.published;
  const section = source?.sections.find((item) => item.sectionKey === sectionKey);
  const draft = section ? fromSection(section) : createSection(sectionKey, 0);
  return source?.version === undefined ? draft : { ...draft, version: source.version };
}

function toSectionInput(draft: SectionDraft): AdminHomeSectionInput & { expectedVersion?: number } {
  return {
    sectionKey: draft.sectionKey,
    sortOrder: draft.sortOrder,
    isEnabled: draft.isEnabled,
    payload: draft.payload,
    mediaAssetId: draft.mediaAssetId || null,
    mobileMediaAssetId: draft.mobileMediaAssetId || null,
    hotspots:
      draft.sectionKey === "shop_the_look"
        ? draft.hotspots.map((hotspot, index) => ({
            productId: hotspot.productId,
            xPercent: hotspot.xPercent,
            yPercent: hotspot.yPercent,
            label: hotspot.label.trim() || null,
            sortOrder: index,
          }))
        : [],
    ...(draft.version === undefined ? {} : { expectedVersion: draft.version }),
  };
}

function statusLabel(content: AdminHomeContent | undefined): string {
  if (content?.draft) return "Brouillon disponible";
  if (content?.published) return "Publication active";
  return "Aucune publication";
}

function statusTone(content: AdminHomeContent | undefined): "success" | "warning" | "neutral" {
  if (content?.draft) return "warning";
  if (content?.published) return "success";
  return "neutral";
}

function mediaOptions(media: AdminMedia[], selectedId: string) {
  const available = media.filter((item) => item.status === "active");
  const selected = selectedId && media.find((item) => item.id === selectedId);
  return [
    { value: "__none", label: "Aucun média" },
    ...(selected && selected.status !== "active"
      ? [
          {
            value: selected.id,
            label: `${selected.name} (${selected.status === "draft" ? "brouillon" : "archivé"})`,
          },
        ]
      : []),
    ...available
      .filter((item) => item.id !== selectedId)
      .map((item) => ({ value: item.id, label: item.name })),
  ];
}

function productOptions(products: AdminProduct[], selectedId: string) {
  // Drafts may keep a link to a product that is not published yet. It must
  // remain selectable in the editor so changing an unrelated section (such as
  // the promo banner) does not turn the existing hotspot into an opaque
  // "Produit indisponible" value. Publication performs the stricter check.
  const available = products.filter((product) => product.status !== "archived");
  const selected = selectedId ? products.find((product) => product.id === selectedId) : undefined;
  return [
    { value: "__none", label: "Sélectionner un produit" },
    ...(selectedId && selected?.status === "archived"
      ? [
          {
            value: selected.id,
            label: `${selected.name} (archivé — à remplacer avant publication)`,
          },
        ]
      : selectedId && !selected
        ? [{ value: selectedId, label: "Produit introuvable — à remplacer" }]
        : []),
    ...available.map((product) => ({
      value: product.id,
      label: product.status === "draft" ? `${product.name} (brouillon)` : product.name,
    })),
  ];
}

function linkedProductNotice(products: AdminProduct[], productId: string): string | null {
  if (!productId) return null;
  const product = products.find((item) => item.id === productId);
  if (!product)
    return "La référence produit est introuvable. Remplacez ce produit avant d’enregistrer.";
  if (product.status === "archived") {
    return "Ce produit est archivé. Le brouillon peut être enregistré, mais remplacez-le avant publication.";
  }
  if (product.status === "draft") {
    return "Ce produit est encore en brouillon. Il doit être publié avant la publication de la homepage.";
  }
  return null;
}

export function AdminHomeSectionEditor({ sectionKey }: { sectionKey: AdminHomeSectionKey }) {
  const { hasPermission } = useAdminAuthorization();
  const { data, isLoading, error, refetch } = useAdminHomeContent(sectionKey);
  const { data: media = [] } = useAdminMedia({ enabled: sectionKey !== "promo_banner" });
  const { data: products = [] } = useAdminProducts({ enabled: sectionKey === "shop_the_look" });
  const updateHomeSection = useUpdateAdminHomeSection();
  const publishHomeSection = usePublishAdminHomeSection();
  const archiveHomeSection = useArchiveAdminHomeSection();
  const sectionDraftState = useAdminDraftState<SectionDraft | null>(
    `hbs-admin-home-section-${sectionKey}`,
    null,
  );
  const { value: draft, setValue: setDraft, restored, setPersist, clear } = sectionDraftState;
  const [dirty, setDirty] = useState(restored);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingArchive, setPendingArchive] = useState(false);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  useEffect(() => setPersist(dirty), [dirty, setPersist]);

  const canWrite = hasPermission("content.write");
  const canPublish = hasPermission("content.publish");
  const published = data?.published;

  useEffect(() => {
    if (!data || dirty) return;
    setDraft(toSectionDraft(data, sectionKey));
  }, [data, dirty, sectionKey, setDraft]);

  function updateSection(update: (section: SectionDraft) => SectionDraft) {
    setDraft((current) => (current ? update(current) : current));
    setDirty(true);
  }

  function updatePayload(key: string, value: string) {
    updateSection((section) => ({
      ...section,
      payload: { ...section.payload, [key]: value },
    }));
  }

  function updatePromoMessages(
    update: (messages: HomePromoBannerMessage[]) => HomePromoBannerMessage[],
  ) {
    setDraft((current) => {
      if (!current || current.sectionKey !== "promo_banner") return current;
      const messages = readPromoBannerDraftMessages(current.payload, fallbackPromoBanner.messages);
      return {
        ...current,
        payload: promoBannerPayload(update(messages)),
      };
    });
    setDirty(true);
  }

  function addPromoMessage() {
    updatePromoMessages((messages) => [
      ...messages,
      {
        id: stableId("promo"),
        text: "Nouveau message promotionnel",
        isEnabled: true,
        sortOrder: messages.length,
      },
    ]);
  }

  function updatePromoMessage(id: string, update: Partial<HomePromoBannerMessage>) {
    updatePromoMessages((messages) =>
      messages.map((message) => (message.id === id ? { ...message, ...update } : message)),
    );
  }

  function removePromoMessage(id: string) {
    updatePromoMessages((messages) => messages.filter((message) => message.id !== id));
  }

  function movePromoMessage(id: string, direction: -1 | 1) {
    updatePromoMessages((messages) => {
      const index = messages.findIndex((message) => message.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= messages.length) return messages;
      const next = [...messages];
      const current = next[index];
      const targetMessage = next[target];
      if (!current || !targetMessage) return messages;
      next[index] = targetMessage;
      next[target] = current;
      return next;
    });
  }

  function setMedia(mobile: boolean, id: string) {
    const selected = id === "__none" ? undefined : media.find((item) => item.id === id);
    updateSection((section) => ({
      ...section,
      ...(mobile
        ? {
            mobileMediaAssetId: selected?.id ?? "",
            mobileMediaUrl: selected?.url ?? "",
            mobileMediaAlt: selected?.alt ?? "",
          }
        : {
            mediaAssetId: selected?.id ?? "",
            mediaUrl: selected?.url ?? "",
            mediaAlt: selected?.alt ?? "",
          }),
    }));
  }

  function addHotspot() {
    if (sectionKey !== "shop_the_look") return;
    const id = stableId("hotspot");
    updateSection((section) => ({
      ...section,
      hotspots: [
        ...section.hotspots,
        {
          id,
          productId: products.find((product) => product.status === "published")?.id ?? "",
          xPercent: 50,
          yPercent: 50,
          label: "",
        },
      ],
    }));
    setActiveHotspotId(id);
  }

  function updateHotspot(id: string, update: Partial<HotspotDraft>) {
    updateSection((section) => ({
      ...section,
      hotspots: section.hotspots.map((hotspot) =>
        hotspot.id === id ? { ...hotspot, ...update } : hotspot,
      ),
    }));
  }

  function removeHotspot(id: string) {
    updateSection((section) => ({
      ...section,
      hotspots: section.hotspots.filter((hotspot) => hotspot.id !== id),
    }));
    setActiveHotspotId((current) => (current === id ? null : current));
  }

  function positionHotspot(event: React.MouseEvent<HTMLDivElement>) {
    if (!activeHotspotId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const xPercent = Math.min(
      100,
      Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100),
    );
    const yPercent = Math.min(
      100,
      Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100),
    );
    updateHotspot(activeHotspotId, { xPercent, yPercent });
    setActiveHotspotId(null);
  }

  function save() {
    if (!draft) return;
    setFormError(null);
    if (sectionKey === "promo_banner") {
      const promoDraftMessages = readPromoBannerDraftMessages(
        draft.payload,
        fallbackPromoBanner.messages,
      );
      if (promoDraftMessages.some((message) => !message.text.trim())) {
        setFormError("Chaque message doit contenir un texte valide avant l’enregistrement.");
        return;
      }
    }
    if (sectionKey === "shop_the_look" && draft.hotspots.some((hotspot) => !hotspot.productId)) {
      setFormError("Chaque point Shop the Look doit être lié à un produit.");
      return;
    }
    updateHomeSection.mutate(
      { sectionKey, section: toSectionInput(draft) },
      {
        onSuccess: (revision) => {
          setDraft((current) => (current ? { ...current, version: revision.version } : current));
          setDirty(false);
          clear();
        },
      },
    );
  }

  function resetDraft() {
    if (data) {
      setDraft(toSectionDraft(data, sectionKey));
      setDirty(false);
      clear();
      setFormError(null);
    }
  }

  if (error) {
    return (
      <AdminErrorState
        message="Chargement de la homepage impossible."
        onRetry={() => void refetch()}
      />
    );
  }
  if (isLoading || !draft) return <AdminSkeleton rows={12} />;

  const promoMessages =
    sectionKey === "promo_banner"
      ? readPromoBannerDraftMessages(draft.payload, fallbackPromoBanner.messages)
      : [];
  const savePending = updateHomeSection.isPending;
  const publishPending = publishHomeSection.isPending;
  const archivePending = archiveHomeSection.isPending;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={SECTION_LABELS[sectionKey]}
        description={SECTION_DESCRIPTIONS[sectionKey]}
        breadcrumbs={[
          { label: "Contenu" },
          { label: "Page d’accueil", href: "/admin/contenu/accueil" },
          { label: SECTION_LABELS[sectionKey] },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            {published ? (
              <AdminStatusBadge label={`Publiée · v${published.version}`} tone="success" />
            ) : (
              <AdminStatusBadge label="Non publiée" tone="neutral" />
            )}
            <AdminStatusBadge label={statusLabel(data)} tone={statusTone(data)} />
          </div>
        }
      />

      {!canWrite ? (
        <AdminCard>
          <p className="text-sm text-muted-foreground">
            Votre rôle peut consulter la homepage, mais ne permet pas de modifier son brouillon.
          </p>
        </AdminCard>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {sectionKey === "hero" ? (
            <AdminFormSection title={SECTION_LABELS.hero} description={SECTION_DESCRIPTIONS.hero}>
              <AdminSwitchField
                checked={draft.isEnabled}
                onChange={(checked) =>
                  updateSection((section) => ({ ...section, isEnabled: checked }))
                }
                label="Afficher le Hero"
                disabled={!canWrite}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label="Sur-titre"
                  value={stringValue(draft.payload, "eyebrow")}
                  onChange={(value) => updatePayload("eyebrow", value)}
                  disabled={!canWrite}
                />
                <AdminField
                  label="Titre"
                  required
                  value={stringValue(draft.payload, "title")}
                  onChange={(value) => updatePayload("title", value)}
                  disabled={!canWrite}
                />
              </div>
              <AdminField
                label="Description"
                multiline
                rows={3}
                value={stringValue(draft.payload, "description")}
                onChange={(value) => updatePayload("description", value)}
                disabled={!canWrite}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label="CTA principal"
                  value={stringValue(draft.payload, "primaryCtaLabel")}
                  onChange={(value) => updatePayload("primaryCtaLabel", value)}
                  disabled={!canWrite}
                />
                <AdminField
                  label="Lien CTA principal"
                  type="url"
                  value={stringValue(draft.payload, "primaryCtaHref")}
                  onChange={(value) => updatePayload("primaryCtaHref", value)}
                  disabled={!canWrite}
                />
                <AdminField
                  label="CTA secondaire"
                  value={stringValue(draft.payload, "secondaryCtaLabel")}
                  onChange={(value) => updatePayload("secondaryCtaLabel", value)}
                  disabled={!canWrite}
                />
                <AdminField
                  label="Lien CTA secondaire"
                  type="url"
                  value={stringValue(draft.payload, "secondaryCtaHref")}
                  onChange={(value) => updatePayload("secondaryCtaHref", value)}
                  disabled={!canWrite}
                />
              </div>
              <MediaSelector
                section={draft}
                media={media}
                mobile={false}
                onChange={(id) => setMedia(false, id)}
                disabled={!canWrite}
              />
              <MediaSelector
                section={draft}
                media={media}
                mobile
                onChange={(id) => setMedia(true, id)}
                disabled={!canWrite}
              />
            </AdminFormSection>
          ) : null}

          {sectionKey === "promo_banner" ? (
            <AdminFormSection
              title={SECTION_LABELS.promo_banner}
              description={SECTION_DESCRIPTIONS.promo_banner}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background p-3">
                <AdminSwitchField
                  checked={draft.isEnabled}
                  onChange={(checked) =>
                    updateSection((section) => ({ ...section, isEnabled: checked }))
                  }
                  label="Afficher la banderole"
                  description="La banderole est placée avant le logo sur toutes les pages publiques."
                  disabled={!canWrite}
                />
                <div className="text-right text-xs text-muted-foreground">
                  <p>
                    {promoMessages.filter((message) => message.isEnabled).length} actif(s) sur{" "}
                    {promoMessages.length}
                  </p>
                  <p>Les messages actifs défilent en boucle.</p>
                </div>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium">Aperçu public</p>
                <div className="overflow-hidden rounded-md border border-border">
                  <HomePromoBanner content={{ isEnabled: true, messages: promoMessages }} />
                </div>
                {promoMessages.every((message) => !message.isEnabled) ? (
                  <p className="text-xs text-muted-foreground">
                    Aucun message actif : la banderole sera masquée publiquement.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium">Messages</h3>
                  <p className="text-xs text-muted-foreground">
                    Ajoutez, ordonnez et activez les messages affichés dans la banderole.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPromoMessage}
                  disabled={!canWrite || promoMessages.length >= 20}
                >
                  <Plus className="mr-1 size-4" /> Ajouter un message
                </Button>
              </div>

              <div className="grid gap-3">
                {promoMessages.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Aucun message configuré.
                  </p>
                ) : (
                  promoMessages.map((message, index) => (
                    <div
                      key={message.id}
                      className="grid gap-3 rounded-md border border-border p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">
                            #{index + 1}
                          </span>
                          <span className="text-sm font-medium">
                            {message.text || "Message sans texte"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => movePromoMessage(message.id, -1)}
                            disabled={!canWrite || index === 0}
                            aria-label={`Monter le message ${index + 1}`}
                          >
                            <ArrowUp className="size-4" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => movePromoMessage(message.id, 1)}
                            disabled={!canWrite || index === promoMessages.length - 1}
                            aria-label={`Descendre le message ${index + 1}`}
                          >
                            <ArrowDown className="size-4" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePromoMessage(message.id)}
                            disabled={!canWrite}
                            aria-label={`Supprimer le message ${index + 1}`}
                          >
                            <Trash2 className="size-4 text-red-700" aria-hidden />
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <AdminField
                          label="Message"
                          required
                          value={message.text}
                          onChange={(value) => updatePromoMessage(message.id, { text: value })}
                          disabled={!canWrite}
                        />
                        <AdminField
                          label="Libellé (optionnel)"
                          value={message.label ?? ""}
                          onChange={(value) => updatePromoMessage(message.id, { label: value })}
                          disabled={!canWrite}
                        />
                        <AdminField
                          label="Lien (optionnel)"
                          type="url"
                          value={message.href ?? ""}
                          onChange={(value) => updatePromoMessage(message.id, { href: value })}
                          disabled={!canWrite}
                        />
                        <AdminSwitchField
                          checked={message.isEnabled}
                          onChange={(checked) =>
                            updatePromoMessage(message.id, { isEnabled: checked })
                          }
                          label="Message actif"
                          disabled={!canWrite}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </AdminFormSection>
          ) : null}

          {sectionKey === "shop_the_look" ? (
            <AdminFormSection
              title={SECTION_LABELS.shop_the_look}
              description={SECTION_DESCRIPTIONS.shop_the_look}
            >
              <AdminSwitchField
                checked={draft.isEnabled}
                onChange={(checked) =>
                  updateSection((section) => ({ ...section, isEnabled: checked }))
                }
                label="Afficher Shop the Look"
                disabled={!canWrite}
              />
              <AdminField
                label="Titre"
                required
                value={stringValue(draft.payload, "title")}
                onChange={(value) => updatePayload("title", value)}
                disabled={!canWrite}
              />
              <AdminField
                label="Description"
                multiline
                rows={2}
                value={stringValue(draft.payload, "description")}
                onChange={(value) => updatePayload("description", value)}
                disabled={!canWrite}
              />
              <MediaSelector
                section={draft}
                media={media}
                mobile={false}
                onChange={(id) => setMedia(false, id)}
                disabled={!canWrite}
              />
              <ShopTheLookEditor
                section={draft}
                products={products}
                activeHotspotId={activeHotspotId}
                onPosition={positionHotspot}
                onSelectHotspot={setActiveHotspotId}
                onAdd={addHotspot}
                onUpdate={updateHotspot}
                onRemove={removeHotspot}
                disabled={!canWrite}
              />
            </AdminFormSection>
          ) : null}
        </div>

        <aside className="space-y-4">
          <AdminCard>
            <div className="mb-3 flex items-center gap-2">
              <Eye className="size-4 text-primary" aria-hidden />
              <h2 className="text-sm font-semibold">Workflow de publication</h2>
            </div>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">1.</strong> Enregistrez les modifications en
                brouillon.
              </li>
              <li>
                <strong className="text-foreground">2.</strong> Vérifiez les médias et les points
                produits.
              </li>
              <li>
                <strong className="text-foreground">3.</strong> Publiez uniquement après validation.
              </li>
            </ol>
            {published ? (
              <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                Dernière publication :{" "}
                {new Date(published.publishedAt ?? published.updatedAt).toLocaleString("fr-FR")}.
              </p>
            ) : null}
          </AdminCard>
          <AdminCard>
            <h2 className="mb-2 text-sm font-semibold">Sections administrées</h2>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span>{SECTION_LABELS[sectionKey]}</span>
              <span className={draft.isEnabled ? "text-emerald-700" : "text-muted-foreground"}>
                {draft.isEnabled ? "Active" : "Masquée"}
              </span>
            </div>
          </AdminCard>
        </aside>
      </div>

      {formError ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {formError}
        </p>
      ) : null}

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-end gap-2 rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
        <Button variant="outline" onClick={resetDraft} disabled={!dirty || savePending}>
          Annuler les modifications
        </Button>
        <Button onClick={save} disabled={!canWrite || !dirty || savePending}>
          <Save className="mr-1 size-4" /> Enregistrer le brouillon
        </Button>
        <Button
          onClick={() => publishHomeSection.mutate(sectionKey)}
          disabled={!canPublish || dirty || !data?.draft || publishPending}
        >
          <Send className="mr-1 size-4" /> Publier
        </Button>
        <Button
          variant="outline"
          className="text-red-700 hover:text-red-800"
          onClick={() => setPendingArchive(true)}
          disabled={!canPublish || dirty || !published || archivePending}
        >
          <Archive className="mr-1 size-4" /> Archiver la publication
        </Button>
      </div>

      <AdminConfirmDialog
        open={pendingArchive}
        onOpenChange={setPendingArchive}
        title="Archiver la publication homepage ?"
        description="La version publiée ne sera plus exposée publiquement. Le brouillon restera disponible pour une nouvelle publication."
        confirmLabel="Archiver"
        destructive
        onConfirm={() => {
          archiveHomeSection.mutate(sectionKey);
          setPendingArchive(false);
        }}
      />
    </div>
  );
}

function MediaSelector({
  section,
  media,
  mobile,
  onChange,
  disabled,
}: {
  section: SectionDraft;
  media: AdminMedia[];
  mobile: boolean;
  onChange: (id: string) => void;
  disabled: boolean;
}) {
  const id = mobile ? section.mobileMediaAssetId : section.mediaAssetId;
  const url = mobile ? section.mobileMediaUrl : section.mediaUrl;
  const alt = mobile ? section.mobileMediaAlt : section.mediaAlt;
  const selected = id ? media.find((item) => item.id === id) : undefined;
  const statusNotice =
    selected?.status === "draft"
      ? "Ce média est encore en brouillon. Il sera activé automatiquement lors de la publication de cette section."
      : selected?.status === "archived"
        ? "Ce média est archivé et ne peut pas être publié. Sélectionnez un média actif."
        : null;
  return (
    <div className="grid gap-3 rounded-md border border-dashed border-border p-3">
      <AdminSelectField
        label={mobile ? "Média mobile (facultatif)" : "Média desktop"}
        value={id || "__none"}
        options={mediaOptions(media, id)}
        onChange={onChange}
        disabled={disabled}
        hint="Les médias actifs sont sélectionnables. Un brouillon déjà lié sera activé à la publication."
      />
      {statusNotice ? <p className="text-xs text-amber-700">{statusNotice}</p> : null}
      {url ? (
        <img
          src={url}
          alt={alt}
          className="max-h-48 w-full rounded-md border border-border object-contain"
          loading="lazy"
        />
      ) : (
        <p className="text-xs text-muted-foreground">Aucun visuel sélectionné.</p>
      )}
    </div>
  );
}

function ShopTheLookEditor({
  section,
  products,
  activeHotspotId,
  onPosition,
  onSelectHotspot,
  onAdd,
  onUpdate,
  onRemove,
  disabled,
}: {
  section: SectionDraft;
  products: AdminProduct[];
  activeHotspotId: string | null;
  onPosition: (event: React.MouseEvent<HTMLDivElement>) => void;
  onSelectHotspot: (id: string | null) => void;
  onAdd: () => void;
  onUpdate: (id: string, update: Partial<HotspotDraft>) => void;
  onRemove: (id: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium">Points produits</h3>
          <p className="text-xs text-muted-foreground">
            Ajoutez un point, sélectionnez-le, puis cliquez sur l’image pour le positionner.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onAdd} disabled={disabled}>
          <Plus className="mr-1 size-4" /> Ajouter un point
        </Button>
      </div>
      {section.mediaUrl ? (
        <div
          className={`relative overflow-hidden rounded-md border border-border bg-muted ${activeHotspotId ? "cursor-crosshair" : ""}`}
          onClick={onPosition}
          role="img"
          aria-label="Image Shop the Look — cliquez pour positionner le point sélectionné"
        >
          <img
            src={section.mediaUrl}
            alt={section.mediaAlt}
            className="block max-h-[420px] w-full object-contain"
            loading="lazy"
          />
          {section.hotspots.map((hotspot, index) => (
            <button
              key={hotspot.id}
              type="button"
              className={`absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-lg ${activeHotspotId === hotspot.id ? "bg-primary ring-4 ring-primary/30" : "bg-foreground/80"}`}
              style={{ left: `${hotspot.xPercent}%`, top: `${hotspot.yPercent}%` }}
              onClick={(event) => {
                event.stopPropagation();
                onSelectHotspot(hotspot.id);
              }}
              aria-label={`Point ${index + 1}${hotspot.label ? ` — ${hotspot.label}` : ""}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Sélectionnez une image pour afficher la zone de positionnement.
          </div>
          {section.hotspots.length > 0 ? (
            <p role="status" className="text-xs font-medium text-amber-700">
              Cette section contient des points sans image. Le brouillon peut être enregistré, mais
              ajoutez une image et vérifiez les points avant publication.
            </p>
          ) : null}
        </>
      )}
      {activeHotspotId ? (
        <p className="flex items-center gap-2 text-xs font-medium text-primary">
          <MousePointer2 className="size-3.5" aria-hidden /> Cliquez sur l’image pour placer le
          point sélectionné.
        </p>
      ) : null}
      <div className="grid gap-3">
        {section.hotspots.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucun point configuré.</p>
        ) : (
          section.hotspots.map((hotspot, index) => (
            <div key={hotspot.id} className="grid gap-3 rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Point {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(hotspot.id)}
                  disabled={disabled}
                  aria-label={`Supprimer le point ${index + 1}`}
                >
                  <Trash2 className="size-4 text-red-700" aria-hidden />
                </Button>
              </div>
              <AdminSelectField
                label="Produit associé"
                required
                value={hotspot.productId || "__none"}
                options={productOptions(products, hotspot.productId)}
                onChange={(value) =>
                  onUpdate(hotspot.id, { productId: value === "__none" ? "" : value })
                }
                disabled={disabled}
              />
              {linkedProductNotice(products, hotspot.productId) ? (
                <p role="alert" className="text-xs font-medium text-amber-700">
                  {linkedProductNotice(products, hotspot.productId)}
                </p>
              ) : null}
              <div className="grid gap-3 md:grid-cols-3">
                <AdminNumberField
                  label="X (%)"
                  value={hotspot.xPercent}
                  min={0}
                  onChange={(value) =>
                    onUpdate(hotspot.id, { xPercent: Math.min(100, Math.max(0, value)) })
                  }
                  disabled={disabled}
                />
                <AdminNumberField
                  label="Y (%)"
                  value={hotspot.yPercent}
                  min={0}
                  onChange={(value) =>
                    onUpdate(hotspot.id, { yPercent: Math.min(100, Math.max(0, value)) })
                  }
                  disabled={disabled}
                />
                <AdminField
                  label="Libellé"
                  value={hotspot.label}
                  onChange={(value) => onUpdate(hotspot.id, { label: value })}
                  disabled={disabled}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => onSelectHotspot(hotspot.id)}
                disabled={disabled || !section.mediaUrl}
              >
                <MousePointer2 className="mr-1 size-3.5" /> Positionner sur l’image
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
