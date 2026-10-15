import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { CheckoutContactSection } from "@/components/checkout/CheckoutContactSection";
import { CheckoutDeliverySection } from "@/components/checkout/CheckoutDeliverySection";
import { CheckoutErrorBanner } from "@/components/checkout/CheckoutErrorBanner";
import { CheckoutPaymentSection } from "@/components/checkout/CheckoutPaymentSection";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import type { Cart } from "@/domain/cart/cart.types";
import {
  checkoutFormSchema,
  type CheckoutFormInput,
  type CheckoutFormOutput,
} from "@/domain/checkout/checkout.schemas";
import { ORDER_DEMO_NOTICE } from "@/domain/order/order.constants";
import { useCreateOrderMutation } from "@/hooks/order/useCreateOrder";
import { createIdempotencyKey } from "@/services/checkout/checkout-idempotency";
import { toOrderItemInputs } from "@/services/checkout/checkout-mappers";
import { formatMoney } from "@/lib/money/money";
import {
  calculateCheckoutShipping,
  calculateDiscountedSubtotal,
} from "@/services/checkout/checkout-calculations";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { getNewsletterRepository } from "@/repositories/repositoryFactory";
import { trackEvent, trackPurchase } from "@/lib/analytics/analytics";
import { hasMetaTrackingConsent } from "@/lib/analytics/consent";

const defaultValues: CheckoutFormInput = {
  customer: { firstName: "", lastName: "", phone: "", email: "" },
  deliveryMethod: "home_delivery",
  shippingAddress: {
    governorate: "",
    city: "",
    postalCode: "",
    addressLine: "",
    landmark: "",
    deliveryNote: "",
  },
  paymentMethod: "cash_on_delivery",
  marketingEmailOptIn: false,
  messagingMarketingOptIn: false,
  acceptedTerms: false as unknown as true,
};

export function CheckoutForm({ cart }: { cart: Cart }) {
  const navigate = useNavigate();
  const createOrder = useCreateOrderMutation();
  const { data: storeSettings } = useStoreSettings();
  const idempotencyKey = useRef(createIdempotencyKey());

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const deliveryMethod = watch("deliveryMethod");
  const discountMinor = cart.totals.discountMinor ?? 0;
  const discountedSubtotalMinor = calculateDiscountedSubtotal(
    cart.totals.subtotalMinor,
    discountMinor,
  );
  const totalMinor = useMemo(() => {
    const subtotal = discountedSubtotalMinor;
    return (
      subtotal +
      calculateCheckoutShipping(
        subtotal,
        deliveryMethod,
        cart.totals.freeShippingThresholdMinor,
        storeSettings.shipping.standardFeeMinor,
        cart.totals.requiresShippingQuote,
      )
    );
  }, [
    cart.totals.freeShippingThresholdMinor,
    cart.totals.requiresShippingQuote,
    deliveryMethod,
    discountedSubtotalMinor,
    storeSettings.shipping.standardFeeMinor,
  ]);

  const busy = isSubmitting || createOrder.isPending;

  useEffect(() => {
    if (cart.items.length === 0) return;
    trackEvent("begin_checkout", {
      content_ids: cart.items.map((item) => item.sku),
      contents: cart.items.map((item) => ({ id: item.sku, quantity: item.quantity })),
      content_type: "product",
      num_items: cart.itemCount,
      value: totalMinor / 1000,
      currency: "TND",
    });
  }, [cart.items, cart.itemCount, totalMinor]);

  const onSubmit = handleSubmit(async (raw) => {
    const values = raw as unknown as CheckoutFormOutput;
    const customer = values.customer;

    const order = await createOrder.mutateAsync({
      idempotencyKey: idempotencyKey.current,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        ...(customer.email ? { email: customer.email } : {}),
      },
      deliveryMethod: values.deliveryMethod,
      ...(values.deliveryMethod === "home_delivery" && values.shippingAddress
        ? {
            shippingAddress: {
              governorate: values.shippingAddress.governorate ?? "",
              city: values.shippingAddress.city ?? "",
              addressLine: values.shippingAddress.addressLine ?? "",
              ...(values.shippingAddress.postalCode
                ? { postalCode: values.shippingAddress.postalCode }
                : {}),
              ...(values.shippingAddress.landmark
                ? { landmark: values.shippingAddress.landmark }
                : {}),
              ...(values.shippingAddress.deliveryNote
                ? { deliveryNote: values.shippingAddress.deliveryNote }
                : {}),
            },
          }
        : {}),
      paymentMethod: values.paymentMethod,
      items: toOrderItemInputs(cart),
      ...(discountMinor > 0 ? { discountMinor } : {}),
    });

    // Marketing sync is deliberately best-effort: it must never block a
    // confirmed order when Brevo is temporarily unavailable.
    if (customer.email || customer.phone) {
      try {
        await getNewsletterRepository().syncOrder({
          orderNumber: order.orderNumber,
          customer: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            ...(customer.email ? { email: customer.email } : {}),
          },
          emailMarketingOptIn: values.marketingEmailOptIn,
          messagingMarketingOptIn: values.messagingMarketingOptIn,
        });
      } catch {
        // The order is already persisted by the commerce API. A later retry
        // or an admin reconciliation can recover the marketing sync.
      }
    }

    if (hasMetaTrackingConsent()) {
      trackPurchase(
        {
          event_id: `purchase-${order.orderNumber}`,
          content_ids: order.items.map((item) => item.sku),
          contents: order.items.map((item) => ({ id: item.sku, quantity: item.quantity })),
          content_type: "product",
          num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
          value: order.totals.totalMinor / 1000,
          currency: "TND",
          order_id: order.orderNumber,
        },
        {
          ...(customer.email ? { email: customer.email } : {}),
          phone: customer.phone,
        },
      );
    }

    void order;
    await navigate({ to: "/commande/confirmation" });
  });

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      noValidate
      className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]"
    >
      <div className="space-y-10">
        <CheckoutErrorBanner error={createOrder.error} />
        <CheckoutContactSection register={register} errors={errors} />
        <CheckoutDeliverySection
          register={register}
          errors={errors}
          deliveryMethod={deliveryMethod}
          shippingMinor={calculateCheckoutShipping(
            discountedSubtotalMinor,
            deliveryMethod,
            cart.totals.freeShippingThresholdMinor,
            storeSettings.shipping.standardFeeMinor,
            cart.totals.requiresShippingQuote,
          )}
        />
        <CheckoutPaymentSection register={register} errors={errors} />
      </div>

      <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <CheckoutSummary cart={cart} deliveryMethod={deliveryMethod} />

        <button
          type="submit"
          disabled={busy}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-sm bg-accent px-6 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {busy ? "Validation en cours…" : `Confirmer la commande — ${formatMoney(totalMinor)}`}
        </button>

        <p className="flex items-start gap-2 text-xs text-foreground-muted">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {ORDER_DEMO_NOTICE}
        </p>
      </div>
    </form>
  );
}
