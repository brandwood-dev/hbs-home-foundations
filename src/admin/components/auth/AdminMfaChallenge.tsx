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

const MFA_FRIENDLY_NAME = "HBS HOME Admin";

// Enrollment is a remote mutation. Keep one initialization promise per client
// so a remount or a concurrent auth-state update cannot create the same factor
// twice (Supabase rejects duplicate friendly names).
const factorInitialization = new WeakMap<SupabaseClient, Promise<FactorState>>();

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function isDuplicateFactorError(reason: unknown): boolean {
  return (
    reason instanceof Error &&
    /friendly name/i.test(reason.message) &&
    /already exists/i.test(reason.message)
  );
}

async function prepareFactor(client: SupabaseClient): Promise<FactorState> {
  const existingInitialization = factorInitialization.get(client);
  if (existingInitialization) return existingInitialization;

  const initialization = (async () => {
    const { data: factors, error: factorsError } = await client.auth.mfa.listFactors();
    if (factorsError) throw factorsError;

    const verified = factors.totp.find((item) => item.status === "verified");
    if (verified) return { id: verified.id, qrCode: null, secret: null };

    // An interrupted enrollment leaves an unverified factor behind. Remove it
    // before creating a fresh one so the QR code shown to the user is always
    // backed by the factor that will be verified.
    for (const staleFactor of factors.totp.filter((item) => item.status !== "verified")) {
      const { error: unenrollError } = await client.auth.mfa.unenroll({
        factorId: staleFactor.id,
      });
      if (unenrollError) throw unenrollError;
    }
    if (factors.totp.some((item) => item.status !== "verified")) await wait(250);

    const enroll = async () => {
      const { data: enrollment, error: enrollmentError } = await client.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: MFA_FRIENDLY_NAME,
      });
      if (enrollmentError) throw enrollmentError;
      return {
        id: enrollment.id,
        qrCode: enrollment.totp.qr_code,
        secret: enrollment.totp.secret,
      };
    };

    try {
      return await enroll();
    } catch (reason) {
      // If another request won the race, clean up its unverified factor and
      // retry once. This also recovers accounts left in the failed state by an
      // earlier version of the flow.
      if (!isDuplicateFactorError(reason)) throw reason;
      const { data: retryFactors, error: retryFactorsError } = await client.auth.mfa.listFactors();
      if (retryFactorsError) throw retryFactorsError;
      const retryVerified = retryFactors.totp.find((item) => item.status === "verified");
      if (retryVerified) return { id: retryVerified.id, qrCode: null, secret: null };
      for (const staleFactor of retryFactors.totp.filter((item) => item.status !== "verified")) {
        const { error: unenrollError } = await client.auth.mfa.unenroll({
          factorId: staleFactor.id,
        });
        if (unenrollError) throw unenrollError;
      }
      await wait(300);
      return enroll();
    }
  })();

  const retryableInitialization = initialization.catch((reason: unknown) => {
    factorInitialization.delete(client);
    throw reason;
  });
  factorInitialization.set(client, retryableInitialization);
  return retryableInitialization;
}

export function AdminMfaChallenge({
  client,
  onVerified,
  onCancelled,
}: {
  client: SupabaseClient;
  onVerified: () => Promise<void>;
  onCancelled?: () => void;
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
        const preparedFactor = await prepareFactor(client);
        if (active) setFactor(preparedFactor);
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
      factorInitialization.delete(client);
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
      title="Vérification de sécurité"
      description="Une vérification supplémentaire est requise pour cette action d’administration."
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
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {onCancelled ? (
              <Button type="button" variant="outline" onClick={onCancelled} disabled={submitting}>
                Annuler
              </Button>
            ) : null}
            <Button type="submit" disabled={submitting || code.length !== 6}>
              {submitting ? "Vérification…" : "Vérifier et continuer"}
            </Button>
          </div>
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
