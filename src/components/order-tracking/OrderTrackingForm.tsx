import { useEffect, useId, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { ORDER_NUMBER_ERROR } from "@/domain/order/order-tracking.constants";
import {
  TUNISIAN_PHONE_ERROR,
  isValidTunisianPhone,
} from "@/services/checkout/phone-normalization";
import { isValidOrderNumber, normalizeOrderNumber } from "@/services/order/order-number";
import { DemoOrderTrackingHelper } from "@/components/order-tracking/DemoOrderTrackingHelper";

interface FieldErrors {
  orderNumber?: string;
  phone?: string;
}

export interface OrderTrackingFormProps {
  defaultOrderNumber?: string;
  isPending: boolean;
  onSubmit: (values: { orderNumber: string; phone: string }) => void;
}

export function OrderTrackingForm({
  defaultOrderNumber,
  isPending,
  onSubmit,
}: OrderTrackingFormProps) {
  const orderId = useId();
  const phoneId = useId();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const orderRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const prefilled = useRef(false);

  // Préremplissage uniquement après hydratation, et uniquement le numéro.
  useEffect(() => {
    if (prefilled.current || !defaultOrderNumber) return;
    prefilled.current = true;
    setOrderNumber(defaultOrderNumber);
  }, [defaultOrderNumber]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const nextErrors: FieldErrors = {};
    if (!isValidOrderNumber(orderNumber)) nextErrors.orderNumber = ORDER_NUMBER_ERROR;
    if (!isValidTunisianPhone(phone)) nextErrors.phone = TUNISIAN_PHONE_ERROR;
    setErrors(nextErrors);

    if (nextErrors.orderNumber) {
      orderRef.current?.focus();
      return;
    }
    if (nextErrors.phone) {
      phoneRef.current?.focus();
      return;
    }

    onSubmit({ orderNumber: normalizeOrderNumber(orderNumber), phone });
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-sm border border-border bg-surface p-4 sm:p-6"
    >
      <div className="space-y-2">
        <label htmlFor={orderId} className="block text-sm font-medium">
          Numéro de commande
        </label>
        <input
          id={orderId}
          ref={orderRef}
          value={orderNumber}
          onChange={(event) => setOrderNumber(event.target.value)}
          placeholder="HBS-20260818-100001"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={errors.orderNumber ? true : undefined}
          aria-describedby={errors.orderNumber ? `${orderId}-error` : undefined}
          className="min-h-[48px] w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        {errors.orderNumber ? (
          <p id={`${orderId}-error`} className="text-sm text-destructive">
            {errors.orderNumber}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor={phoneId} className="block text-sm font-medium">
          Numéro de téléphone
        </label>
        <input
          id={phoneId}
          ref={phoneRef}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="22 123 456"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? `${phoneId}-error` : undefined}
          className="min-h-[48px] w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        {errors.phone ? (
          <p id={`${phoneId}-error`} className="text-sm text-destructive">
            {errors.phone}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm bg-accent px-6 text-sm text-accent-foreground hover:bg-accent-dark disabled:opacity-60 sm:w-auto"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {isPending ? "Recherche en cours…" : "Suivre ma commande"}
      </button>

      <DemoOrderTrackingHelper
        onFill={(values) => {
          setOrderNumber(values.orderNumber);
          setPhone(values.phone);
          setErrors({});
        }}
      />
    </form>
  );
}
