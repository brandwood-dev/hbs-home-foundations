import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckoutField, checkoutInputClass } from "@/components/checkout/CheckoutField";
import { MeasurementOptionGroup } from "@/components/measurement/MeasurementOptionGroup";
import { AppLink } from "@/components/ui/app-link";
import type {
  CustomOpeningInput,
  CustomQuoteProductType,
  CustomQuoteRequest,
  CustomQuoteSubmissionResult,
} from "@/domain/custom-quote/custom-quote.types";
import type { OpeningType } from "@/domain/measurement/measurement.types";
import { OPENING_TYPE_LABELS } from "@/domain/measurement/measurement.constants";
import { TUNISIA_GOVERNORATES } from "@/fixtures/tunisia-governorates.fixture";
import { trackEvent } from "@/lib/analytics/analytics";
import { getCustomQuoteRepository } from "@/repositories/repositoryFactory";
import {
  isValidTunisianPhone,
  normalizeTunisianPhone,
  TUNISIAN_PHONE_ERROR,
} from "@/services/checkout/phone-normalization";
import { parseCmInput } from "@/services/measurement/measurement-validation";

const PRODUCT_TYPES: { value: CustomQuoteProductType; label: string }[] = [
  { value: "rideaux", label: "Rideaux" },
  { value: "voilages", label: "Voilages" },
  { value: "stores", label: "Stores" },
  { value: "ensemble_fenetre", label: "Ensemble de la fenêtre" },
];

interface OpeningDraft {
  id: string;
  label: string;
  openingType: OpeningType;
  width: string;
  height: string;
  quantity: string;
}

/** Identifiants déterministes : indispensables pour une hydratation SSR stable. */
function newOpening(index: number): OpeningDraft {
  return {
    id: `ouverture-${index}`,
    label: `Ouverture ${index}`,
    openingType: "fenetre",
    width: "",
    height: "",
    quantity: "1",
  };
}

export function CustomQuoteForm() {
  const [productType, setProductType] = useState<CustomQuoteProductType>("rideaux");
  const [openings, setOpenings] = useState<OpeningDraft[]>([newOpening(1)]);
  const [notes, setNotes] = useState("");
  const [wantsAccessories, setWantsAccessories] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [preferredContact, setPreferredContact] = useState<"phone" | "whatsapp" | "email">("phone");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [attachments, setAttachments] = useState<
    { id: string; name: string; size: number; type: string }[]
  >([]);
  const [showErrors, setShowErrors] = useState(false);
  const [confirmation, setConfirmation] = useState<CustomQuoteSubmissionResult | null>(null);

  const errors = {
    openings: openings.some(
      (opening) => parseCmInput(opening.width) === null || parseCmInput(opening.height) === null,
    )
      ? "Renseignez une largeur et une hauteur en centimètres pour chaque ouverture."
      : null,
    firstName: firstName.trim().length < 2 ? "Indiquez votre prénom." : null,
    lastName: lastName.trim().length < 2 ? "Indiquez votre nom." : null,
    phone: isValidTunisianPhone(phone) ? null : TUNISIAN_PHONE_ERROR,
    email:
      email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? "Cette adresse e-mail semble incorrecte."
        : preferredContact === "email" && email.trim().length === 0
          ? "Indiquez une adresse e-mail pour être recontacté par e-mail."
          : null,
    governorate: governorate.length === 0 ? "Sélectionnez votre gouvernorat." : null,
    city: city.trim().length < 2 ? "Indiquez votre ville." : null,
    acceptedPrivacy: acceptedPrivacy
      ? null
      : "Vous devez accepter la politique de confidentialité.",
  };

  const isValid = Object.values(errors).every((error) => !error);

  const mutation = useMutation({
    mutationFn: (request: CustomQuoteRequest) => getCustomQuoteRepository().submit(request),
    onSuccess: (result) => {
      setConfirmation(result);
      trackEvent("generate_lead", { form: "custom_quote", productType });
      toast.success("Votre demande de devis a bien été enregistrée (démo).");
    },
    onError: () => {
      toast.error("L'envoi a échoué. Réessayez dans un instant.");
    },
  });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    const mappedOpenings: CustomOpeningInput[] = openings.map((opening) => ({
      id: opening.id,
      label: opening.label,
      openingType: opening.openingType,
      widthCm: parseCmInput(opening.width) ?? 0,
      heightCm: parseCmInput(opening.height) ?? 0,
      quantity: Math.max(1, Number(opening.quantity) || 1),
    }));

    mutation.mutate({
      productType,
      openings: mappedOpenings,
      preferences: {
        wantsAccessories,
        ...(notes.trim().length > 0 ? { notes: notes.trim() } : {}),
      },
      contact: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: normalizeTunisianPhone(phone),
        governorate,
        city: city.trim(),
        preferredContact,
        ...(email.trim().length > 0 ? { email: email.trim() } : {}),
      },
      attachmentMetadata: attachments,
      acceptedPrivacy,
    });
  };

  if (confirmation) {
    return (
      <section className="rounded-md border border-border p-6" aria-live="polite">
        <h2 className="text-2xl">Demande enregistrée</h2>
        <p className="mt-2 text-sm text-foreground-muted">
          Référence de suivi : <span className="font-semibold">{confirmation.reference}</span>.
          Notre atelier revient vers vous sous 48 heures ouvrées.
        </p>
        <p className="mt-2 text-xs text-foreground-muted">
          Démonstration : aucune donnée n'a été transmise ni conservée.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <AppLink
            href="/guide-des-mesures"
            className="inline-flex min-h-[48px] items-center rounded-sm border border-border px-5 text-sm hover:border-taupe"
          >
            Revoir le guide des mesures
          </AppLink>
          <AppLink
            href="/"
            className="inline-flex min-h-[48px] items-center rounded-sm bg-accent px-5 text-sm text-accent-foreground hover:bg-accent-dark"
          >
            Retour à l'accueil
          </AppLink>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-2xl">Votre projet</h2>
        <MeasurementOptionGroup
          legend="Que souhaitez-vous faire réaliser ?"
          name="type-produit"
          value={productType}
          onChange={setProductType}
          columns={2}
          options={PRODUCT_TYPES}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl">Vos ouvertures</h2>
          <button
            type="button"
            onClick={() =>
              setOpenings((list) => [
                ...list,
                newOpening(
                  list.reduce((max, item) => Math.max(max, Number(item.id.split("-")[1] ?? 0)), 0) +
                    1,
                ),
              ])
            }
            className="min-h-[44px] rounded-sm border border-border px-4 text-sm hover:border-taupe"
          >
            Ajouter une ouverture
          </button>
        </div>

        {errors.openings && showErrors ? (
          <p role="alert" className="text-xs text-destructive">
            {errors.openings}
          </p>
        ) : null}

        <div className="space-y-4">
          {openings.map((opening, index) => (
            <fieldset key={opening.id} className="rounded-md border border-border p-4">
              <legend className="px-1 text-sm font-medium">{opening.label}</legend>

              <div className="grid gap-4 sm:grid-cols-2">
                <CheckoutField id={`${opening.id}-type`} label="Type d'ouverture">
                  <select
                    id={`${opening.id}-type`}
                    className={checkoutInputClass}
                    value={opening.openingType}
                    onChange={(event) =>
                      setOpenings((list) =>
                        list.map((item) =>
                          item.id === opening.id
                            ? { ...item, openingType: event.target.value as OpeningType }
                            : item,
                        ),
                      )
                    }
                  >
                    {(Object.keys(OPENING_TYPE_LABELS) as OpeningType[]).map((value) => (
                      <option key={value} value={value}>
                        {OPENING_TYPE_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </CheckoutField>

                <CheckoutField id={`${opening.id}-quantity`} label="Nombre d'ouvertures identiques">
                  <input
                    id={`${opening.id}-quantity`}
                    inputMode="numeric"
                    className={checkoutInputClass}
                    value={opening.quantity}
                    onChange={(event) =>
                      setOpenings((list) =>
                        list.map((item) =>
                          item.id === opening.id ? { ...item, quantity: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </CheckoutField>

                <CheckoutField id={`${opening.id}-width`} label="Largeur (cm)">
                  <input
                    id={`${opening.id}-width`}
                    inputMode="decimal"
                    className={checkoutInputClass}
                    value={opening.width}
                    onChange={(event) =>
                      setOpenings((list) =>
                        list.map((item) =>
                          item.id === opening.id ? { ...item, width: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </CheckoutField>

                <CheckoutField id={`${opening.id}-height`} label="Hauteur (cm)">
                  <input
                    id={`${opening.id}-height`}
                    inputMode="decimal"
                    className={checkoutInputClass}
                    value={opening.height}
                    onChange={(event) =>
                      setOpenings((list) =>
                        list.map((item) =>
                          item.id === opening.id ? { ...item, height: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </CheckoutField>
              </div>

              {openings.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setOpenings((list) => list.filter((item) => item.id !== opening.id))
                  }
                  className="mt-3 min-h-[44px] text-sm text-foreground-muted underline hover:text-foreground"
                >
                  Retirer l'ouverture {index + 1}
                </button>
              )}
            </fieldset>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">Vos préférences</h2>

        <CheckoutField
          id="quote-notes"
          label="Précisions sur votre projet"
          optional
          hint="Matières, coloris, contraintes de pose, délais souhaités…"
        >
          <textarea
            id="quote-notes"
            rows={4}
            className="w-full rounded-sm border border-border bg-surface p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </CheckoutField>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={wantsAccessories}
            onChange={(event) => setWantsAccessories(event.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          Je souhaite aussi un devis pour les tringles, rails et accessoires de pose.
        </label>

        <CheckoutField
          id="quote-files"
          label="Photos de vos fenêtres"
          optional
          hint="Démonstration : seuls les noms de fichiers sont conservés localement, aucun envoi n'est réalisé."
        >
          <input
            id="quote-files"
            type="file"
            multiple
            accept="image/*"
            className="w-full text-sm"
            onChange={(event) =>
              setAttachments(
                Array.from(event.target.files ?? []).map((file, index) => ({
                  id: `${index}-${file.name}`,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                })),
              )
            }
          />
        </CheckoutField>
        {attachments.length > 0 && (
          <ul className="text-xs text-foreground-muted">
            {attachments.map((file) => (
              <li key={file.id}>· {file.name}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">Vos coordonnées</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <CheckoutField
            id="quote-firstname"
            label="Prénom"
            error={showErrors ? (errors.firstName ?? undefined) : undefined}
          >
            <input
              id="quote-firstname"
              className={checkoutInputClass}
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </CheckoutField>

          <CheckoutField
            id="quote-lastname"
            label="Nom"
            error={showErrors ? (errors.lastName ?? undefined) : undefined}
          >
            <input
              id="quote-lastname"
              className={checkoutInputClass}
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </CheckoutField>

          <CheckoutField
            id="quote-phone"
            label="Téléphone"
            hint="Format tunisien, par exemple 20 123 456."
            error={showErrors ? (errors.phone ?? undefined) : undefined}
          >
            <input
              id="quote-phone"
              inputMode="tel"
              autoComplete="tel"
              className={checkoutInputClass}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </CheckoutField>

          <CheckoutField
            id="quote-email"
            label="E-mail"
            optional
            error={showErrors ? (errors.email ?? undefined) : undefined}
          >
            <input
              id="quote-email"
              type="email"
              autoComplete="email"
              className={checkoutInputClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </CheckoutField>

          <CheckoutField
            id="quote-governorate"
            label="Gouvernorat"
            error={showErrors ? (errors.governorate ?? undefined) : undefined}
          >
            <select
              id="quote-governorate"
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

          <CheckoutField
            id="quote-city"
            label="Ville"
            error={showErrors ? (errors.city ?? undefined) : undefined}
          >
            <input
              id="quote-city"
              className={checkoutInputClass}
              autoComplete="address-level2"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </CheckoutField>
        </div>

        <MeasurementOptionGroup
          legend="Comment préférez-vous être recontacté ?"
          name="contact-prefere"
          value={preferredContact}
          onChange={setPreferredContact}
          options={[
            { value: "phone", label: "Téléphone" },
            { value: "whatsapp", label: "WhatsApp" },
            { value: "email", label: "E-mail" },
          ]}
        />

        <div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(event) => setAcceptedPrivacy(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
            />
            <span>
              J'accepte que mes informations soient utilisées pour traiter ma demande de devis,
              conformément à la{" "}
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
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="min-h-[48px] rounded-sm bg-accent px-6 text-sm text-accent-foreground hover:bg-accent-dark disabled:opacity-60"
        >
          {mutation.isPending ? "Envoi en cours…" : "Envoyer ma demande"}
        </button>
        <p className="text-xs text-foreground-muted">
          Réponse sous 48 heures ouvrées. Démonstration : aucune donnée n'est transmise.
        </p>
      </div>
    </form>
  );
}
