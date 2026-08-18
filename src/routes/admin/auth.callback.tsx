import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
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

  if (auth.status === "loading") {
    return (
      <AdminAuthPage title="Activation du compte" description="Validation du lien d’invitation…">
        <p className="text-sm text-muted-foreground">Veuillez patienter.</p>
      </AdminAuthPage>
    );
  }
  if (auth.status === "unauthenticated") return <Navigate to="/admin/connexion" replace />;

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
      await auth.updatePassword(password);
      await navigate({ to: "/admin" });
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Le mot de passe n’a pas pu être défini.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminAuthPage
      title="Activez votre compte Admin"
      description="Définissez un mot de passe fort. Le MFA sera configuré à l’étape suivante."
    >
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
          {submitting ? "Activation…" : "Activer et configurer le MFA"}
        </Button>
      </form>
    </AdminAuthPage>
  );
}
