import { Navigate, useRouterState } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { HbsApiClient, HbsApiError, type ApiAdminSession } from "@/api";
import { useAdminAuth } from "@/admin/auth/AdminAuthProvider";
import { AdminAuthorizationProvider } from "@/admin/auth/AdminAuthorizationContext";
import { AdminAuthPage } from "./AdminAuthPage";
import { Button } from "@/components/ui/button";

type ApiState =
  | { status: "loading" }
  | { status: "ready"; session: ApiAdminSession }
  | { status: "error"; message: string; code: string | null };

export function AdminAccessGate({ children }: { children: ReactNode }) {
  const auth = useAdminAuth();
  const { refreshSession } = auth;
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const api = useMemo(() => new HbsApiClient(), []);
  const [attempt, setAttempt] = useState(0);
  const [apiState, setApiState] = useState<ApiState>({ status: "loading" });
  // A Supabase TOKEN_REFRESHED event replaces the session object while the
  // authenticated user remains the same. Keep the current Admin tree mounted
  // during that background validation so active forms are not destroyed.
  const lastValidatedUserIdRef = useRef<string | null>(null);
  // A migrated or expired browser session can be rejected by the API even
  // though Supabase still exposes it locally. Attempt one refresh per user.
  // Never clear the local session automatically: duplicate browser windows
  // share storage, and one window's transient refresh failure must not sign
  // the other window out as well.
  const refreshAttemptedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!auth.session) {
      lastValidatedUserIdRef.current = null;
      refreshAttemptedForUserRef.current = null;
      setApiState({ status: "loading" });
      return;
    }
    const controller = new AbortController();
    const userId = auth.session.user.id;
    const sameValidatedUser = lastValidatedUserIdRef.current === auth.session.user.id;
    if (!sameValidatedUser) setApiState({ status: "loading" });
    void api
      .getAdminSession(auth.session.access_token, controller.signal)
      .then((session) => {
        if (controller.signal.aborted) return;
        lastValidatedUserIdRef.current = auth.session?.user.id ?? null;
        setApiState({ status: "ready", session });
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        lastValidatedUserIdRef.current = null;
        const invalidToken =
          reason instanceof HbsApiError && reason.problem?.code === "INVALID_ACCESS_TOKEN";
        if (invalidToken && refreshAttemptedForUserRef.current !== userId) {
          refreshAttemptedForUserRef.current = userId;
          void refreshAdminSessionWithRetry(refreshSession)
            .then(() => {
              if (!controller.signal.aborted) setAttempt((value) => value + 1);
            })
            .catch(() => {
              if (controller.signal.aborted) return;
              // Keep the session in place so another tab can finish its
              // refresh and propagate the new session through storage.
              // Reset the guard to let the visible retry button try again.
              refreshAttemptedForUserRef.current = null;
              setApiState({
                status: "error",
                message:
                  "La session Admin n’a pas pu être actualisée. Une autre fenêtre vient peut-être de renouveler la session ; cliquez sur Réessayer.",
                code: "INVALID_ACCESS_TOKEN",
              });
            });
          return;
        }
        setApiState({
          status: "error",
          message:
            reason instanceof Error
              ? reason.message
              : "Impossible de vérifier les autorisations Admin.",
          code: reason instanceof HbsApiError ? (reason.problem?.code ?? null) : null,
        });
      });
    return () => controller.abort();
  }, [api, attempt, auth.session, refreshSession]);

  if (auth.status === "loading") return <AdminGateLoading />;
  if (auth.status === "unconfigured") {
    return (
      <AdminAuthPage
        title="Configuration Admin indisponible"
        description="Les variables publiques Supabase de cet environnement ne sont pas configurées."
      >
        <p className="text-sm text-muted-foreground">
          Aucun accès au back-office n’est autorisé tant que cette configuration manque.
        </p>
      </AdminAuthPage>
    );
  }
  if (auth.status === "unauthenticated" || !auth.session) {
    return <Navigate to="/admin/connexion" replace />;
  }
  if (apiState.status === "loading") return <AdminGateLoading />;
  if (apiState.status === "error") {
    const denied = apiState.code === "ADMIN_ACCESS_DENIED";
    return (
      <AdminAuthPage
        title={denied ? "Accès refusé" : "Vérification impossible"}
        description={
          denied
            ? "Ce compte n’est pas autorisé dans le back-office HBS HOME."
            : "L’API n’a pas pu valider votre session Admin."
        }
      >
        <div className="space-y-4">
          <p role="alert" className="text-sm text-red-700">
            {apiState.message}
          </p>
          {apiState.code === "NOT_FOUND" ? (
            <p className="text-xs text-muted-foreground">
              Vérifiez que <code>VITE_HBS_API_BASE_URL</code> est bien l’URL racine de l’API (ex:{" "}
              <code>https://api-preview.hbs-home.com</code>) et ne contient pas de suffixe{" "}
              <code>/api</code>.
            </p>
          ) : null}
          <div className="flex gap-2">
            {!denied ? (
              <Button onClick={() => setAttempt((value) => value + 1)}>Réessayer</Button>
            ) : null}
            <Button variant="outline" onClick={() => void auth.signOut()}>
              Se déconnecter
            </Button>
          </div>
        </div>
      </AdminAuthPage>
    );
  }
  const requiredPermission = permissionForPath(pathname);
  if (requiredPermission && !apiState.session.permissions.includes(requiredPermission)) {
    return (
      <AdminAuthPage
        title="Permission insuffisante"
        description="Votre rôle Admin ne permet pas d’ouvrir ce module."
      >
        <Button variant="outline" onClick={() => window.history.back()}>
          Revenir à la page précédente
        </Button>
      </AdminAuthPage>
    );
  }

  const authorizedTree = (
    <AdminAuthorizationProvider session={apiState.session}>{children}</AdminAuthorizationProvider>
  );

  // Admin access is intentionally password-only. The former MFA provider
  // rendered a QR/TOTP step-up challenge whenever an API response contained
  // MFA_REQUIRED, which made the back-office unusable even with MFA disabled
  // in the API environment. Keep the authorized tree mounted directly; the
  // API feature flag remains the single source of truth for any future policy.
  return authorizedTree;
}

async function refreshAdminSessionWithRetry(refreshSession: () => Promise<void>): Promise<void> {
  try {
    await refreshSession();
    return;
  } catch (firstError) {
    // Two windows can briefly observe the same refresh token while the other
    // window is rotating it. Give Supabase's cross-tab storage event time to
    // publish the new session before attempting one final refresh.
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    try {
      await refreshSession();
      return;
    } catch {
      throw firstError;
    }
  }
}

function permissionForPath(pathname: string): string | null {
  if (pathname === "/admin" || pathname === "/admin/") return "admin.session_read";
  if (pathname.startsWith("/admin/produits")) return "products.read";
  if (pathname.startsWith("/admin/categories") || pathname.startsWith("/admin/attributs")) {
    return "categories.read";
  }
  if (pathname.startsWith("/admin/stock")) return "inventory.read";
  if (pathname.startsWith("/admin/commandes")) return "orders.read";
  if (pathname.startsWith("/admin/clients")) return "customers.read";
  if (pathname.startsWith("/admin/medias")) return "media.read";
  if (pathname.startsWith("/admin/contenu/pages")) return "content.read";
  if (pathname.startsWith("/admin/contenu/articles")) return "content.read";
  if (pathname.startsWith("/admin/contenu/accueil")) return "content.read";
  return null;
}

function AdminGateLoading() {
  return (
    <main className="admin-theme flex min-h-screen items-center justify-center bg-background">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" /> Vérification de l’accès Admin…
      </p>
    </main>
  );
}
