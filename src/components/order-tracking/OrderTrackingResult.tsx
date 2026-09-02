import { MessageCircle, Phone } from "lucide-react";
import type { OrderTrackingResult as TrackingResult } from "@/domain/order/order-tracking.types";
import { AppLink } from "@/components/ui/app-link";
import { ORDER_TRACKING_DEMO_NOTICE } from "@/domain/order/order-tracking.constants";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { OrderTrackingDelivery } from "@/components/order-tracking/OrderTrackingDelivery";
import { OrderTrackingHeader } from "@/components/order-tracking/OrderTrackingHeader";
import { OrderTrackingItems } from "@/components/order-tracking/OrderTrackingItems";
import { OrderTrackingNextSteps } from "@/components/order-tracking/OrderTrackingNextSteps";
import { OrderTrackingStatus } from "@/components/order-tracking/OrderTrackingStatus";
import { OrderTrackingSummary } from "@/components/order-tracking/OrderTrackingSummary";
import { OrderTrackingTimeline } from "@/components/order-tracking/OrderTrackingTimeline";

export function OrderTrackingResultView({ result }: { result: TrackingResult }) {
  const { data: storeSettings } = useStoreSettings();
  const whatsapp = storeSettings.contact.whatsapp;
  const servicePhone = storeSettings.contact.phone;
  const whatsappHref = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Bonjour HBS HOME, je souhaite obtenir des informations concernant ma commande ${result.orderNumber}.`,
      )}`
    : null;

  return (
    <div className="space-y-8">
      <OrderTrackingHeader result={result} />
      <OrderTrackingStatus result={result} />
      <OrderTrackingTimeline steps={result.timeline} />
      <OrderTrackingNextSteps result={result} />

      <div className="grid gap-8 lg:grid-cols-2">
        <OrderTrackingItems items={result.items} />
        <div className="space-y-6">
          <OrderTrackingSummary totals={result.totals} />
          <OrderTrackingDelivery result={result} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <AppLink
          href="/rideaux"
          className="flex min-h-[48px] items-center rounded-sm bg-accent px-6 text-sm text-accent-foreground hover:bg-accent-dark"
        >
          Continuer mes achats
        </AppLink>
        <AppLink
          href="/"
          className="flex min-h-[48px] items-center rounded-sm border border-border px-6 text-sm hover:bg-surface-muted"
        >
          Retour à l'accueil
        </AppLink>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[48px] items-center gap-2 rounded-sm border border-border px-6 text-sm hover:bg-surface-muted"
          >
            <MessageCircle className="size-4" aria-hidden /> WhatsApp
          </a>
        ) : null}
        {servicePhone ? (
          <a
            href={`tel:${servicePhone.replace(/\s/g, "")}`}
            className="flex min-h-[48px] items-center gap-2 rounded-sm border border-border px-6 text-sm hover:bg-surface-muted"
          >
            <Phone className="size-4" aria-hidden /> Appeler
          </a>
        ) : null}
      </div>

      {result.isDemo ? (
        <p className="text-xs text-foreground-muted">{ORDER_TRACKING_DEMO_NOTICE}</p>
      ) : null}
    </div>
  );
}
