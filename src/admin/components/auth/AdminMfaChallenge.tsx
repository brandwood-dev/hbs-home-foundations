import { useEffect, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { AdminAuthPage } from "./AdminAuthPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FactorState {
  id: string;
  qrCode: string | null;
  secret: string | null;
}

export function AdminMfaChallenge({
  client,
  onVerified,
}: {
  client: SupabaseClient;
  onVerified: () => Promise<void>;
}) {
  const [factor, setFactor] = useState<FactorState | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data: factors, error: factorsError } = await client.auth.mfa.listFactors();
        if (factorsError) throw factorsError;
        const verified = factors.totp.find((item) => item.status === "verified");
        if (verified) {
          if (active) setFactor({ id: verified.id, qrCode: null, secret: null });
          return;
        }

        for (const staleFactor of factors.totp.filter((item) => item.status !== "verified")) {
          await client.auth.mfa.unenroll({ factorId: staleFactor.id });
        }

        const { data: enrollment, error: enrollmentError } = await client.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "HBS HOME Admin",
        });
        if (enrollmentError) throw enrollmentError;
        if (active) {
          setFactor({
            id: enrollment.id,
            qrCode: enrollment.totp.qr_code,
            secret: enrollment.totp.secret,
          });
        }
      } catch (reason) {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Impossible d’initialiser le MFA.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [client]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!factor || !/^\d{6}$/.test(code)) return;
    setSubmitting(true);
    setError(null);
    try {
      const { data: challenge, error: challengeError } = await client.auth.mfa.challenge({
        factorId: factor.id,
      });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await client.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) throw verifyError;
      await onVerified();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Le code TOTP est invalide.");
      setCode("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminAuthPage
      title="Vérification en deux étapes"
      description="Le MFA TOTP est obligatoire pour accéder au back-office HBS HOME."
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" /> Préparation de la vérification…
        </div>
      ) : factor ? (
        <form className="space-y-5" onSubmit={submit}>
          {factor.qrCode ? (
            <div className="space-y-3 rounded-lg border border-border bg-background p-4 text-center">
              <p className="text-sm font-medium">1. Scannez ce QR code avec votre application</p>
              <img
                src={factor.qrCode}
                alt="QR code de configuration TOTP"
                className="mx-auto size-44 rounded bg-white p-2"
              />
              {factor.secret ? (
                <details className="text-left text-xs text-muted-foreground">
                  <summary className="cursor-pointer">Saisie manuelle</summary>
                  <code className="mt-2 block break-all rounded bg-muted p-2">{factor.secret}</code>
                </details>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <ShieldCheck className="size-4" /> Votre authentificateur est déjà configuré.
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="totp-code">Code à 6 chiffres</Label>
            <Input
              id="totp-code"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              required
              autoFocus
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <Button className="w-full" type="submit" disabled={submitting || code.length !== 6}>
            {submitting ? "Vérification…" : "Vérifier et continuer"}
          </Button>
        </form>
      ) : (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error ?? "Aucun facteur TOTP n’a pu être préparé."}
        </div>
      )}
    </AdminAuthPage>
  );
}
