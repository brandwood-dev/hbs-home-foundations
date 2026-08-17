import { AVAILABILITY_LABELS } from "@/domain/product/product.constants";
import type { ProductVariant } from "@/domain/product/product.types";

export function ProductAvailabilityBadge({ variant }: { variant: ProductVariant }) {
  const { availability, availableQuantity } = variant;
  const tone =
    availability === "in_stock"
      ? "text-success"
      : availability === "out_of_stock"
        ? "text-error"
        : "text-accent-dark";

  const dot =
    availability === "in_stock"
      ? "bg-success"
      : availability === "out_of_stock"
        ? "bg-error"
        : "bg-accent";

  return (
    <p className={`flex items-center gap-2 text-sm ${tone}`} aria-live="polite">
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      {AVAILABILITY_LABELS[availability]}
      {availability === "low_stock" && availableQuantity > 0 && (
        <span className="text-foreground-muted">{`— plus que ${availableQuantity} pièces`}</span>
      )}
      {availability === "made_to_order" && (
        <span className="text-foreground-muted">— confection sous 5 à 7 jours</span>
      )}
    </p>
  );
}
