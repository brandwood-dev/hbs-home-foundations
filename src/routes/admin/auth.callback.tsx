import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useAdminAuth } from "@/admin/auth/AdminAuthProvider";
import { AdminAuthPage } from "@/admin/components/auth/AdminAuthPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/auth/callback")({
  head: () => ({
    meta: [
      { title: "Activation Admin — HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminInviteCallbackPage,
});

type AuthCallbackParams =
  { kind: "code"; code: string } | { kind: "tokens"; accessToken: string; refreshToken: string };

type SessionRestoreResult = { success: true } | { success: false; message: string };

function validPassword(password: string): boolean {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function AdminInviteCallbackPage() {
  const auth = useAdminAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);
  const [restoringSession, setRestoringSession] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const restoreAttempted = useRef(false);

  const authFlow =
    typeof window === "undefined"
      ? null
      : (() => {
          const hashType = new URLSearchParams(window.location.hash.slice(1)).get("type");
          if (hashType) return hashType;
          return new URLSearchParams(window.location.search).get("type");
        })();

  const hasAuthHash =
    typeof window !== "undefined" &&
    window.location.hash.includes("access_token=") &&
    window.location.hash.includes("refresh_token=");
  const hasAuthCode =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("code");
  const hasAuthLink = hasAuthHash || hasAuthCode;

  const isRecoveryFlow = authFlow === "recovery";
  const hasInvitationFlow =
    authFlow === "signup" || authFlow === "invite" || authFlow === "magiclink";
  const hasAuthFlow = isRecoveryFlow || hasInvitationFlow;

  const getAuthParamsFromLocation = useCallback((): AuthCallbackParams | null => {
    if (typeof window === "undefined") return null;
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    if (code) return { kind: "code", code };

    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    if (!accessToken || !refreshToken) return null;

    return { kind: "tokens", accessToken, refreshToken };
  }, []);

  const stripAuthTokensFromUrl = useCallback(() => {
    if (typeof window === "undefined") return;
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  const setSessionFromAuthLink = useCallback(async (): Promise<SessionRestoreResult> => {
    if (!auth.client) return { success: false, message: "Client Auth indisponible." };

    const params = getAuthParamsFromLocation();
    if (!params) {
      return { success: false, message: "Aucun token de reset détecté dans le lien." };
    }

    if (params.kind === "code") {
      const { error } = await auth.client.auth.exchangeCodeForSession(params.code);
      if (error) {
        return {
          success: false,
          message:
            "Le lien de réinitialisation a expiré ou n’est pas valide. Demandez un nouveau lien.",
        };
      }
    } else {
      const { data, error } = await auth.client.auth.setSession({
        access_token: params.accessToken,
        refresh_token: params.refreshToken,
      });
      if (error) {
        return {
          success: false,
          message:
            "Le lien de réinitialisation a expiré ou n’est pas valide. Demandez un nouveau lien.",
        };
      }

      if (!data.session) {
        return {
          success: false,
          message:
            "La session de réinitialisation n’a pas pu être activée. Demandez un nouveau lien.",
        };
      }
    }

    // Rafraîchit la session pour valider que le token restauré est bien actif.
    try {
      const refresh = await auth.client.auth.refreshSession();
      if (refresh.data.session) {
        return { success: true };
      }
    } catch {
      // Certains flux de reprise peuvent ne pas émettre de refresh token immédiatement.
      // On retombe sur getSession pour lire l'état réel côté client.
    }

    const { data } = await auth.client.auth.getSession();
    if (!data.session) {
      return {
        success: false,
        message: "La session n’a pas pu être rétablie. Demandez un nouveau lien de reset.",
      };
    }

    return { success: true };
  }, [auth.client, getAuthParamsFromLocation]);

  const restoreSessionFromAuthLink = useCallback(async () => {
    const result = await setSessionFromAuthLink();
    if (!result.success) {
      setRestoreError(result.message);
      setError(result.message);
      return false;
    }

    setRestoreError(null);
    setError(null);
    return true;
  }, [setSessionFromAuthLink]);

  const ensureSessionForReset = useCallback(async () => {
    if (!auth.client) return false;

    const current = await auth.client.auth.getSession();
    if (current.data.session) {
      const user = await auth.client.auth.getUser();
      if (user.data.user) return true;
    }

    return restoreSessionFromAuthLink();
  }, [auth.client, restoreSessionFromAuthLink]);

  useEffect(() => {
    if (auth.status === "loading" || auth.status === "unconfigured" || !hasAuthLink) return;
    // The provider restores the URL once. Only fall back to this component
    // when no session exists, and never replay the same recovery link when
    // the provider emits an auth-state change.
    if (auth.session || restoreAttempted.current) return;
    restoreAttempted.current = true;

    let cancelled = false;
    setRestoringSession(true);
    void (async () => {
      const restored = await restoreSessionFromAuthLink();
      if (cancelled) return;
      if (!restored && restoreError) {
        setError(restoreError);
      }
      setRestoringSession(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [auth.status, auth.session, hasAuthLink, restoreError, restoreSessionFromAuthLink]);

  if (auth.status === "loading") {
    return (
      <AdminAuthPage title="Validation du lien" description="Veuillez patienter.">
        <p className="text-sm text-muted-foreground">Veuillez patienter.</p>
      </AdminAuthPage>
    );
  }

  if (auth.status === "unconfigured") {
    return (
      <AdminAuthPage
        title="Configuration indisponible"
        description="Le module Auth n’est pas configuré pour cet environnement."
      >
        <p className="text-sm text-muted-foreground">
          Vérifiez `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` sur la version déployée,
          puis rechargez ce lien.
        </p>
      </AdminAuthPage>
    );
  }

  if (restoringSession) {
    return (
      <AdminAuthPage title="Validation du lien" description="Restauration de la session en cours.">
        <p className="text-sm text-muted-foreground">Veuillez patienter.</p>
      </AdminAuthPage>
    );
  }

  if (restoreError && !auth.session) {
    return (
      <AdminAuthPage
        title="Lien invalide"
        description="Impossible de valider ce lien de réinitialisation."
      >
        <p className="text-sm text-red-700">{restoreError}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Demandez un nouveau lien depuis l’écran d’administration.
        </p>
      </AdminAuthPage>
    );
  }

  if (resetDone) {
    return (
      <AdminAuthPage
        title="Mot de passe mis à jour"
        description="Votre mot de passe admin a bien été réinitialisé."
      >
        <p className="text-sm text-muted-foreground">
          Le reset est terminé. Connectez-vous de nouveau pour accéder au back-office.
        </p>
        <Button
          className="mt-4 w-full"
          onClick={async () => {
            try {
              await auth.signOut();
            } finally {
              await navigate({ to: "/admin/connexion" });
            }
          }}
        >
          Aller à la connexion
        </Button>
      </AdminAuthPage>
    );
  }

  if (auth.status === "unauthenticated" && !hasAuthLink && !hasInvitationFlow) {
    return <Navigate to="/admin/connexion" replace />;
  }

  if (!hasAuthLink && !isRecoveryFlow && !hasInvitationFlow && !auth.session) {
    return (
      <AdminAuthPage
        title="Lien invalide"
        description="Ce lien d’activation est invalide ou expiré."
      >
        <p className="text-sm text-muted-foreground">
          Demandez une nouvelle invitation depuis l’interface admin.
        </p>
      </AdminAuthPage>
    );
  }

  const isRecovery = isRecoveryFlow || hasAuthCode;
  const title = isRecovery ? "Réinitialisation du mot de passe" : "Activez votre compte Admin";
  const description = isRecovery
    ? "Créez un nouveau mot de passe fort pour retrouver l’accès."
    : "Définissez un mot de passe fort. Le MFA sera configuré à l’étape suivante.";
  const submitLabel = isRecovery
    ? "Réinitialiser mon mot de passe"
    : "Activer et configurer le MFA";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validPassword(password)) {
      setError("Utilisez au moins 12 caractères avec majuscule, minuscule, chiffre et symbole.");
      return;
    }

    if (password !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const ready = await ensureSessionForReset();
      if (!ready) {
        setSubmitting(false);
        return;
      }

      try {
        await auth.updatePassword(password);
        setResetDone(true);
        stripAuthTokensFromUrl();
        return;
      } catch (reason) {
        const rawMessage =
          reason instanceof Error ? reason.message : "Le mot de passe n’a pas pu être défini.";
        if (rawMessage === "Auth session missing!") {
          const restored = await restoreSessionFromAuthLink();
          if (!restored) throw reason;

          const readyAfterRestore = await ensureSessionForReset();
          if (!readyAfterRestore) throw reason;

          await auth.updatePassword(password);
          stripAuthTokensFromUrl();
          setResetDone(true);
          return;
        }
        throw reason;
      }
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Le mot de passe n’a pas pu être défini.";
      if (message === "Auth session missing!") {
        setError(
          "La session n’est pas disponible. Rechargez le lien ou demandez un nouveau reset.",
        );
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminAuthPage title={title} description={description}>
      <form className="space-y-4" onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="new-password">Nouveau mot de passe</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={12}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            minLength={12}
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Minimum 12 caractères, avec une majuscule, une minuscule, un chiffre et un symbole.
        </p>
        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? (isRecovery ? "Réinitialisation…" : "Activation…") : submitLabel}
        </Button>
      </form>
    </AdminAuthPage>
  );
}
