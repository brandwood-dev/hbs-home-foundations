import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { CheckoutField, checkoutInputClass } from "@/components/checkout/CheckoutField";
import type { CheckoutFormInput } from "@/domain/checkout/checkout.schemas";

export function CheckoutContactSection({
  register,
  errors,
}: {
  register: UseFormRegister<CheckoutFormInput>;
  errors: FieldErrors<CheckoutFormInput>;
}) {
  const customer = errors.customer;

  return (
    <section aria-labelledby="checkout-contact" className="space-y-4">
      <h2 id="checkout-contact" className="text-xl">
        1. Vos coordonnées
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <CheckoutField id="firstName" label="Prénom" error={customer?.firstName?.message}>
          <input
            id="firstName"
            autoComplete="given-name"
            maxLength={60}
            aria-invalid={customer?.firstName ? true : undefined}
            className={checkoutInputClass}
            {...register("customer.firstName")}
          />
        </CheckoutField>

        <CheckoutField id="lastName" label="Nom" error={customer?.lastName?.message}>
          <input
            id="lastName"
            autoComplete="family-name"
            maxLength={60}
            aria-invalid={customer?.lastName ? true : undefined}
            className={checkoutInputClass}
            {...register("customer.lastName")}
          />
        </CheckoutField>
      </div>

      <CheckoutField
        id="phone"
        label="Téléphone"
        hint="Format tunisien : 8 chiffres, ex. 22 123 456."
        error={customer?.phone?.message}
      >
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={20}
          aria-invalid={customer?.phone ? true : undefined}
          className={checkoutInputClass}
          {...register("customer.phone")}
        />
      </CheckoutField>

      <CheckoutField
        id="email"
        label="E-mail"
        optional
        hint="Pour recevoir un récapitulatif de commande."
        error={customer?.email?.message}
      >
        <input
          id="email"
          type="email"
          autoComplete="email"
          maxLength={255}
          aria-invalid={customer?.email ? true : undefined}
          className={checkoutInputClass}
          {...register("customer.email")}
        />
      </CheckoutField>
    </section>
  );
}
