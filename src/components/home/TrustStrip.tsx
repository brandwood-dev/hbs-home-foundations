import { Banknote, MessageCircle, PackageCheck, Truck } from "lucide-react";
import type { HomeTrustIcon, HomeTrustItem } from "@/domain/content/home-content.types";

const icons: Record<HomeTrustIcon, typeof Truck> = {
  truck: Truck,
  banknote: Banknote,
  "package-check": PackageCheck,
  "message-circle": MessageCircle,
};

export function TrustStrip({ items }: { items: HomeTrustItem[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-label="Nos engagements" className="border-y border-border bg-surface">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-6 py-8 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = icons[item.icon];
          return (
            <li key={item.id} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold leading-snug">{item.label}</p>
                <p className="mt-1 text-xs text-foreground-muted">{item.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
