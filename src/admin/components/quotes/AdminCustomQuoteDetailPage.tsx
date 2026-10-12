import { useEffect } from "react";
import { Archive, ArrowLeft, Check, Mail, MessageCircle, Phone, UserPlus } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import {
  AdminCard,
  AdminEmptyState,
  AdminErrorState,
  AdminSkeleton,
  AdminStatusBadge,
} from "@/admin/components/ui/AdminStates";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import { useAdminCustomQuote } from "@/admin/hooks/admin.queries";
import {
  useArchiveCustomQuote,
  useConvertCustomQuoteToCustomer,
  useMarkCustomQuoteRead,
} from "@/admin/hooks/admin-custom-quote.mutations";
import type { AdminCustomQuote } from "@/admin/types/admin.types";
import { formatDateTime } from "@/admin/utils/admin.utils";

const PRODUCT_LABELS: Record<AdminCustomQuote["productType"], string> = {
  rideaux: "Rideaux",
  voilages: "Voilages",
  stores: "Stores",
  ensemble_fenetre: "Ensemble de la fenêtre",
};

function contactLabel(value: AdminCustomQuote["contact"]["preferredContact"]): string {
  return value === "whatsapp" ? "WhatsApp" : value === "email" ? "E-mail" : "Téléphone";
}

export function AdminCustomQuoteDetailPage({ quoteId }: { quoteId: string }) {
  const { data: quote, isLoading, error, refetch } = useAdminCustomQuote(quoteId);
  const { mutate: markReadQuote, isPending: markReadPending } = useMarkCustomQuoteRead();
  const archive = useArchiveCustomQuote();
  const convertToCustomer = useConvertCustomQuoteToCustomer();

  useEffect(() => {
    if (quote && !quote.readAt && !markReadPending) markReadQuote(quote.id);
  }, [quote, markReadPending, markReadQuote]);

  if (isLoading) return <AdminSkeleton />;
  if (error) {
    return (
      <AdminErrorState
        message={error instanceof Error ? error.message : "Chargement impossible."}
        onRetry={() => void refetch()}
      />
    );
  }
  if (!quote) {
    return (
      <AdminEmptyState
        title="Demande introuvable"
        description="Cette demande n'existe pas ou a été supprimée."
        action={
          <Button asChild variant="outline">
            <AppLink href="/admin/demandes-sur-mesure">Retour aux demandes</AppLink>
          </Button>
        }
      />
    );
  }

  const notes = typeof quote.preferences.notes === "string" ? quote.preferences.notes.trim() : "";
  const whatsappPhone = quote.contact.phone.replace(/[^0-9+]/g, "").replace(/^\+/, "");

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={quote.reference}
        description={`Demande reçue le ${formatDateTime(quote.createdAt)}`}
        breadcrumbs={[
          { label: "Demandes sur mesure", href: "/admin/demandes-sur-mesure" },
          { label: quote.reference },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <AppLink href="/admin/demandes-sur-mesure">
              <ArrowLeft className="size-4" aria-hidden />
              Retour à la liste
            </AppLink>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <AdminStatusBadge
          label={quote.archivedAt ? "Archivée" : "Active"}
          tone={quote.archivedAt ? "neutral" : "success"}
        />
        <AdminStatusBadge
          label={quote.readAt ? "Lue" : "Non lue"}
          tone={quote.readAt ? "neutral" : "warning"}
        />
        <AdminStatusBadge
          label={quote.requestType === "professionnels" ? "Professionnels" : "Particulier"}
          tone={quote.requestType === "professionnels" ? "info" : "neutral"}
        />
        {quote.emailSentAt ? (
          <AdminStatusBadge label="E-mail envoyé" tone="info" />
        ) : (
          <AdminStatusBadge label="E-mail en attente" tone="warning" />
        )}
        {quote.customerId ? <AdminStatusBadge label="Client créé" tone="success" /> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Projet</h2>
            {quote.requestType === "professionnels" && quote.professionalDetails ? (
              <div className="mb-5 rounded-md border border-border bg-muted/30 p-3 text-sm">
                <h3 className="mb-3 font-semibold">Informations professionnelles</h3>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Entreprise</dt>
                    <dd className="font-medium">{quote.professionalDetails.companyName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Activité</dt>
                    <dd className="font-medium">{quote.professionalDetails.activity}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Volume estimé</dt>
                    <dd className="font-medium">{quote.professionalDetails.projectVolume}</dd>
                  </div>
                  {quote.professionalDetails.taxId ? (
                    <div>
                      <dt className="text-muted-foreground">Matricule fiscal</dt>
                      <dd className="font-medium">{quote.professionalDetails.taxId}</dd>
                    </div>
                  ) : null}
                  {quote.professionalDetails.desiredDeadline ? (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Échéance souhaitée</dt>
                      <dd className="font-medium">{quote.professionalDetails.desiredDeadline}</dd>
                    </div>
                  ) : null}
                </dl>
                <p className="mt-4 whitespace-pre-line text-muted-foreground">
                  {quote.professionalDetails.message}
                </p>
              </div>
            ) : null}
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">{PRODUCT_LABELS[quote.productType]}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Accessoires</dt>
                <dd className="font-medium">
                  {quote.preferences.wantsAccessories ? "Oui" : "Non"}
                </dd>
              </div>
            </dl>
            <h3 className="mt-5 mb-2 text-sm font-semibold">Ouvertures</h3>
            {quote.openings.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
                      <th className="py-2">Pièce</th>
                      <th className="py-2">Type</th>
                      <th className="py-2 text-right">Dimensions</th>
                      <th className="py-2 text-right">Qté</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.openings.map((opening) => (
                      <tr key={opening.id} className="border-b border-border last:border-0">
                        <td className="py-2">{opening.label}</td>
                        <td className="py-2">{opening.openingType}</td>
                        <td className="py-2 text-right">
                          {opening.widthCm} × {opening.heightCm} cm
                        </td>
                        <td className="py-2 text-right">{opening.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune ouverture renseignée.</p>
            )}
            {notes ? (
              <>
                <h3 className="mt-5 mb-2 text-sm font-semibold">Précisions</h3>
                <p className="whitespace-pre-line text-sm text-muted-foreground">{notes}</p>
              </>
            ) : null}
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Pièces jointes</h2>
            {quote.attachmentMetadata.length ? (
              <ul className="space-y-2 text-sm">
                {quote.attachmentMetadata.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="ml-3 shrink-0 text-xs text-muted-foreground">{file.type}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune pièce jointe.</p>
            )}
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Coordonnées</h2>
            <p className="font-medium">
              {quote.contact.firstName} {quote.contact.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {quote.contact.city}, {quote.contact.governorate}
            </p>
            <p className="mt-3 text-sm">
              <a
                className="inline-flex items-center gap-2 hover:underline"
                href={`tel:${quote.contact.phone}`}
              >
                <Phone className="size-4" aria-hidden />
                {quote.contact.phone}
              </a>
            </p>
            {quote.contact.email ? (
              <p className="text-sm">
                <a
                  className="inline-flex items-center gap-2 hover:underline"
                  href={`mailto:${quote.contact.email}`}
                >
                  <Mail className="size-4" aria-hidden />
                  {quote.contact.email}
                </a>
              </p>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground">
              Contact préféré : {contactLabel(quote.contact.preferredContact)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <a href={`tel:${quote.contact.phone}`}>
                  <Phone className="size-4" aria-hidden />
                  Appeler
                </a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href={`https://wa.me/${whatsappPhone}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp
                </a>
              </Button>
            </div>
          </AdminCard>
          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Actions</h2>
            <div className="flex flex-col gap-2">
              {quote.customerId ? (
                <Button asChild size="sm" variant="outline">
                  <AppLink href={`/admin/clients/${quote.customerId}`}>
                    <UserPlus className="size-4" aria-hidden />
                    Voir la fiche client
                  </AppLink>
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={convertToCustomer.isPending}
                  onClick={() => {
                    if (window.confirm("Ajouter ce prospect à la liste des clients ?")) {
                      convertToCustomer.mutate(quote.id);
                    }
                  }}
                >
                  <UserPlus className="size-4" aria-hidden />
                  {convertToCustomer.isPending ? "Conversion en cours…" : "Convertir en client"}
                </Button>
              )}
              {!quote.readAt ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={markReadPending}
                  onClick={() => markReadQuote(quote.id)}
                >
                  <Check className="size-4" aria-hidden />
                  Marquer comme lue
                </Button>
              ) : null}
              {!quote.archivedAt ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={archive.isPending}
                  onClick={() => archive.mutate(quote.id)}
                >
                  <Archive className="size-4" aria-hidden />
                  Archiver la demande
                </Button>
              ) : null}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
