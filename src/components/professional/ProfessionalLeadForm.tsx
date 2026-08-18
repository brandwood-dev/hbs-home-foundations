import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckoutField, checkoutInputClass } from "@/components/checkout/CheckoutField";
import { AppLink } from "@/components/ui/app-link";
import type {
  ProfessionalActivity,
  ProfessionalLeadRequest,
  ProfessionalLeadSubmissionResult,
  ProfessionalProjectVolume,
} from "@/domain/professional/professional-lead.types";
import { TUNISIA_GOVERNORATES } from "@/fixtures/tunisia-governorates.fixture";
import { trackEvent } from "@/lib/analytics/analytics";
import { getProfessionalLeadRepository } from "@/repositories/repositoryFactory";
import {
  isValidTunisianPhone,
  normalizeTunisianPhone,
  TUNISIAN_PHONE_ERROR,
} from "@/services/checkout/phone-normalization";

const ACTIVITIES: { value: ProfessionalActivity; label: string }[] = [
  { value: "hotellerie", label: "Hôtellerie" },
  { value: "restauration", label: "Restauration" },
  { value: "bureaux", label: "Bureaux et tertiaire" },
  { value: "architecte", label: "Architecte" },
  { value: "decorateur", label: "Décorateur d'intérieur" },
  { value: "promoteur", label: "Promoteur immobilier" },
  { value: "commerce", label: "Commerce et retail" },
  { value: "autre", label: "Autre" },
];

const VOLUMES: { value: ProfessionalProjectVolume; label: string }[] = [
  { value: "moins_10", label: "Moins de 10 fenêtres" },
  { value: "10_50", label: "10 à 50 fenêtres" },
  { value: "50_200", label: "50 à 200 fenêtres" },
  { value: "plus_200", label: "Plus de 200 fenêtres" },
];

export function ProfessionalLeadForm() {
  const [companyName, setCompanyName] = useState("");
  const [activity, setActivity] = useState<ProfessionalActivity>("hotellerie");
  const [taxId, setTaxId] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [projectVolume, setProjectVolume] = useState<ProfessionalProjectVolume>("10_50");
  const [desiredDeadline, setDesiredDeadline] = useState("");
  const [message, setMessage] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [confirmation, setConfirmation] = useState<ProfessionalLeadSubmissionResult | null>(null);

  const errors = {
    companyName: companyName.trim().length < 2 ? "Indiquez le nom de votre structure." : null,
    contactName: contactName.trim().length < 2 ? "Indiquez le nom du contact." : null,
    phone: isValidTunisianPhone(phone) ? null : TUNISIAN_PHONE_ERROR,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? null
      : "Indiquez une adresse e-mail professionnelle valide.",
    governorate: governorate.length === 0 ? "Sélectionnez votre gouvernorat." : null,
    message: message.trim().length < 20 ? "Décrivez votre projet en quelques lignes." : null,
    acceptedPrivacy: acceptedPrivacy ? null : "Vous devez accepter la politique de confidentialité.",
  };

  const isValid = Object.values(errors).every((error) => !error);

  const mutation = useMutation({
    mutationFn: (request: ProfessionalLeadRequest) =>
      getProfessionalLeadRepository().submit(request),
    onSuccess: (result) => {
      setConfirmation(result);
      trackEvent("generate_lead", { form: "professional", activity, projectVolume });
      toast.success("Votre demande professionnelle a bien été enregistrée (démo).");
    },
    onError: () => toast.error("L'envoi a échoué. Réessayez dans un instant."),
  });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    mutation.mutate({
      companyName: companyName.trim(),
      activity,
      contactName: contactName.trim(),
      phone: normalizeTunisianPhone(phone),
      email: email.trim(),
      governorate,
      projectVolume,
      message: message.trim(),
      acceptedPrivacy,
      ...(taxId.trim().length > 0 ? { taxId: taxId.trim() } : {}),
      ...(city.trim().length > 0 ? { city: city.trim() } : {}),
      ...(desiredDeadline.trim().length > 0 ? { desiredDeadline: desiredDeadline.trim() } : {}),
    });
  };

  if (confirmation) {
    return (
      <section className="rounded-md border border-border p-6" aria-live="polite">
        <h2 className="text-2xl">Demande transmise</h2>
        <p className="mt-2 text-sm text-foreground-muted">
          Référence : <span className="font-semibold">{confirmation.reference}</span>. Un
          interlocuteur dédié vous contacte sous 48 heures ouvrées.
        </p>
        <p className="mt-2 text-xs text-foreground-muted">
          Démonstration : aucune donnée n'a été transmise ni conservée.
        </p>
        <AppLink
          href="/"
          className="mt-6 inline-flex min-h-[48px] items-center rounded-sm bg-accent px-5 text-sm text-accent-foreground hover:bg-accent-dark"
        >
          Retour à l'accueil
        </AppLink>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CheckoutField
          id="pro-company"
          label="Raison sociale"
          error={showErrors ? (errors.companyName ?? undefined) : undefined}
        >
          <input
            id="pro-company"
            className={checkoutInputClass}
            autoComplete="organization"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
          />
        </CheckoutField>

        <CheckoutField id="pro-activity" label="Secteur d'activité">
          <select
            id="pro-activity"
            className={checkoutInputClass}
            value={activity}
            onChange={(event) => setActivity(event.target.value as ProfessionalActivity)}
          >
            {ACTIVITIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </CheckoutField>

        <CheckoutField id="pro-taxid" label="Matricule fiscal" optional>
          <input
            id="pro-taxid"
            className={checkoutInputClass}
            value={taxId}
            onChange={(event) => setTaxId(event.target.value)}
          />
        </CheckoutField>

        <CheckoutField
          id="pro-contact"
          label="Nom du contact"
          error={showErrors ? (errors.contactName ?? undefined) : undefined}
        >
          <input
            id="pro-contact"
            className={checkoutInputClass}
            autoComplete="name"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
          />
        </CheckoutField>

        <CheckoutField
          id="pro-phone"
          label="Téléphone"
          error={showErrors ? (errors.phone ?? undefined) : undefined}
        >
          <input
            id="pro-phone"
            inputMode="tel"
            autoComplete="tel"
            className={checkoutInputClass}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </CheckoutField>

        <CheckoutField
          id="pro-email"
          label="E-mail professionnel"
          error={showErrors ? (errors.email ?? undefined) : undefined}
        >
          <input
            id="pro-email"
            type="email"
            autoComplete="email"
            className={checkoutInputClass}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </CheckoutField>

        <CheckoutField
          id="pro-governorate"
          label="Gouvernorat"
          error={showErrors ? (errors.governorate ?? undefined) : undefined}
        >
          <select
            id="pro-governorate"
            className={checkoutInputClass}
            value={governorate}
            onChange={(event) => setGovernorate(event.target.value)}
          >
            <option value="">Sélectionnez…</option>
            {TUNISIA_GOVERNORATES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </CheckoutField>

        <CheckoutField id="pro-city" label="Ville" optional>
          <input
            id="pro-city"
            className={checkoutInputClass}
            autoComplete="address-level2"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
        </CheckoutField>

        <CheckoutField id="pro-volume" label="Volume estimé">
          <select
            id="pro-volume"
            className={checkoutInputClass}
            value={projectVolume}
            onChange={(event) =>
              setProjectVolume(event.target.value as ProfessionalProjectVolume)
            }
          >
            {VOLUMES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </CheckoutField>

        <CheckoutField
          id="pro-deadline"
          label="Échéance souhaitée"
          optional
          hint="Par exemple : livraison avant juin."
        >
          <input
            id="pro-deadline"
            className={checkoutInputClass}
            value={desiredDeadline}
            onChange={(event) => setDesiredDeadline(event.target.value)}
          />
        </CheckoutField>
      </div>

      <CheckoutField
        id="pro-message"
        label="Votre projet"
        error={showErrors ? (errors.message ?? undefined) : undefined}
      >
        <textarea
          id="pro-message"
          rows={5}
          className="w-full rounded-sm border border-border bg-surface p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </CheckoutField>

      <div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={acceptedPrivacy}
            onChange={(event) => setAcceptedPrivacy(event.target.checked)}
            className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
          />
          <span>
            J'accepte que mes informations soient utilisées pour traiter ma demande, conformément à
            la{" "}
            <AppLink href="/confidentialite" className="underline">
              politique de confidentialité
            </AppLink>
            .
          </span>
        </label>
        {showErrors && errors.acceptedPrivacy ? (
          <p role="alert" className="mt-1 text-xs text-destructive">
            {errors.acceptedPrivacy}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="min-h-[48px] rounded-sm bg-accent px-6 text-sm text-accent-foreground hover:bg-accent-dark disabled:opacity-60"
      >
        {mutation.isPending ? "Envoi en cours…" : "Demander un contact professionnel"}
      </button>
    </form>
  );
}
