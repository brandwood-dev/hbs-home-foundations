import { Truck } from "lucide-react";
import {
  SHIPPING_PROFILE_LABELS,
  SHIPPING_PROFILE_NOTES,
} from "@/domain/product/product.constants";
import type { ShippingProfile } from "@/domain/product/product.types";

/** Encart logistique affiché sur la fiche produit pour les envois non standards. */
export function ProductShippingNotice({ profile }: { profile?: ShippingProfile }) {
  if (!profile || profile === "standard") return null;

  return (
    <div className="flex gap-3 rounded-md border border-border bg-surface-muted p-4">
      <Truck className="mt-0.5 h-5 w-5 shrink-0 text-accent-dark" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium">{SHIPPING_PROFILE_LABELS[profile]}</p>
        <p className="text-xs text-foreground-muted">{SHIPPING_PROFILE_NOTES[profile]}</p>
      </div>
    </div>
  );
}
