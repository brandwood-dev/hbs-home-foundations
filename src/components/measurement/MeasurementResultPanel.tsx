import { useState } from "react";
import { toast } from "sonner";
import { AppLink } from "@/components/ui/app-link";
import { MEASUREMENT_DISCLAIMER } from "@/domain/measurement/measurement.constants";
import type {
  MeasurementAccessoryRecommendation,
  MeasurementProductRecommendation,
  MeasurementResult,
} from "@/domain/measurement/measurement.types";
import { isBlindResult } from "@/domain/measurement/measurement.types";
import { formatCm } from "@/services/measurement/curtain-measurement";
import { copySummaryToClipboard } from "@/services/measurement/measurement-summary";
import {
  MeasurementAccessoryCard,
  MeasurementRecommendationCard,
} from "@/components/measurement/MeasurementRecommendationCard";

interface MeasurementResultPanelProps {
  result: MeasurementResult;
  summary: string;
  products: MeasurementProductRecommendation[];
  accessories: MeasurementAccessoryRecommendation[];
  loading: boolean;
  onRestart: () => void;
}

function KeyFigure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-muted p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 text-2xl">{value}</p>
    </div>
  );
}

export function MeasurementResultPanel({
  result,
  summary,
  products,
  accessories,
  loading,
  onRestart,
}: MeasurementResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const blind = isBlindResult(result);

  const onCopy = async () => {
    const ok = await copySummaryToClipboard(summary);
    setCopied(ok);
    toast[ok ? "success" : "error"](
      ok ? "Résumé copié dans le presse-papiers." : "Copie impossible sur cet appareil.",
    );
  };

  return (
    <div className="space-y-8">
      <section aria-labelledby="resultat-titre">
        <h2 id="resultat-titre" className="text-2xl">
          Votre recommandation
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {blind ? (
            <>
              <KeyFigure
                label="Largeur produit"
                value={formatCm(result.recommendedProductWidthCm)}
              />
              <KeyFigure
                label="Hauteur produit"
                value={formatCm(result.recommendedProductHeightCm)}
              />
              <KeyFigure
                label="Ouverture retenue"
                value={`${formatCm(result.openingWidthCm)} × ${formatCm(result.openingHeightCm)}`}
              />
            </>
          ) : (
            <>
              <KeyFigure
                label="Largeur par pan"
                value={formatCm(result.recommendedWidthPerPanelCm)}
              />
              <KeyFigure
                label="Hauteur finie"
                value={formatCm(result.recommendedFinishedHeightCm)}
              />
              <KeyFigure
                label="Nombre de pans"
                value={`${result.panelCount} · ampleur ×${result.fullnessRatio.toLocaleString("fr-FR")}`}
              />
            </>
          )}
        </div>

        <details className="mt-4 rounded-md border border-border p-4">
          <summary className="cursor-pointer text-sm font-medium">
            Comment ce résultat est calculé
          </summary>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground-muted">
            {result.calculationNotes.map((note) => (
              <li key={note}>· {note}</li>
            ))}
          </ul>
        </details>

        {blind && result.warnings.length > 0 && (
          <div role="status" className="mt-4 rounded-md border border-border bg-surface-muted p-4">
            <p className="text-sm font-medium">Points de vigilance</p>
            <ul className="mt-1.5 space-y-1 text-sm text-foreground-muted">
              {result.warnings.map((warning) => (
                <li key={warning}>· {warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void onCopy()}
            className="min-h-[48px] rounded-sm border border-border px-5 text-sm hover:border-taupe"
          >
            {copied ? "Résumé copié" : "Copier mon résumé"}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="min-h-[48px] rounded-sm border border-border px-5 text-sm hover:border-taupe"
          >
            Recommencer
          </button>
          <AppLink
            href="/sur-mesure"
            className="inline-flex min-h-[48px] items-center rounded-sm bg-accent px-5 text-sm text-accent-foreground hover:bg-accent-dark"
          >
            Demander un sur-mesure
          </AppLink>
        </div>

        <pre className="mt-4 whitespace-pre-wrap rounded-md bg-surface-muted p-4 text-xs text-foreground-muted">
          {summary}
        </pre>
      </section>

      {result.recommendationLevel === "custom_required" && (
        <section className="rounded-md border border-accent bg-accent/10 p-5">
          <h3 className="text-lg">Vos dimensions sortent des tailles standard</h3>
          <p className="mt-1.5 text-sm text-foreground-muted">
            Nous vous conseillons une confection sur mesure : envoyez-nous vos mesures et nous
            revenons vers vous avec une proposition adaptée.
          </p>
          <AppLink
            href="/sur-mesure"
            className="mt-4 inline-flex min-h-[48px] items-center rounded-sm bg-accent px-5 text-sm text-accent-foreground hover:bg-accent-dark"
          >
            Demander un devis sur mesure
          </AppLink>
        </section>
      )}

      <section aria-labelledby="produits-titre">
        <h2 id="produits-titre" className="text-2xl">
          Produits compatibles
        </h2>
        {loading ? (
          <p className="mt-3 text-sm text-foreground-muted">Recherche des produits compatibles…</p>
        ) : products.length === 0 ? (
          <div className="mt-3 rounded-md border border-border p-5">
            <p className="text-sm text-foreground-muted">
              Aucun produit standard ne correspond exactement à ces dimensions. Le sur-mesure reste
              la meilleure option pour cette fenêtre.
            </p>
            <AppLink
              href="/sur-mesure"
              className="mt-4 inline-flex min-h-[48px] items-center rounded-sm bg-accent px-5 text-sm text-accent-foreground hover:bg-accent-dark"
            >
              Demander un devis
            </AppLink>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {products.map((recommendation) => (
              <MeasurementRecommendationCard
                key={`${recommendation.product.id}-${recommendation.variant.id}`}
                recommendation={recommendation}
              />
            ))}
          </div>
        )}
      </section>

      {accessories.length > 0 && (
        <section aria-labelledby="accessoires-titre">
          <h2 id="accessoires-titre" className="text-2xl">
            Accessoires compatibles
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {accessories.map((recommendation) => (
              <MeasurementAccessoryCard
                key={`${recommendation.product.id}-${recommendation.variant.id}`}
                recommendation={recommendation}
              />
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-foreground-muted">{MEASUREMENT_DISCLAIMER}</p>
    </div>
  );
}
