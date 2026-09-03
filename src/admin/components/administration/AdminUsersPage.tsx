import { useMemo, useState } from "react";
import { Search, ShieldCheck, Trash2, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminCard,
  AdminStatusBadge,
  AdminSkeleton,
  AdminErrorState,
} from "@/admin/components/ui/AdminStates";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import { AdminConfirmDialog } from "@/admin/components/ui/AdminOverlays";
import { AdminPagination } from "@/admin/components/ui/AdminDataTable";
import { useAdminAuthorization } from "@/admin/auth/AdminAuthorizationContext";
import { useAdminMutation, useAdminUsersPage } from "@/admin/hooks/admin.queries";
import { adminRepositories } from "@/admin/repositories/adminRepositoryFactory";
import type { AdminRoleId, AdminUser } from "@/admin/types/admin.types";

const ROLES: Array<{ key: AdminRoleId; label: string; description: string }> = [
  { key: "super_admin", label: "Super Admin", description: "Accès complet et gestion des accès." },
  {
    key: "catalog_manager",
    label: "Gestionnaire catalogue",
    description: "Produits, catégories, attributs et stock.",
  },
  { key: "orders_manager", label: "Gestionnaire commandes", description: "Commandes et clients." },
  { key: "content_editor", label: "Éditeur contenu", description: "Homepage, pages et articles." },
  { key: "read_only", label: "Lecture seule", description: "Consultation sans mutation." },
];

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRoleId>("read_only");
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const { session } = useAdminAuthorization();
  const canDeleteMembers = session.roles.includes("super_admin");
  const params = useMemo(
    () => ({ page, pageSize: 20, ...(search.trim() ? { query: search.trim() } : {}) }),
    [page, search],
  );
  const query = useAdminUsersPage(params);
  const status = useAdminMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminRepositories.users.update(id, { isActive: active }),
    successMessage: "Statut utilisateur mis à jour.",
    invalidate: [],
    onSuccess: () => void query.refetch(),
  });
  const role = useAdminMutation({
    mutationFn: ({ id, value }: { id: string; value: AdminRoleId }) =>
      adminRepositories.users.update(id, { role: value }),
    successMessage: "Rôle attribué.",
    invalidate: [],
    onSuccess: () => void query.refetch(),
  });
  const revoke = useAdminMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) => {
      if (!("revokeRole" in adminRepositories.users) || !adminRepositories.users.revokeRole) {
        throw new Error("La révocation des rôles n’est pas disponible.");
      }
      return adminRepositories.users.revokeRole(id, value);
    },
    successMessage: "Rôle révoqué.",
    invalidate: [],
    onSuccess: () => void query.refetch(),
  });
  const invite = useAdminMutation({
    mutationFn: () =>
      adminRepositories.users.create({
        fullName: inviteName,
        email: inviteEmail,
        role: inviteRole,
        isActive: false,
      }),
    successMessage: "Invitation envoyée.",
    invalidate: [],
    onSuccess: () => {
      setInviteOpen(false);
      setInviteEmail("");
      setInviteName("");
      void query.refetch();
    },
  });
  const removeMember = useAdminMutation({
    mutationFn: (id: string) => adminRepositories.users.delete(id),
    successMessage: "Membre retiré de l’équipe.",
    invalidate: [],
    onSuccess: () => void query.refetch(),
  });
  const rows = query.data?.items ?? [];
  if (query.isLoading) return <AdminSkeleton rows={6} />;
  if (query.error)
    return (
      <AdminErrorState
        message={
          query.error instanceof Error
            ? query.error.message
            : "Impossible de charger les utilisateurs."
        }
        onRetry={() => void query.refetch()}
      />
    );
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Utilisateurs et rôles"
        description="Contrôlez les accès Admin, les statuts et les rôles attribués."
        breadcrumbs={[{ label: "Utilisateurs et rôles" }]}
        actions={
          <Button onClick={() => setInviteOpen((value) => !value)}>
            {inviteOpen ? "Fermer" : "Inviter un utilisateur"}
          </Button>
        }
      />
      {inviteOpen ? (
        <AdminCard className="grid gap-3 sm:grid-cols-[1fr_1fr_220px_auto] sm:items-end">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="invite-name">
              Nom
            </label>
            <Input
              id="invite-name"
              value={inviteName}
              onChange={(event) => setInviteName(event.target.value)}
              placeholder="Nom complet"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="invite-email">
              E-mail
            </label>
            <Input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="admin@exemple.tn"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="invite-role">
              Rôle
            </label>
            <select
              id="invite-role"
              className="h-10 w-full rounded-md border bg-background px-3"
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as AdminRoleId)}
            >
              {ROLES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            disabled={!inviteEmail || invite.isPending}
            onClick={() => invite.mutate(undefined)}
          >
            {invite.isPending ? "Envoi…" : "Envoyer"}
          </Button>
        </AdminCard>
      ) : null}
      <AdminCard className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Rechercher par nom ou e-mail"
            className="pl-9"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                <th className="px-3 py-3">Utilisateur</th>
                <th className="px-3 py-3">Statut</th>
                <th className="px-3 py-3">Rôles</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-3 py-4">
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="px-3 py-4">
                    <AdminStatusBadge
                      label={user.status ?? (user.isActive ? "active" : "suspended")}
                      tone={user.isActive ? "success" : "warning"}
                    />
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(user.roles ?? [user.role]).map((item) => (
                        <span key={item} className="inline-flex items-center gap-1">
                          <AdminStatusBadge
                            label={ROLES.find((candidate) => candidate.key === item)?.label ?? item}
                          />
                          {user.roles && user.roles.length > 1 ? (
                            <button
                              type="button"
                              className="text-xs text-muted-foreground hover:text-destructive"
                              aria-label={`Révoquer ${item}`}
                              onClick={() => revoke.mutate({ id: user.id, value: item })}
                            >
                              ×
                            </button>
                          ) : null}
                        </span>
                      ))}
                    </div>
                    <select
                      className="mt-2 h-9 rounded-md border bg-background px-2 text-xs"
                      value=""
                      onChange={(event) => {
                        if (event.target.value)
                          role.mutate({ id: user.id, value: event.target.value as AdminRoleId });
                      }}
                      disabled={role.isPending || user.status === "revoked"}
                    >
                      <option value="">Attribuer un rôle…</option>
                      {ROLES.filter((item) => !(user.roles ?? [user.role]).includes(item.key)).map(
                        (item) => (
                          <option key={item.key} value={item.key}>
                            {item.label}
                          </option>
                        ),
                      )}
                    </select>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {user.status === "revoked" ? (
                        <span className="self-center text-xs text-muted-foreground">
                          Accès révoqué
                        </span>
                      ) : user.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={status.isPending}
                          onClick={() => status.mutate({ id: user.id, active: false })}
                        >
                          <UserX className="mr-1.5 size-4" />
                          Suspendre
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={status.isPending}
                          onClick={() => status.mutate({ id: user.id, active: true })}
                        >
                          <UserCheck className="mr-1.5 size-4" />
                          Réactiver
                        </Button>
                      )}
                      {canDeleteMembers ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={
                            removeMember.isPending ||
                            user.id === session.user.id ||
                            user.status === "revoked"
                          }
                          title={
                            user.id === session.user.id
                              ? "Vous ne pouvez pas supprimer votre propre compte."
                              : user.status === "revoked"
                                ? "Ce membre a déjà été retiré de l’équipe."
                                : "Retirer ce membre de l’équipe"
                          }
                          onClick={() => setPendingDelete(user)}
                        >
                          <Trash2 className="mr-1.5 size-4" />
                          Supprimer
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Aucun utilisateur correspondant.
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
      <AdminCard>
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <div>
            <h2 className="font-semibold">Matrice des rôles</h2>
            <p className="text-sm text-muted-foreground">
              Les permissions sont définies côté API et ne sont pas modifiables depuis le
              navigateur.
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ROLES.map((item) => (
            <div key={item.key} className="rounded-lg border p-3">
              <p className="font-medium">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </AdminCard>
      <AdminConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Retirer ce membre de l’équipe ?"
        description={
          pendingDelete
            ? `« ${pendingDelete.fullName} » perdra définitivement son accès Admin et tous ses rôles seront révoqués. Son historique restera conservé pour l’audit.`
            : "Cette action révoque définitivement l’accès Admin du membre."
        }
        confirmLabel={removeMember.isPending ? "Suppression…" : "Supprimer le membre"}
        destructive
        onConfirm={() => {
          if (!pendingDelete) return;
          const id = pendingDelete.id;
          setPendingDelete(null);
          removeMember.mutate(id);
        }}
      />
    </div>
  );
}
