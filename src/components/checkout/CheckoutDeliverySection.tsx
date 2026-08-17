import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { CheckoutField, checkoutInputClass } from "@/components/checkout/CheckoutField";
import type { CheckoutFormInput } from "@/domain/checkout/checkout.schemas";
import type { DeliveryMethod } from "@/domain/checkout/checkout.types";
import { storeConfig } from "@/config/store.config";
import { TUNISIA_GOVERNORATES } from "@/fixtures/tunisia-governorates.fixture";
import { formatMoney } from "@/lib/money/money";

const optionClass =
  "flex cursor-pointer gap-3 rounded-sm border p-4 text-left transition-colors hover:bg-surface-muted";

export function CheckoutDeliverySection({
  register,
  errors,
  deliveryMethod,
  shippingMinor,
}: {
  register: UseFormRegister<CheckoutFormInput>;
  errors: FieldErrors<CheckoutFormInput>;
  deliveryMethod: DeliveryMethod;
  shippingMinor: number;
}) {
  const address = errors.shippingAddress;

  return (
    <section aria-labelledby="checkout-delivery" className="space-y-4">
      <h2 id="checkout-delivery" className="text-xl">
        2. Mode de livraison
      </h2>

      <fieldset className="space-y-3">
        <legend className="sr-only">Choisissez un mode de livraison</legend>

        <label
          className={`${optionClass} ${deliveryMethod === "home_delivery" ? "border-accent bg-surface-muted" : "border-border"}`}
        >
          <input
            type="radio"
            value="home_delivery"
            className="mt-1 accent-[var(--color-accent)]"
            {...register("deliveryMethod")}
          />
          <span>
            <span className="block text-sm font-medium">Livraison à domicile</span>
            <span className="block text-xs text-foreground-muted">
              Partout en Tunisie sous {storeConfig.estimatedDeliveryLabel} —{" "}
              {shippingMinor === 0 ? "offerte" : formatMoney(shippingMinor)}.
            </span>
          </span>
        </label>

        {storeConfig.storePickupEnabled ? (
          <label
            className={`${optionClass} ${deliveryMethod === "store_pickup" ? "border-accent bg-surface-muted" : "border-border"}`}
          >
            <input
              type="radio"
              value="store_pickup"
              className="mt-1 accent-[var(--color-accent)]"
              {...register("deliveryMethod")}
            />
            <span>
              <span className="block text-sm font-medium">Retrait en magasin — gratuit</span>
              <span className="block text-xs text-foreground-muted">
                {storeConfig.storeAddress}. Nous vous appelons dès que votre commande est prête.
              </span>
            </span>
          </label>
        ) : null}
      </fieldset>

      {deliveryMethod === "home_delivery" ? (
        <div className="space-y-4 rounded-sm border border-border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <CheckoutField
              id="governorate"
              label="Gouvernorat"
              error={address?.governorate?.message}
            >
              <select
                id="governorate"
                aria-invalid={address?.governorate ? true : undefined}
                className={checkoutInputClass}
                {...register("shippingAddress.governorate")}
              >
                <option value="">Sélectionner…</option>
                {TUNISIA_GOVERNORATES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </CheckoutField>

            <CheckoutField id="city" label="Ville / délégation" error={address?.city?.message}>
              <input
                id="city"
                autoComplete="address-level2"
                maxLength={80}
                aria-invalid={address?.city ? true : undefined}
                className={checkoutInputClass}
                {...register("shippingAddress.city")}
              />
            </CheckoutField>
          </div>

          <CheckoutField
            id="addressLine"
            label="Adresse"
            hint="Rue, immeuble, étage, appartement."
            error={address?.addressLine?.message}
          >
            <input
              id="addressLine"
              autoComplete="street-address"
              maxLength={200}
              aria-invalid={address?.addressLine ? true : undefined}
              className={checkoutInputClass}
              {...register("shippingAddress.addressLine")}
            />
          </CheckoutField>

          <div className="grid gap-4 sm:grid-cols-2">
            <CheckoutField
              id="postalCode"
              label="Code postal"
              optional
              error={address?.postalCode?.message}
            >
              <input
                id="postalCode"
                inputMode="numeric"
                maxLength={4}
                autoComplete="postal-code"
                aria-invalid={address?.postalCode ? true : undefined}
                className={checkoutInputClass}
                {...register("shippingAddress.postalCode")}
              />
            </CheckoutField>

            <CheckoutField
              id="landmark"
              label="Point de repère"
              optional
              error={address?.landmark?.message}
            >
              <input
                id="landmark"
                maxLength={120}
                className={checkoutInputClass}
                {...register("shippingAddress.landmark")}
              />
            </CheckoutField>
          </div>

          <CheckoutField
            id="deliveryNote"
            label="Note pour le livreur"
            optional
            error={address?.deliveryNote?.message}
          >
            <textarea
              id="deliveryNote"
              rows={3}
              maxLength={300}
              className={`${checkoutInputClass} py-2`}
              {...register("shippingAddress.deliveryNote")}
            />
          </CheckoutField>
        </div>
      ) : (
        <p className="rounded-sm border border-border bg-surface-muted p-4 text-sm text-foreground-muted">
          Retrait à l'adresse : {storeConfig.storeAddress}. Aucun frais de livraison n'est appliqué.
        </p>
      )}
    </section>
  );
}
