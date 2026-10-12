import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import {
  AdminDataTable,
  AdminPagination,
  AdminSearchInput,
  AdminSelectFilter,
  type AdminColumn,
} from "@/admin/components/ui/AdminDataTable";
import { AdminStatusBadge } from "@/admin/components/ui/AdminStates";
import { useAdminCustomQuotes } from "@/admin/hooks/admin.queries";
import type { AdminCustomQuote } from "@/admin/types/admin.types";
import type { AdminCustomQuoteListParams } from "@/admin/repositories/interfaces";
import { formatDateTime } from "@/admin/utils/admin.utils";

const PAGE_SIZE = 20;
const PRODUCT_LABELS: Record<AdminCustomQuote["productType"], string> = {
  rideaux: "Rideaux",
  voilages: "Voilages",
  stores: "Stores",
  ensemble_fenetre: "Ensemble de la fenêtre",
};
const REQUEST_TYPE_LABELS: Record<AdminCustomQuote["requestType"], string> = {
  particulier: "Particulier",
  professionnels: "Professionnels",
};

export function AdminCustomQuotesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [requestType, setRequestType] = useState<"all" | AdminCustomQuote["requestType"]>("all");
  const params = useMemo<AdminCustomQuoteListParams>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(filter === "unread" ? { unreadOnly: true } : {}),
      ...(filter === "archived" ? { includeArchived: true } : {}),
      ...(requestType !== "all" ? { requestType } : {}),
    }),
    [page, filter, requestType],
  );
  const { data, isLoading, error, refetch } = useAdminCustomQuotes(params, search);
  const rows = data?.items ?? [];
  const columns: AdminColumn<AdminCustomQuote>[] = [
    {
      id: "reference",
      header: "Référence",
      cell: (quote) => (
        <div>
          <AppLink
            href={`/admin/demandes-sur-mesure/${quote.id}`}
            className="font-medium underline-offset-2 hover:underline"
          >
            {quote.reference}
          </AppLink>
          <p className="text-xs text-muted-foreground">{formatDateTime(quote.createdAt)}</p>
        </div>
      ),
    },
    {
      id: "client",
      header: "Client",
      cell: (quote) => (
        <div>
          <p className="font-medium">
            {quote.contact.firstName} {quote.contact.lastName}
          </p>
          <a
            className="text-xs text-muted-foreground hover:underline"
            href={`tel:${quote.contact.phone}`}
          >
            {quote.contact.phone}
          </a>
        </div>
      ),
    },
    { id: "project", header: "Projet", cell: (quote) => PRODUCT_LABELS[quote.productType] },
    {
      id: "requestType",
      header: "Type de demande",
      cell: (quote) => (
        <AdminStatusBadge
          label={REQUEST_TYPE_LABELS[quote.requestType]}
          tone={quote.requestType === "professionnels" ? "info" : "neutral"}
        />
      ),
    },
    {
      id: "contact",
      header: "Contact préféré",
      cell: (quote) =>
        quote.contact.preferredContact === "whatsapp"
          ? "WhatsApp"
          : quote.contact.preferredContact === "email"
            ? "E-mail"
            : "Téléphone",
    },
    {
      id: "state",
      header: "Lecture",
      cell: (quote) =>
        quote.readAt ? (
          <AdminStatusBadge label="Lue" tone="neutral" />
        ) : (
          <AdminStatusBadge label="Non lue" tone="warning" />
        ),
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (quote) => (
        <AppLink
          href={`/admin/demandes-sur-mesure/${quote.id}`}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="size-3.5" aria-hidden />
          Ouvrir
        </AppLink>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Demandes sur mesure"
        description="Consultez les demandes reçues depuis le formulaire de devis, sans pipeline commercial."
        breadcrumbs={[{ label: "Demandes sur mesure" }]}
      />
      <AdminDataTable
        rows={rows}
        columns={columns}
        rowKey={(quote) => quote.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        pageSize={PAGE_SIZE}
        emptyTitle="Aucune demande de devis"
        emptyDescription="Les nouvelles demandes apparaîtront ici après leur envoi."
        toolbar={
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm sm:order-last sm:ml-auto">
              <span className="font-semibold tabular-nums text-foreground">{data?.total ?? 0}</span>
              <span className="text-muted-foreground">demande(s)</span>
              {(data?.unread ?? 0) > 0 ? (
                <AdminStatusBadge label={`${data?.unread} non lue(s)`} tone="warning" />
              ) : null}
            </div>
            <AdminSearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Référence, nom, téléphone ou e-mail"
            />
            <AdminSelectFilter
              label="Afficher"
              value={filter}
              onChange={(value) => {
                setFilter(value);
                setPage(1);
              }}
              options={[
                { value: "active", label: "Actives" },
                { value: "unread", label: "Non lues" },
                { value: "archived", label: "Archivées" },
              ]}
            />
            <AdminSelectFilter
              label="Type"
              value={requestType}
              onChange={(value) => {
                setRequestType(value as typeof requestType);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Tous les types" },
                { value: "particulier", label: "Particuliers" },
                { value: "professionnels", label: "Professionnels" },
              ]}
            />
          </>
        }
      />
      <AdminPagination
        page={data?.page ?? page}
        pageCount={data?.pageCount ?? 1}
        total={data?.total ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}
