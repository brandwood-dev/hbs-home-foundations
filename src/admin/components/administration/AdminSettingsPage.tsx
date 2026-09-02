import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AdminCard, AdminErrorState, AdminSkeleton } from "@/admin/components/ui/AdminStates";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import { adminKeys, useAdminMutation, useAdminSettings } from "@/admin/hooks/admin.queries";
import { adminRepositories } from "@/admin/repositories/adminRepositoryFactory";
import type { AdminSettings } from "@/admin/types/admin.types";

const DEFAULT_SETTINGS: AdminSettings = {
  store: {
    name: "HBS HOME",
    currency: "TND",
    language: "fr",
    timezone: "Africa/Tunis",
    address: "",
  },
  shipping: {
    standardFeeMinor: 7000,
    freeShippingThresholdMinor: 20000,
    estimatedDeliveryLabel: "Livraison sous 24 à 48 heures",
    storePickupEnabled: false,
    pickupAddress: "",
  },
  contact: { phone: "", email: "", whatsapp: "", openingHours: "" },
  social: { facebook: "", instagram: "", tiktok: "" },
  seo: { defaultTitle: "HBS HOME", defaultDescription: "", ogImageUrl: "" },
  features: {
    checkout: true,
    favorites: true,
    reviews: false,
    customMade: true,
    professionals: false,
    orderTracking: true,
    customerAccounts: false,
    onlinePayment: false,
  },
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <AdminCard className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </AdminCard>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {multiline ? (
        <Textarea
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-24"
        />
      ) : (
        <Input
          type={type}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

export function AdminSettingsPage() {
  const query = useAdminSettings();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (query.data && !dirty) setSettings(query.data);
  }, [query.data, dirty]);
  const save = useAdminMutation({
    mutationFn: (value: AdminSettings) => adminRepositories.settings.update(value),
    successMessage: "Paramètres enregistrés.",
    invalidate: [],
    onSuccess: (value) => {
      // Keep the query cache in sync with the persisted version. Without this,
      // returning to the page within the 30s freshness window showed the old
      // values even though Supabase had saved the update successfully.
      queryClient.setQueryData(adminKeys.settings(), value);
      setSettings(value);
      setDirty(false);
    },
  });
  const set = <K extends keyof AdminSettings>(
    section: K,
    key: keyof NonNullable<AdminSettings[K]>,
    value: string | number | boolean,
  ) => {
    setSettings((current) => ({
      ...current,
      [section]: { ...(current[section] as object), [key]: value },
    }));
    setDirty(true);
  };
  if (query.isLoading) return <AdminSkeleton rows={8} />;
  if (query.error)
    return (
      <AdminErrorState
        message={
          query.error instanceof Error
            ? query.error.message
            : "Impossible de charger les paramètres."
        }
        onRetry={() => void query.refetch()}
      />
    );
  return (
    <div className="space-y-6 pb-24">
      <AdminPageHeader
        title="Paramètres"
        description="Configuration générale du magasin et des fonctionnalités publiques."
        breadcrumbs={[{ label: "Paramètres" }]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!dirty || save.isPending}
              onClick={() => {
                setSettings(query.data ?? DEFAULT_SETTINGS);
                setDirty(false);
              }}
            >
              <RotateCcw className="mr-2 size-4" />
              Annuler
            </Button>
            <Button disabled={!dirty || save.isPending} onClick={() => save.mutate(settings)}>
              <Save className="mr-2 size-4" />
              {save.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <Section title="Boutique" description="Identité et paramètres régionaux.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Nom de la boutique"
              value={settings.store.name}
              onChange={(value) => set("store", "name", value)}
            />
            <Field
              label="Devise"
              value={settings.store.currency}
              onChange={(value) => set("store", "currency", value)}
            />
            <Field
              label="Langue"
              value={settings.store.language}
              onChange={(value) => set("store", "language", value)}
            />
            <Field
              label="Fuseau horaire"
              value={settings.store.timezone}
              onChange={(value) => set("store", "timezone", value)}
            />
          </div>
          <Field
            label="Adresse"
            value={settings.store.address}
            multiline
            onChange={(value) => set("store", "address", value)}
          />
        </Section>
        <Section title="Livraison" description="Tarifs et informations affichées au client.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Frais standard (millimes)"
              type="number"
              value={settings.shipping.standardFeeMinor}
              onChange={(value) => set("shipping", "standardFeeMinor", Number(value) || 0)}
            />
            <Field
              label="Seuil de gratuité (millimes)"
              type="number"
              value={settings.shipping.freeShippingThresholdMinor}
              onChange={(value) =>
                set("shipping", "freeShippingThresholdMinor", Number(value) || 0)
              }
            />
          </div>
          <Field
            label="Délai affiché"
            value={settings.shipping.estimatedDeliveryLabel}
            onChange={(value) => set("shipping", "estimatedDeliveryLabel", value)}
          />
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Retrait en magasin</p>
              <p className="text-xs text-muted-foreground">Proposer cette option au checkout.</p>
            </div>
            <Switch
              checked={settings.shipping.storePickupEnabled}
              onCheckedChange={(value) => {
                set("shipping", "storePickupEnabled", value);
              }}
            />
          </div>
          {settings.shipping.storePickupEnabled ? (
            <Field
              label="Adresse de retrait"
              value={settings.shipping.pickupAddress}
              onChange={(value) => set("shipping", "pickupAddress", value)}
            />
          ) : null}
        </Section>
        <Section title="Contact et réseaux" description="Coordonnées publiques de HBS HOME.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Téléphone"
              value={settings.contact.phone}
              onChange={(value) => set("contact", "phone", value)}
            />
            <Field
              label="E-mail"
              value={settings.contact.email}
              onChange={(value) => set("contact", "email", value)}
            />
            <Field
              label="WhatsApp"
              value={settings.contact.whatsapp}
              onChange={(value) => set("contact", "whatsapp", value)}
            />
            <Field
              label="Horaires"
              value={settings.contact.openingHours}
              onChange={(value) => set("contact", "openingHours", value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Facebook"
              value={settings.social.facebook}
              onChange={(value) => set("social", "facebook", value)}
            />
            <Field
              label="Instagram"
              value={settings.social.instagram}
              onChange={(value) => set("social", "instagram", value)}
            />
            <Field
              label="TikTok"
              value={settings.social.tiktok}
              onChange={(value) => set("social", "tiktok", value)}
            />
          </div>
        </Section>
        <Section
          title="SEO par défaut"
          description="Valeurs de repli utilisées lorsqu’une page n’a pas de métadonnées dédiées."
        >
          <Field
            label="Titre par défaut"
            value={settings.seo.defaultTitle}
            onChange={(value) => set("seo", "defaultTitle", value)}
          />
          <Field
            label="Description par défaut"
            value={settings.seo.defaultDescription}
            multiline
            onChange={(value) => set("seo", "defaultDescription", value)}
          />
          <Field
            label="URL de l’image OG"
            value={settings.seo.ogImageUrl}
            onChange={(value) => set("seo", "ogImageUrl", value)}
          />
        </Section>
        <Section
          title="Fonctionnalités"
          description="Activez uniquement les modules réellement disponibles."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(settings.features) as Array<keyof AdminSettings["features"]>).map(
              (key) => (
                <label
                  key={key}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <span>
                    {key === "customMade"
                      ? "Sur mesure"
                      : key === "orderTracking"
                        ? "Suivi de commande"
                        : key === "customerAccounts"
                          ? "Comptes clients"
                          : key === "onlinePayment"
                            ? "Paiement en ligne"
                            : key === "checkout"
                              ? "Commande"
                              : key === "favorites"
                                ? "Favoris"
                                : key === "reviews"
                                  ? "Avis"
                                  : "Professionnels"}
                  </span>
                  <Switch
                    checked={settings.features[key]}
                    onCheckedChange={(value) => set("features", key, value)}
                  />
                </label>
              ),
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
