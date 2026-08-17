import { BadgeCheck, Store, Truck, Wallet } from "lucide-react";
import { storeConfig } from "@/config/store.config";
import { formatMoney } from "@/lib/money/money";

const items = [
  {
    icon: Truck,
    title: "Livraison rapide",
    text: `Partout en Tunisie en ${storeConfig.estimatedDeliveryLabel}`,
  },
  {
    icon: Wallet,
    title: "Paiement à la livraison",
    text: `Livraison offerte dès ${formatMoney(storeConfig.freeShippingThresholdMinor)}`,
  },
  {
    icon: Store,
    title: "Retrait en boutique",
    text: storeConfig.storeAddress,
  },
  {
    icon: BadgeCheck,
    title: "Qualité contrôlée",
    text: "Confection et finitions vérifiées avant expédition",
  },
];

export function ProductTrustPoints() {
  return (
    <ul className="grid gap-3 rounded-md border border-border bg-surface p-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.title} className="flex gap-3">
          <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-dark" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-foreground-muted">{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
