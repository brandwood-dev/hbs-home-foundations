import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FURNITURE_ASSEMBLY_LABELS,
  FURNITURE_ROOM_LABELS,
  FURNITURE_STYLE_LABELS,
  FURNITURE_TYPE_LABELS,
  MATERIAL_LABELS,
  OPACITY_LABELS,
  SHIPPING_PROFILE_LABELS,
} from "@/domain/product/product.constants";
import type { Product, ProductVariant } from "@/domain/product/product.types";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { hasRichTextContent, RichTextRenderer } from "@/lib/content/rich-text";

function isMeaningfulText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

const ATTRIBUTE_LABELS: Record<string, string> = {
  furniture_type: "Type de mobilier",
  furniture_style: "Style",
  style: "Style",
  upholstery: "Revêtement",
  frame_material: "Matière de structure",
  leg_material: "Matière des pieds",
  seat_comfort: "Confort d'assise",
  number_of_seats: "Nombre de places",
  assembly_level: "Montage",
  assembly_time: "Temps de montage",
  shipping_profile: "Profil de livraison",
  width_cm: "Largeur",
  height_cm: "Hauteur totale",
  storage_volume_l: "Volume de rangement",
};

const ATTRIBUTE_VALUE_LABELS: Record<string, Record<string, string>> = {
  furniture_type: FURNITURE_TYPE_LABELS,
  furniture_style: FURNITURE_STYLE_LABELS,
  style: FURNITURE_STYLE_LABELS,
  assembly_level: FURNITURE_ASSEMBLY_LABELS,
  shipping_profile: SHIPPING_PROFILE_LABELS,
  upholstery: {
    lin: "Lin",
    velours: "Velours",
    boucle: "Bouclette",
    coton: "Coton",
    polyester: "Polyester",
    cuir: "Cuir ou simili cuir",
    cannage: "Cannage",
    sans_revetement: "Sans revêtement",
    autre: "Autre",
  },
  frame_material: {
    bois_massif: "Bois massif",
    bois_et_metal: "Bois et métal",
    metal: "Métal",
    acier_laque: "Acier laqué",
    panneaux_mdf: "Panneaux MDF ou aggloméré",
    rotin: "Rotin ou cannage",
    autre: "Autre",
  },
  leg_material: {
    bois: "Bois",
    metal: "Métal",
    plastique: "Plastique",
    mixte: "Bois et métal",
    sans_pieds: "Sans pieds",
    autre: "Autre",
  },
  seat_comfort: {
    ferme: "Ferme",
    equilibre: "Équilibré",
    moelleux: "Moelleux",
    tres_moelleux: "Très moelleux",
    autre: "Autre",
  },
  features: {
    housse_dehoussable: "Housse déhoussable",
    assise_haute_resilience: "Assise haute résilience",
    accoudoir_reversible: "Accoudoir réversible",
    rangement_integre: "Rangement intégré",
    portes: "Portes",
    tiroirs: "Tiroirs",
    empilable: "Empilable",
    pliable: "Pliable",
    fixation_murale: "Fixation murale",
    livre_monte: "Livré monté",
    autre: "Autre",
  },
};

const HIDDEN_ATTRIBUTE_KEYS = new Set([
  "material",
  "rooms",
  "furniture_rooms",
  "features",
  "care",
  "installation",
]);

const ATTRIBUTE_UNITS: Record<string, string> = {
  assembly_time: "min",
  width_cm: "cm",
  height_cm: "cm",
  storage_volume_l: "L",
};

function humanizeAttributeValue(value: string): string {
  const normalized = value.trim().replace(/_/g, " ");
  return normalized ? normalized.charAt(0).toLocaleUpperCase("fr-FR") + normalized.slice(1) : "";
}

function formatAttributeValue(key: string, value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => formatAttributeValue(key, item))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "number" && Number.isFinite(value)) {
    const unit = ATTRIBUTE_UNITS[key];
    return unit ? `${value} ${unit}` : String(value);
  }
  if (typeof value !== "string" || value.trim().length === 0) return "";
  return ATTRIBUTE_VALUE_LABELS[key]?.[value] ?? humanizeAttributeValue(value);
}

function productAttributeEntries(product: Product): Array<{ label: string; value: string }> {
  const attributes = product.attributes ?? {};
  const entries = Object.entries(attributes)
    .filter(([key]) => !HIDDEN_ATTRIBUTE_KEYS.has(key))
    .map(([key, value]) => ({
      label: ATTRIBUTE_LABELS[key] ?? humanizeAttributeValue(key),
      value: formatAttributeValue(key, value),
    }))
    .filter((entry) => entry.value.length > 0);

  const canonicalEntries: Array<[string, unknown]> = [
    ["furniture_type", product.furnitureType],
    ["style", product.furnitureStyle],
    ["assembly_level", product.furnitureAssembly],
  ];
  for (const [key, value] of canonicalEntries) {
    if (value === undefined || attributes[key] !== undefined) continue;
    const formatted = formatAttributeValue(key, value);
    if (formatted) entries.push({ label: ATTRIBUTE_LABELS[key] ?? key, value: formatted });
  }
  return entries;
}

function List({ items }: { items: readonly string[] }) {
  const visibleItems = items.filter((item) => isMeaningfulText(item));
  if (visibleItems.length === 0) return null;

  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
      {visibleItems.map((item) => (
        <li key={item} className="whitespace-pre-line">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ProductDetailsAccordion({
  product,
  variant,
}: {
  product: Product;
  variant: ProductVariant;
}) {
  const { data: storeSettings } = useStoreSettings();
  const { details } = product;
  const attributeEntries = productAttributeEntries(product);
  const featureItems = details.features.map((feature) => formatAttributeValue("features", feature));
  const hasCharacteristics = attributeEntries.length > 0 || featureItems.some(Boolean);
  const hasDescription = hasRichTextContent(product.longDescription);
  const hasComposition = isMeaningfulText(details.composition);
  const hasWeight = typeof details.weightGsm === "number" && details.weightGsm > 0;
  const materialLabel = MATERIAL_LABELS[product.material];
  const hasMaterial = isMeaningfulText(materialLabel);
  const opacityLabel = product.opacityLevel ? OPACITY_LABELS[product.opacityLevel] : undefined;
  const hasOpacity = isMeaningfulText(opacityLabel);
  const hasReference = isMeaningfulText(variant.sku);
  const hasOriginNote = isMeaningfulText(details.originNote);
  const hasCompositionDetails =
    hasComposition || hasWeight || hasMaterial || hasOpacity || hasReference || hasOriginNote;

  return (
    <Accordion
      type="multiple"
      defaultValue={hasDescription ? ["description"] : []}
      className="w-full"
    >
      {hasDescription ? (
        <AccordionItem value="description">
          <AccordionTrigger className="text-base">Description</AccordionTrigger>
          <AccordionContent>
            <RichTextRenderer
              value={product.longDescription}
              className="text-sm leading-relaxed text-foreground-muted"
            />
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {hasCompositionDetails ? (
        <AccordionItem value="composition">
          <AccordionTrigger className="text-base">Matière et composition</AccordionTrigger>
          <AccordionContent>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {hasComposition ? (
                <div>
                  <dt className="text-foreground-muted">Composition</dt>
                  <dd>{details.composition}</dd>
                </div>
              ) : null}
              {hasWeight ? (
                <div>
                  <dt className="text-foreground-muted">Grammage</dt>
                  <dd>{`${details.weightGsm} g/m²`}</dd>
                </div>
              ) : null}
              {hasMaterial ? (
                <div>
                  <dt className="text-foreground-muted">Matière</dt>
                  <dd>{materialLabel}</dd>
                </div>
              ) : null}
              {hasOpacity ? (
                <div>
                  <dt className="text-foreground-muted">Occultation</dt>
                  <dd>{opacityLabel}</dd>
                </div>
              ) : null}
              {hasReference ? (
                <div>
                  <dt className="text-foreground-muted">Référence</dt>
                  <dd>{variant.sku}</dd>
                </div>
              ) : null}
            </dl>
            {hasOriginNote ? (
              <p className="mt-3 text-xs text-foreground-muted">{details.originNote}</p>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {hasCharacteristics ? (
        <AccordionItem value="features">
          <AccordionTrigger className="text-base">Caractéristiques</AccordionTrigger>
          <AccordionContent>
            {attributeEntries.length > 0 ? (
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                {attributeEntries.map((entry) => (
                  <div key={`${entry.label}-${entry.value}`}>
                    <dt className="text-foreground-muted">{entry.label}</dt>
                    <dd>{entry.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {featureItems.some(Boolean) ? (
              <div className={attributeEntries.length > 0 ? "mt-4" : undefined}>
                <p className="mb-2 text-sm text-foreground-muted">Fonctionnalités</p>
                <List items={featureItems.filter(Boolean)} />
              </div>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {details.recommendedRooms && details.recommendedRooms.length > 0 ? (
        <AccordionItem value="rooms">
          <AccordionTrigger className="text-base">Pièces recommandées</AccordionTrigger>
          <AccordionContent>
            <List items={details.recommendedRooms} />
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {details.installationNotes.length > 0 ? (
        <AccordionItem value="install">
          <AccordionTrigger className="text-base">Pose et mesures</AccordionTrigger>
          <AccordionContent>
            <List items={details.installationNotes} />
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {details.care.length > 0 ? (
        <AccordionItem value="care">
          <AccordionTrigger className="text-base">Entretien</AccordionTrigger>
          <AccordionContent>
            <List items={details.care} />
          </AccordionContent>
        </AccordionItem>
      ) : null}

      <AccordionItem value="shipping">
        <AccordionTrigger className="text-base">Livraison et retours</AccordionTrigger>
        <AccordionContent>
          <List
            items={[
              `Livraison partout en Tunisie — ${storeSettings.shipping.estimatedDeliveryLabel}`,
              "Paiement à la livraison disponible",
              `Retrait en boutique : ${storeSettings.shipping.pickupAddress || storeSettings.store.address}`,
              "Échange ou retour sous 7 jours, produit non lavé et dans son emballage",
            ]}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
