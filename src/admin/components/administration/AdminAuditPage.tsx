import { useMemo, useState } from "react";
import {
  AdminCard,
  AdminStatusBadge,
  AdminSkeleton,
  AdminErrorState,
} from "@/admin/components/ui/AdminStates";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import { AdminPagination, AdminSearchInput } from "@/admin/components/ui/AdminDataTable";
import { useAdminAuditPage } from "@/admin/hooks/admin.queries";
import { Button } from "@/components/ui/button";

export function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [outcome, setOutcome] = useState<"all" | "success" | "denied" | "failure">("all");
  const [action, setAction] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const params = useMemo(
    () => ({
      page,
      pageSize: 30,
      ...(search.trim() ? { query: search.trim() } : {}),
      ...(outcome === "all" ? {} : { outcome }),
      ...(action ? { action } : {}),
      ...(resourceType ? { resourceType } : {}),
      ...(dateFrom ? { dateFrom: `${dateFrom}T00:00:00.000Z` } : {}),
      ...(dateTo ? { dateTo: `${dateTo}T23:59:59.999Z` } : {}),
    }),
    [page, search, outcome, action, resourceType, dateFrom, dateTo],
  );
  const query = useAdminAuditPage(params);
  const rows = query.data?.items ?? [];
  if (query.isLoading) return <AdminSkeleton rows={8} />;
  if (query.error)
    return (
      <AdminErrorState
        message={
          query.error instanceof Error ? query.error.message : "Impossible de charger le journal."
        }
        onRetry={() => void query.refetch()}
      />
    );
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Journal d’activité"
        description="Traçabilité des accès et mutations Admin, avec filtres de recherche."
        breadcrumbs={[{ label: "Journal d’activité" }]}
      />
      <AdminCard className="space-y-4">
        <AdminSearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Action, ressource, utilisateur…"
        />
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="audit-outcome">
            Résultat
          </label>
          <select
            id="audit-outcome"
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={outcome}
            onChange={(event) => {
              setOutcome(event.target.value as typeof outcome);
              setPage(1);
            }}
          >
            <option value="all">Tous</option>
            <option value="success">Succès</option>
            <option value="denied">Refusés</option>
            <option value="failure">Échecs</option>
          </select>
          <input
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              setPage(1);
            }}
            placeholder="Action exacte"
            aria-label="Filtrer par action"
          />
          <input
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={resourceType}
            onChange={(event) => {
              setResourceType(event.target.value);
              setPage(1);
            }}
            placeholder="Type de ressource"
            aria-label="Filtrer par type de ressource"
          />
          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            Du
            <input
              className="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              aria-label="Date de début"
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            Au
            <input
              className="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
              aria-label="Date de fin"
            />
          </label>
          {action || resourceType || dateFrom || dateTo || outcome !== "all" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAction("");
                setResourceType("");
                setDateFrom("");
                setDateTo("");
                setOutcome("all");
                setPage(1);
              }}
            >
              Réinitialiser
            </Button>
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Utilisateur</th>
                <th className="px-3 py-3">Action</th>
                <th className="px-3 py-3">Ressource</th>
                <th className="px-3 py-3">Résultat</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-3 py-3 whitespace-nowrap">
                    {new Date(item.at).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-3 py-3">{item.userName}</td>
                  <td className="px-3 py-3 font-medium">{item.action}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {item.resourceType}
                    {item.resourceId ? ` · ${item.resourceId}` : ""}
                  </td>
                  <td className="px-3 py-3">
                    <AdminStatusBadge
                      label={
                        item.outcome === "denied"
                          ? "Refusé"
                          : item.outcome === "failure"
                            ? "Échec"
                            : "Succès"
                      }
                      tone={
                        item.outcome === "denied" || item.outcome === "failure"
                          ? "danger"
                          : "success"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Aucune activité trouvée.
            </p>
          ) : null}
        </div>
        {query.data && query.data.pageCount > 1 ? (
          <AdminPagination
            page={query.data.page}
            pageCount={query.data.pageCount}
            total={query.data.total}
            onPageChange={setPage}
          />
        ) : null}
      </AdminCard>
    </div>
  );
}
