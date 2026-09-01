import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { storeConfig } from "@/config/store.config";
import { MATERIAL_LABELS, OPACITY_LABELS } from "@/domain/product/product.constants";
import type { Product, ProductVariant } from "@/domain/product/product.types";

function isMeaningfulText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function List({ items }: { items: readonly string[] }) {
  const visibleItems = items.filter((item) => isMeaningfulText(item));
  if (visibleItems.length === 0) return null;

  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
      {visibleItems.map((item) => (
        <li key={item}>{item}</li>
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
  const { details } = product;
  const hasDescription = isMeaningfulText(product.longDescription);
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
            <p className="text-sm leading-relaxed text-foreground-muted">
              {product.longDescription}
            </p>
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

      {details.features.length > 0 ? (
        <AccordionItem value="features">
          <AccordionTrigger className="text-base">Caractéristiques</AccordionTrigger>
          <AccordionContent>
            <List items={details.features} />
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
              `Livraison partout en Tunisie en ${storeConfig.estimatedDeliveryLabel}`,
              "Paiement à la livraison disponible",
              `Retrait en boutique : ${storeConfig.storeAddress}`,
              "Échange ou retour sous 7 jours, produit non lavé et dans son emballage",
            ]}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
