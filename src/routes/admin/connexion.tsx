import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/admin/auth/AdminAuthProvider";
import { AdminAuthPage } from "@/admin/components/auth/AdminAuthPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion Admin — HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const auth = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (auth.status === "authenticated") return <Navigate to="/admin" replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await auth.signIn(email, password);
      await navigate({ to: "/admin" });
    } catch {
      setError("E-mail ou mot de passe incorrect, ou compte non encore activé.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminAuthPage
      title="Connexion au back-office"
      description="Accès réservé aux administrateurs HBS HOME invités."
    >
      <form className="space-y-4" onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="admin-email">Adresse e-mail</Label>
          <Input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Mot de passe</Label>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={submitting || auth.status === "loading"}>
          {submitting ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
    </AdminAuthPage>
  );
}
