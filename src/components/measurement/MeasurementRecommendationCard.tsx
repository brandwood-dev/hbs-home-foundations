import { AppLink } from "@/components/ui/app-link";
import { RECOMMENDATION_LEVEL_LABELS } from "@/domain/measurement/measurement.constants";
import type {
  MeasurementAccessoryRecommendation,
  MeasurementProductRecommendation,
} from "@/domain/measurement/measurement.types";
import { formatMoney } from "@/lib/money/money";
import { sellingUnitLabel } from "@/services/measurement/measurement-recommendations";

function LevelBadge({ level }: { level: MeasurementProductRecommendation["recommendationLevel"] }) {
  const tone =
    level === "exact"
      ? "bg-accent text-accent-foreground"
      : level === "compatible"
        ? "bg-surface-muted text-foreground"
        : "bg-surface-muted text-foreground-muted";
  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${tone}`}
    >
      {RECOMMENDATION_LEVEL_LABELS[level]}
    </span>
  );
}

export function MeasurementRecommendationCard({
  recommendation,
}: {
  recommendation: MeasurementProductRecommendation;
}) {
  const { product, variant, requiredQuantity, reasons, recommendationLevel } = recommendation;
  const image = variant.imageUrl ?? product.variants[0]?.imageUrl ?? "";

  return (
    <article className="flex gap-4 rounded-md border border-border p-3">
      <AppLink
        href={`/produit/${product.slug}`}
        className="block h-28 w-20 shrink-0 overflow-hidden rounded-sm bg-surface-muted"
      >
        <img
          src={image}
          alt={product.imageAlt}
          loading="lazy"
          decoding="async"
          width={160}
          height={224}
          className="h-full w-full object-cover"
        />
      </AppLink>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={recommendationLevel} />
          <span className="text-xs text-foreground-muted">
            {sellingUnitLabel(product, variant)}
          </span>
        </div>

        <h3 className="mt-1.5 text-base leading-snug">
          <AppLink href={`/produit/${product.slug}`} className="hover:text-accent-dark">
            {product.name}
          </AppLink>
        </h3>

        <p className="mt-1 text-sm font-semibold">{formatMoney(variant.price)}</p>

        <ul className="mt-2 space-y-1 text-xs text-foreground-muted">
          {reasons.map((reason) => (
            <li key={reason}>· {reason}</li>
          ))}
        </ul>

        <p className="mt-2 text-xs">
          Quantité conseillée : <span className="font-semibold">{requiredQuantity}</span>
        </p>
      </div>
    </article>
  );
}

export function MeasurementAccessoryCard({
  recommendation,
}: {
  recommendation: MeasurementAccessoryRecommendation;
}) {
  const { product, variant, reasons } = recommendation;
  return (
    <article className="rounded-md border border-border p-3">
      <h3 className="text-sm font-medium">
        <AppLink href={`/produit/${product.slug}`} className="hover:text-accent-dark">
          {product.name}
        </AppLink>
      </h3>
      <p className="mt-1 text-sm font-semibold">{formatMoney(variant.price)}</p>
      <ul className="mt-1.5 space-y-1 text-xs text-foreground-muted">
        {reasons.map((reason) => (
          <li key={reason}>· {reason}</li>
        ))}
      </ul>
    </article>
  );
}
