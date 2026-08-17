import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { CheckoutFormInput } from "@/domain/checkout/checkout.schemas";
import { AppLink } from "@/components/ui/app-link";

export function CheckoutPaymentSection({
  register,
  errors,
}: {
  register: UseFormRegister<CheckoutFormInput>;
  errors: FieldErrors<CheckoutFormInput>;
}) {
  return (
    <section aria-labelledby="checkout-payment" className="space-y-4">
      <h2 id="checkout-payment" className="text-xl">
        3. Paiement
      </h2>

      <label className="flex gap-3 rounded-sm border border-accent bg-surface-muted p-4">
        <input
          type="radio"
          value="cash_on_delivery"
          className="mt-1 accent-[var(--color-accent)]"
          {...register("paymentMethod")}
        />
        <span>
          <span className="block text-sm font-medium">Paiement à la livraison</span>
          <span className="block text-xs text-foreground-muted">
            Vous réglez en espèces au moment de la réception. Aucun paiement en ligne n'est demandé.
          </span>
        </span>
      </label>

      <div className="space-y-1.5">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-[var(--color-accent)]"
            aria-invalid={errors.acceptedTerms ? true : undefined}
            {...register("acceptedTerms")}
          />
          <span>
            J'accepte les{" "}
            <AppLink href="/cgv" className="underline underline-offset-4">
              conditions générales de vente
            </AppLink>{" "}
            et la{" "}
            <AppLink href="/confidentialite" className="underline underline-offset-4">
              politique de confidentialité
            </AppLink>
            .
          </span>
        </label>
        {errors.acceptedTerms ? (
          <p role="alert" className="text-xs text-destructive">
            {errors.acceptedTerms.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
