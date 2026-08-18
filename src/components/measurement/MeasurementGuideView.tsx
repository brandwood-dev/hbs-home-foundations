import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { MeasurementOptionGroup } from "@/components/measurement/MeasurementOptionGroup";
import { MeasurementResultPanel } from "@/components/measurement/MeasurementResultPanel";
import { CheckoutField, checkoutInputClass } from "@/components/checkout/CheckoutField";
import {
  BLIND_MOUNTING_POSITION_LABELS,
  CURTAIN_FLOOR_FINISH_LABELS,
  CURTAIN_FULLNESS_HINTS,
  CURTAIN_FULLNESS_LABELS,
  CURTAIN_LENGTH_TARGET_LABELS,
  CURTAIN_SUPPORT_LABELS,
  FULLNESS_RATIOS,
  MEASUREMENT_DISCLAIMER,
  MEASUREMENT_PROJECT_LABELS,
  OPENING_TYPE_LABELS,
} from "@/domain/measurement/measurement.constants";
import { MEASUREMENT_ERROR_MESSAGES } from "@/domain/measurement/measurement.errors";
import type {
  BlindMeasurementInput,
  BlindMountingPosition,
  CurtainFloorFinish,
  CurtainFullnessRatio,
  CurtainLengthTarget,
  CurtainMeasurementInput,
  CurtainPanelCount,
  CurtainSupportType,
  MeasurementProjectType,
  MeasurementResult,
  OpeningType,
} from "@/domain/measurement/measurement.types";
import { useMeasurementRules } from "@/hooks/measurement/useMeasurementRules";
import {
  measurementAccessoriesQuery,
  measurementProductsQuery,
} from "@/services/measurement/measurement.queries";
import { calculateCurtainMeasurements } from "@/services/measurement/curtain-measurement";
import { calculateBlindMeasurements } from "@/services/measurement/blind-measurement";
import { findMeasurementProductRecommendations } from "@/services/measurement/measurement-recommendations";
import { findCompatibleAccessoryRecommendations } from "@/services/measurement/accessory-recommendations";
import {
  buildBlindSummary,
  buildCurtainSummary,
} from "@/services/measurement/measurement-summary";
import {
  parseCmInput,
  validateExtensionField,
  validateHeightField,
  validateWidthField,
} from "@/services/measurement/measurement-validation";
import { trackEvent } from "@/lib/analytics/analytics";

const STEPS = ["Votre projet", "Vos mesures", "Vos préférences", "Résultat"] as const;

interface CurtainDraft {
  openingType: OpeningType;
  supportType: CurtainSupportType;
  supportWidth: string;
  openingWidth: string;
  leftExtension: string;
  rightExtension: string;
  measuredHeight: string;
  lengthTarget: CurtainLengthTarget;
  floorFinish: CurtainFloorFinish;
  fullnessRatio: CurtainFullnessRatio;
  panelCount: CurtainPanelCount;
}

interface BlindDraft {
  mountingPosition: BlindMountingPosition;
  widths: [string, string, string];
  heights: [string, string, string];
}

const INITIAL_CURTAIN: CurtainDraft = {
  openingType: "fenetre",
  supportType: "tringle",
  supportWidth: "",
  openingWidth: "",
  leftExtension: "",
  rightExtension: "",
  measuredHeight: "",
  lengthTarget: "sol",
  floorFinish: "ras_du_sol",
  fullnessRatio: 2,
  panelCount: 2,
};

const INITIAL_BLIND: BlindDraft = {
  mountingPosition: "dans_encadrement",
  widths: ["", "", ""],
  heights: ["", "", ""],
};

export function MeasurementGuideView() {
  const [step, setStep] = useState(0);
  const [projectType, setProjectType] = useState<MeasurementProjectType>("rideaux");
  const [curtain, setCurtain] = useState<CurtainDraft>(INITIAL_CURTAIN);
  const [blind, setBlind] = useState<BlindDraft>(INITIAL_BLIND);
  const [showErrors, setShowErrors] = useState(false);

  const rulesQuery = useMeasurementRules();
  const rules = rulesQuery.data;

  const productsQuery = useQuery(measurementProductsQuery(projectType));
  const accessoriesQuery = useQuery({
    ...measurementAccessoriesQuery(),
    enabled: projectType !== "stores",
  });

  const isBlindProject = projectType === "stores";

  const curtainErrors = useMemo(() => {
    if (!rules) return {} as Record<string, string | null>;
    return {
      supportWidth:
        curtain.supportType === "inconnu"
          ? null
          : curtain.supportWidth.trim().length > 0
            ? validateWidthField(curtain.supportWidth, rules)
            : null,
      openingWidth:
        curtain.supportWidth.trim().length > 0
          ? null
          : validateWidthField(curtain.openingWidth, rules),
      leftExtension: validateExtensionField(curtain.leftExtension),
      rightExtension: validateExtensionField(curtain.rightExtension),
      measuredHeight: validateHeightField(curtain.measuredHeight, rules),
    };
  }, [curtain, rules]);

  const blindErrors = useMemo(() => {
    if (!rules) return { widths: [null, null, null], heights: [null, null, null] };
    return {
      widths: blind.widths.map((value) => validateWidthField(value, rules)),
      heights: blind.heights.map((value) => validateHeightField(value, rules)),
    };
  }, [blind, rules]);

  const measurementsValid = isBlindProject
    ? blindErrors.widths.every((error) => !error) && blindErrors.heights.every((error) => !error)
    : Object.values(curtainErrors).every((error) => !error);

  const result: MeasurementResult | null = useMemo(() => {
    if (!rules || !measurementsValid) return null;
    if (isBlindProject) {
      const widths = blind.widths.map((value) => parseCmInput(value) ?? 0) as [
        number,
        number,
        number,
      ];
      const heights = blind.heights.map((value) => parseCmInput(value) ?? 0) as [
        number,
        number,
        number,
      ];
      const input: BlindMeasurementInput = {
        projectType: "stores",
        mountingPosition: blind.mountingPosition,
        widthMeasurementsCm: widths,
        heightMeasurementsCm: heights,
      };
      return calculateBlindMeasurements(input, rules);
    }
    const supportWidth = parseCmInput(curtain.supportWidth);
    const openingWidth = parseCmInput(curtain.openingWidth);
    const built: CurtainMeasurementInput = {
      projectType: projectType === "voilages" ? "voilages" : "rideaux",
      openingType: curtain.openingType,
      supportType: curtain.supportType,
      measuredHeightCm: parseCmInput(curtain.measuredHeight) ?? 0,
      lengthTarget: curtain.lengthTarget,
      fullnessRatio: curtain.fullnessRatio,
      panelCount: curtain.panelCount,
      ...(supportWidth !== null ? { supportWidthCm: supportWidth } : {}),
      ...(openingWidth !== null ? { openingWidthCm: openingWidth } : {}),
      ...(parseCmInput(curtain.leftExtension) !== null
        ? { leftExtensionCm: parseCmInput(curtain.leftExtension) as number }
        : {}),
      ...(parseCmInput(curtain.rightExtension) !== null
        ? { rightExtensionCm: parseCmInput(curtain.rightExtension) as number }
        : {}),
      ...(curtain.lengthTarget === "sol" ? { floorFinish: curtain.floorFinish } : {}),
    };
    return calculateCurtainMeasurements(built, rules);
  }, [blind, curtain, isBlindProject, measurementsValid, projectType, rules]);

  const summary = useMemo(() => {
    if (!result) return "";
    if (isBlindProject) {
      return buildBlindSummary(
        {
          projectType: "stores",
          mountingPosition: blind.mountingPosition,
          widthMeasurementsCm: blind.widths.map((v) => parseCmInput(v) ?? 0) as [
            number,
            number,
            number,
          ],
          heightMeasurementsCm: blind.heights.map((v) => parseCmInput(v) ?? 0) as [
            number,
            number,
            number,
          ],
        },
        result as never,
      );
    }
    return buildCurtainSummary(
      {
        projectType: projectType === "voilages" ? "voilages" : "rideaux",
        openingType: curtain.openingType,
        supportType: curtain.supportType,
        measuredHeightCm: parseCmInput(curtain.measuredHeight) ?? 0,
        lengthTarget: curtain.lengthTarget,
        fullnessRatio: curtain.fullnessRatio,
        panelCount: curtain.panelCount,
        ...(curtain.lengthTarget === "sol" ? { floorFinish: curtain.floorFinish } : {}),
      },
      result as never,
    );
  }, [blind, curtain, isBlindProject, projectType, result]);

  const productRecommendations = useMemo(() => {
    if (!result || !rules || !productsQuery.data) return [];
    return findMeasurementProductRecommendations(
      result,
      {
        projectType,
        supportType: isBlindProject ? undefined : curtain.supportType,
        panelCount: isBlindProject ? undefined : curtain.panelCount,
        mountingPosition: isBlindProject ? blind.mountingPosition : undefined,
      },
      productsQuery.data,
      rules,
    );
  }, [blind, curtain, isBlindProject, productsQuery.data, projectType, result, rules]);

  const accessoryRecommendations = useMemo(() => {
    if (!result || isBlindProject || !accessoriesQuery.data) return [];
    return findCompatibleAccessoryRecommendations({
      products: accessoriesQuery.data,
      supportType: curtain.supportType,
      supportWidthCm: "supportWidthCm" in result ? result.supportWidthCm : 0,
      projectType: projectType === "voilages" ? "voilages" : "rideaux",
    });
  }, [accessoriesQuery.data, curtain.supportType, isBlindProject, projectType, result]);

  const goNext = () => {
    if (step === 1 && !measurementsValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (step === 2) trackEvent("generate_lead", { tool: "measurement_guide", projectType });
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const restart = () => {
    setStep(0);
    setCurtain(INITIAL_CURTAIN);
    setBlind(INITIAL_BLIND);
    setShowErrors(false);
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 pb-20 pt-6 sm:px-6 lg:pt-10">
        <CatalogBreadcrumbs
          items={[{ label: "Accueil", href: "/" }, { label: "Guide des mesures" }]}
        />

        <header className="mt-6">
          <p className="eyebrow">Outil d'aide</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Guide des mesures</h1>
          <p className="mt-3 max-w-2xl text-foreground-muted">
            Quatre étapes pour connaître la largeur, la hauteur et le nombre de pans adaptés à
            votre fenêtre — puis les produits compatibles dans notre catalogue.
          </p>
        </header>

        <ol className="mt-8 flex flex-wrap gap-2" aria-label="Étapes du guide">
          {STEPS.map((label, index) => (
            <li key={label}>
              <span
                aria-current={index === step ? "step" : undefined}
                className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm ${
                  index === step
                    ? "bg-accent text-accent-foreground"
                    : index < step
                      ? "bg-surface-muted text-foreground"
                      : "bg-surface-muted text-foreground-muted"
                }`}
              >
                {index + 1}. {label}
              </span>
            </li>
          ))}
        </ol>

        {rulesQuery.isError && (
          <p role="alert" className="mt-6 text-sm text-destructive">
            {MEASUREMENT_ERROR_MESSAGES.rulesUnavailable}
          </p>
        )}

        <div className="mt-8 space-y-8">
          {step === 0 && (
            <section className="space-y-6">
              <MeasurementOptionGroup
                legend="Que souhaitez-vous poser ?"
                name="projet"
                value={projectType}
                onChange={(next) => setProjectType(next)}
                options={(["rideaux", "voilages", "stores"] as MeasurementProjectType[]).map(
                  (value) => ({ value, label: MEASUREMENT_PROJECT_LABELS[value] }),
                )}
              />
              {!isBlindProject && (
                <MeasurementOptionGroup
                  legend="Type d'ouverture"
                  name="ouverture"
                  value={curtain.openingType}
                  onChange={(openingType) => setCurtain((c) => ({ ...c, openingType }))}
                  options={(["fenetre", "porte_fenetre", "baie_vitree"] as OpeningType[]).map(
                    (value) => ({ value, label: OPENING_TYPE_LABELS[value] }),
                  )}
                />
              )}
              {isBlindProject && (
                <MeasurementOptionGroup
                  legend="Position de pose"
                  name="pose"
                  columns={2}
                  value={blind.mountingPosition}
                  onChange={(mountingPosition) => setBlind((b) => ({ ...b, mountingPosition }))}
                  options={(
                    ["dans_encadrement", "hors_encadrement"] as BlindMountingPosition[]
                  ).map((value) => ({
                    value,
                    label: BLIND_MOUNTING_POSITION_LABELS[value],
                    hint:
                      value === "dans_encadrement"
                        ? "Le store s'inscrit dans le tableau de la fenêtre."
                        : "Le store recouvre l'encadrement, idéal pour l'occultation.",
                  }))}
                />
              )}
            </section>
          )}

          {step === 1 && !isBlindProject && (
            <section className="space-y-6">
              <MeasurementOptionGroup
                legend="Sur quel support ?"
                name="support"
                value={curtain.supportType}
                onChange={(supportType) => setCurtain((c) => ({ ...c, supportType }))}
                options={(["tringle", "rail", "inconnu"] as CurtainSupportType[]).map((value) => ({
                  value,
                  label: CURTAIN_SUPPORT_LABELS[value],
                }))}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <CheckoutField
                  id="support-width"
                  label="Largeur de tringle ou de rail"
                  optional
                  hint="Si vous connaissez déjà cette largeur, les autres champs deviennent inutiles."
                  error={showErrors ? (curtainErrors["supportWidth"] ?? undefined) : undefined}
                >
                  <input
                    id="support-width"
                    inputMode="decimal"
                    className={checkoutInputClass}
                    value={curtain.supportWidth}
                    onChange={(event) =>
                      setCurtain((c) => ({ ...c, supportWidth: event.target.value }))
                    }
                  />
                </CheckoutField>

                <CheckoutField
                  id="opening-width"
                  label="Largeur de l'ouverture"
                  hint="Mesurez le tableau de la fenêtre, en centimètres."
                  error={showErrors ? (curtainErrors["openingWidth"] ?? undefined) : undefined}
                >
                  <input
                    id="opening-width"
                    inputMode="decimal"
                    className={checkoutInputClass}
                    value={curtain.openingWidth}
                    onChange={(event) =>
                      setCurtain((c) => ({ ...c, openingWidth: event.target.value }))
                    }
                  />
                </CheckoutField>

                <CheckoutField
                  id="left-extension"
                  label="Débord à gauche"
                  optional
                  hint="Par défaut 15 cm de chaque côté."
                  error={showErrors ? (curtainErrors["leftExtension"] ?? undefined) : undefined}
                >
                  <input
                    id="left-extension"
                    inputMode="decimal"
                    className={checkoutInputClass}
                    value={curtain.leftExtension}
                    onChange={(event) =>
                      setCurtain((c) => ({ ...c, leftExtension: event.target.value }))
                    }
                  />
                </CheckoutField>

                <CheckoutField
                  id="right-extension"
                  label="Débord à droite"
                  optional
                  error={showErrors ? (curtainErrors["rightExtension"] ?? undefined) : undefined}
                >
                  <input
                    id="right-extension"
                    inputMode="decimal"
                    className={checkoutInputClass}
                    value={curtain.rightExtension}
                    onChange={(event) =>
                      setCurtain((c) => ({ ...c, rightExtension: event.target.value }))
                    }
                  />
                </CheckoutField>

                <CheckoutField
                  id="measured-height"
                  label="Hauteur mesurée"
                  hint="Du support jusqu'au point d'arrivée souhaité."
                  error={showErrors ? (curtainErrors["measuredHeight"] ?? undefined) : undefined}
                >
                  <input
                    id="measured-height"
                    inputMode="decimal"
                    className={checkoutInputClass}
                    value={curtain.measuredHeight}
                    onChange={(event) =>
                      setCurtain((c) => ({ ...c, measuredHeight: event.target.value }))
                    }
                  />
                </CheckoutField>
              </div>
            </section>
          )}

          {step === 1 && isBlindProject && (
            <section className="space-y-6">
              <p className="text-sm text-foreground-muted">
                Mesurez trois fois : en haut, au milieu et en bas pour la largeur, puis à gauche,
                au centre et à droite pour la hauteur. Les fenêtres sont rarement parfaitement
                d'équerre.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                {(["Haut", "Milieu", "Bas"] as const).map((label, index) => (
                  <CheckoutField
                    key={label}
                    id={`blind-width-${index}`}
                    label={`Largeur — ${label}`}
                    error={
                      showErrors ? (blindErrors.widths[index] ?? undefined) : undefined
                    }
                  >
                    <input
                      id={`blind-width-${index}`}
                      inputMode="decimal"
                      className={checkoutInputClass}
                      value={blind.widths[index]}
                      onChange={(event) =>
                        setBlind((b) => {
                          const widths = [...b.widths] as [string, string, string];
                          widths[index] = event.target.value;
                          return { ...b, widths };
                        })
                      }
                    />
                  </CheckoutField>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {(["Gauche", "Centre", "Droite"] as const).map((label, index) => (
                  <CheckoutField
                    key={label}
                    id={`blind-height-${index}`}
                    label={`Hauteur — ${label}`}
                    error={
                      showErrors ? (blindErrors.heights[index] ?? undefined) : undefined
                    }
                  >
                    <input
                      id={`blind-height-${index}`}
                      inputMode="decimal"
                      className={checkoutInputClass}
                      value={blind.heights[index]}
                      onChange={(event) =>
                        setBlind((b) => {
                          const heights = [...b.heights] as [string, string, string];
                          heights[index] = event.target.value;
                          return { ...b, heights };
                        })
                      }
                    />
                  </CheckoutField>
                ))}
              </div>
            </section>
          )}

          {step === 2 && !isBlindProject && (
            <section className="space-y-6">
              <MeasurementOptionGroup
                legend="Où doivent s'arrêter vos rideaux ?"
                name="longueur"
                value={curtain.lengthTarget}
                onChange={(lengthTarget) => setCurtain((c) => ({ ...c, lengthTarget }))}
                options={(
                  ["rebord_fenetre", "sous_rebord", "sol"] as CurtainLengthTarget[]
                ).map((value) => ({ value, label: CURTAIN_LENGTH_TARGET_LABELS[value] }))}
              />

              {curtain.lengthTarget === "sol" && (
                <MeasurementOptionGroup
                  legend="Finition au sol"
                  name="finition"
                  value={curtain.floorFinish}
                  onChange={(floorFinish) => setCurtain((c) => ({ ...c, floorFinish }))}
                  options={(
                    ["au_dessus_du_sol", "ras_du_sol", "tombe_cassant"] as CurtainFloorFinish[]
                  ).map((value) => ({ value, label: CURTAIN_FLOOR_FINISH_LABELS[value] }))}
                />
              )}

              <MeasurementOptionGroup
                legend="Ampleur du drapé"
                name="ampleur"
                value={String(curtain.fullnessRatio)}
                onChange={(value) =>
                  setCurtain((c) => ({
                    ...c,
                    fullnessRatio: Number(value) as CurtainFullnessRatio,
                  }))
                }
                options={FULLNESS_RATIOS.map((ratio) => {
                  const key = String(ratio);
                  return {
                    value: key,
                    label: CURTAIN_FULLNESS_LABELS[key] ?? key,
                    ...(CURTAIN_FULLNESS_HINTS[key] ? { hint: CURTAIN_FULLNESS_HINTS[key] } : {}),
                  };
                })}
              />

              <MeasurementOptionGroup
                legend="Nombre de pans"
                name="pans"
                columns={2}
                value={String(curtain.panelCount)}
                onChange={(value) =>
                  setCurtain((c) => ({ ...c, panelCount: Number(value) as CurtainPanelCount }))
                }
                options={[
                  { value: "1", label: "1 pan", hint: "Ouverture d'un seul côté." },
                  { value: "2", label: "2 pans", hint: "Ouverture centrale, le plus courant." },
                ]}
              />
            </section>
          )}

          {step === 2 && isBlindProject && (
            <section className="space-y-4">
              <p className="text-sm text-foreground-muted">
                Rien à préciser pour un store : nous utilisons directement votre position de pose et
                vos trois mesures pour déterminer la dimension produit.
              </p>
              <p className="text-sm">
                Pose retenue :{" "}
                <span className="font-medium">
                  {BLIND_MOUNTING_POSITION_LABELS[blind.mountingPosition]}
                </span>
              </p>
            </section>
          )}

          {step === 3 && result && (
            <MeasurementResultPanel
              result={result}
              summary={summary}
              products={productRecommendations}
              accessories={accessoryRecommendations}
              loading={productsQuery.isLoading || accessoriesQuery.isLoading}
              onRestart={restart}
            />
          )}

          {step === 3 && !result && (
            <p role="alert" className="text-sm text-destructive">
              Certaines mesures sont incomplètes. Revenez à l'étape précédente pour les corriger.
            </p>
          )}
        </div>

        {step < 3 && (
          <div className="mt-10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0}
              className="min-h-[48px] rounded-sm border border-border px-5 text-sm disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={goNext}
              className="min-h-[48px] rounded-sm bg-accent px-6 text-sm text-accent-foreground hover:bg-accent-dark"
            >
              {step === 2 ? "Voir ma recommandation" : "Continuer"}
            </button>
          </div>
        )}

        <p className="mt-8 text-xs text-foreground-muted">{MEASUREMENT_DISCLAIMER}</p>
      </div>
    </SiteLayout>
  );
}
