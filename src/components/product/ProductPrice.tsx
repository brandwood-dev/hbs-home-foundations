import type { ProductVariant } from "@/domain/product/product.types";
import { formatMoney } from "@/lib/money/money";

export function ProductPrice({
  variant,
  size = "lg",
}: {
  variant: ProductVariant;
  size?: "lg" | "sm";
}) {
  const compareAt = variant.compareAtPrice;
  const discounted = compareAt && compareAt.amountMinor > variant.price.amountMinor;
  const percentage = discounted
    ? Math.round(
        ((compareAt.amountMinor - variant.price.amountMinor) / compareAt.amountMinor) * 100,
      )
    : 0;

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={size === "lg" ? "text-2xl font-semibold" : "text-base font-semibold"}>
        {formatMoney(variant.price)}
      </span>
      {discounted && (
        <>
          <span className="text-sm text-foreground-muted line-through">
            {formatMoney(compareAt)}
          </span>
          <span className="rounded-full bg-error px-2 py-0.5 text-[11px] font-semibold text-surface">
            {`-${percentage}%`}
          </span>
        </>
      )}
    </div>
  );
}
