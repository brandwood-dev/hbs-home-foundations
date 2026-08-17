import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { storeConfig } from "@/config/store.config";
import { MATERIAL_LABELS, OPACITY_LABELS } from "@/domain/product/product.constants";
import type { Product, ProductVariant } from "@/domain/product/product.types";

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
      {items.map((item) => (
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

  return (
    <Accordion type="multiple" defaultValue={["description"]} className="w-full">
      <AccordionItem value="description">
        <AccordionTrigger className="text-base">Description</AccordionTrigger>
        <AccordionContent>
          <p className="text-sm leading-relaxed text-foreground-muted">{product.longDescription}</p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="composition">
        <AccordionTrigger className="text-base">Matière et composition</AccordionTrigger>
        <AccordionContent>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-foreground-muted">Composition</dt>
              <dd>{details.composition}</dd>
            </div>
            <div>
              <dt className="text-foreground-muted">Grammage</dt>
              <dd>{`${details.weightGsm} g/m²`}</dd>
            </div>
            <div>
              <dt className="text-foreground-muted">Matière</dt>
              <dd>{MATERIAL_LABELS[product.material]}</dd>
            </div>
            <div>
              <dt className="text-foreground-muted">Occultation</dt>
              <dd>{OPACITY_LABELS[product.opacityLevel]}</dd>
            </div>
            <div>
              <dt className="text-foreground-muted">Référence</dt>
              <dd>{variant.sku}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-foreground-muted">{details.originNote}</p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="features">
        <AccordionTrigger className="text-base">Caractéristiques</AccordionTrigger>
        <AccordionContent>
          <List items={details.features} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="install">
        <AccordionTrigger className="text-base">Pose et mesures</AccordionTrigger>
        <AccordionContent>
          <List items={details.installationNotes} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="care">
        <AccordionTrigger className="text-base">Entretien</AccordionTrigger>
        <AccordionContent>
          <List items={details.care} />
        </AccordionContent>
      </AccordionItem>

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
