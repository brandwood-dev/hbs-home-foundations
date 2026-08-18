import { Check } from "lucide-react";
import {
  ACCESSORY_MOUNTING_LABELS,
  BLIND_CONTROL_SIDE_LABELS,
  CHAIR_PAD_FASTENING_LABELS,
  CUSHION_CONTENT_DESCRIPTIONS,
  CUSHION_CONTENT_LABELS,
  BLIND_MECHANISM_COLOR_LABELS,
  BLIND_MECHANISM_COLOR_SWATCHES,
  BLIND_MOUNTING_DESCRIPTIONS,
  BLIND_MOUNTING_LABELS,
  EYELET_COLOR_LABELS,
  EYELET_COLOR_SWATCHES,
  HEADER_DESCRIPTIONS,
  HEADER_LABELS,
  LINING_DESCRIPTIONS,
  LINING_LABELS,
} from "@/domain/product/product.constants";
import type {
  AccessoryMountingType,
  BlindControlSide,
  ChairPadFastening,
  CushionContent,
  BlindMechanismColor,
  BlindMountingType,
  CurtainHeader,
  CurtainLining,
  EyeletColor,
  Product,
  ProductVariant,
} from "@/domain/product/product.types";
import {
  getAxisOptions,
  sizeKeyOf,
  selectionOf,
  type VariantAxis,
} from "@/services/product/product-variants";

interface ProductVariantSelectorsProps {
  product: Product;
  variant: ProductVariant;
  onChange: (axis: VariantAxis, value: string) => void;
}

function Legend({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <span className="eyebrow">{label}</span>
      <span className="text-sm text-foreground-muted">{value}</span>
    </div>
  );
}

function optionClass(selected: boolean, available: boolean) {
  const base =
    "min-h-[44px] rounded-sm border px-3 py-2 text-sm transition-colors focus-visible:outline-2";
  if (selected) return `${base} border-accent bg-accent text-accent-foreground`;
  if (!available)
    return `${base} border-border text-foreground-muted line-through opacity-60 hover:border-taupe`;
  return `${base} border-border hover:border-accent`;
}

export function ProductVariantSelectors({
  product,
  variant,
  onChange,
}: ProductVariantSelectorsProps) {
  const selection = selectionOf(variant);
  const colorOptions = getAxisOptions(product.variants, "colorId", selection);
  const sizeOptions = getAxisOptions(product.variants, "sizeKey", selection);
  const headerOptions = getAxisOptions(product.variants, "curtainHeader", selection);
  const eyeletOptions = getAxisOptions(product.variants, "eyeletColor", selection);
  const liningOptions = getAxisOptions(product.variants, "lining", selection);
  const mountingOptions = getAxisOptions(product.variants, "blindMountingType", selection);
  const controlSideOptions = getAxisOptions(product.variants, "blindControlSide", selection);
  const mechanismOptions = getAxisOptions(product.variants, "blindMechanismColor", selection);
  const contentOptions = getAxisOptions(product.variants, "cushionContent", selection);
  const fasteningOptions = getAxisOptions(product.variants, "chairPadFastening", selection);
  const accessoryMountingOptions = getAxisOptions(
    product.variants,
    "accessoryMountingType",
    selection,
  );

  const sizeLabels = new Map<string, string>();
  for (const item of product.variants) {
    if (item.sizeLabel) sizeLabels.set(sizeKeyOf(item), item.sizeLabel);
  }
  const labelForSize = (key: string) => sizeLabels.get(key) ?? `${key.replace("x", " × ")} cm`;

  const activeColor = product.colors.find((color) => color.id === variant.colorId);
  const sizeFieldLabel =
    product.category === "stores"
      ? "Dimensions du store (l × h)"
      : product.category === "accessoires"
        ? "Longueur"
        : product.category === "coussins" || product.category === "galettes_de_chaise"
          ? "Format"
          : "Dimensions (l × h)";

  return (
    <div className="space-y-6">
      <fieldset>
        <Legend label="Coloris" value={activeColor?.name ?? ""} />
        <div className="mt-2 flex flex-wrap gap-2">
          {colorOptions.map((option) => {
            const color = product.colors.find((item) => item.id === option.value);
            if (!color) return null;
            const selected = color.id === variant.colorId;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => onChange("colorId", color.id)}
                aria-pressed={selected}
                aria-label={`Coloris ${color.name}${option.available ? "" : " — combinaison à ajuster"}`}
                title={color.name}
                className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                  selected ? "border-accent ring-2 ring-accent ring-offset-2" : "border-border"
                } ${option.available ? "" : "opacity-50"}`}
              >
                <span
                  className="h-8 w-8 rounded-full border border-border"
                  style={{ backgroundColor: color.hex }}
                />
                {selected && (
                  <Check
                    className="absolute h-4 w-4 text-surface mix-blend-difference"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <Legend
          label={sizeFieldLabel}
          value={variant.sizeLabel ?? `${variant.widthCm} × ${variant.heightCm} cm`}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {sizeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange("sizeKey", option.value)}
              aria-pressed={option.value === sizeKeyOf(variant)}
              className={optionClass(option.value === sizeKeyOf(variant), option.available)}
            >
              {labelForSize(option.value)}
            </button>
          ))}
        </div>
      </fieldset>

      {contentOptions.length > 1 && variant.cushionContent && (
        <fieldset>
          <Legend
            label="Contenu"
            value={CUSHION_CONTENT_DESCRIPTIONS[variant.cushionContent]}
          />
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {contentOptions.map((option) => {
              const value = option.value as CushionContent;
              const selected = value === variant.cushionContent;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange("cushionContent", value)}
                  aria-pressed={selected}
                  className={`text-left ${optionClass(selected, option.available)}`}
                >
                  <span className="block font-medium">{CUSHION_CONTENT_LABELS[value]}</span>
                  <span
                    className={`block text-xs ${selected ? "text-accent-foreground/80" : "text-foreground-muted"}`}
                  >
                    {CUSHION_CONTENT_DESCRIPTIONS[value]}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {fasteningOptions.length > 1 && variant.chairPadFastening && (
        <fieldset>
          <Legend
            label="Fixation"
            value={CHAIR_PAD_FASTENING_LABELS[variant.chairPadFastening]}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {fasteningOptions.map((option) => {
              const value = option.value as ChairPadFastening;
              const selected = value === variant.chairPadFastening;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange("chairPadFastening", value)}
                  aria-pressed={selected}
                  className={optionClass(selected, option.available)}
                >
                  {CHAIR_PAD_FASTENING_LABELS[value]}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {accessoryMountingOptions.length > 1 && variant.accessoryMountingType && (
        <fieldset>
          <Legend
            label="Type de pose"
            value={ACCESSORY_MOUNTING_LABELS[variant.accessoryMountingType]}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {accessoryMountingOptions.map((option) => {
              const value = option.value as AccessoryMountingType;
              const selected = value === variant.accessoryMountingType;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange("accessoryMountingType", value)}
                  aria-pressed={selected}
                  className={optionClass(selected, option.available)}
                >
                  {ACCESSORY_MOUNTING_LABELS[value]}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {headerOptions.length > 0 && variant.curtainHeader && (
        <fieldset>
          <Legend label="Type de tête" value={HEADER_DESCRIPTIONS[variant.curtainHeader]} />
          <div className="mt-2 flex flex-wrap gap-2">
            {headerOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange("curtainHeader", option.value)}
                aria-pressed={option.value === variant.curtainHeader}
                className={optionClass(option.value === variant.curtainHeader, option.available)}
              >
                {HEADER_LABELS[option.value as CurtainHeader]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {eyeletOptions.length > 0 && variant.curtainHeader === "oeillets" && (
        <fieldset>
          <Legend
            label="Finition des œillets"
            value={variant.eyeletColor ? EYELET_COLOR_LABELS[variant.eyeletColor] : ""}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {eyeletOptions.map((option) => {
              const value = option.value as EyeletColor;
              const selected = value === variant.eyeletColor;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange("eyeletColor", value)}
                  aria-pressed={selected}
                  className={`flex items-center gap-2 ${optionClass(selected, option.available)}`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: EYELET_COLOR_SWATCHES[value] }}
                    aria-hidden="true"
                  />
                  {EYELET_COLOR_LABELS[value]}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {liningOptions.length > 1 && variant.lining && (
        <fieldset>
          <Legend label="Doublure" value={LINING_DESCRIPTIONS[variant.lining]} />
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {liningOptions.map((option) => {
              const value = option.value as CurtainLining;
              const selected = value === variant.lining;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange("lining", value)}
                  aria-pressed={selected}
                  className={`text-left ${optionClass(selected, option.available)}`}
                >
                  <span className="block font-medium">{LINING_LABELS[value]}</span>
                  <span
                    className={`block text-xs ${selected ? "text-accent-foreground/80" : "text-foreground-muted"}`}
                  >
                    {LINING_DESCRIPTIONS[value]}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {mountingOptions.length > 1 && variant.blindMountingType && (
        <fieldset>
          <Legend
            label="Type de pose"
            value={BLIND_MOUNTING_DESCRIPTIONS[variant.blindMountingType]}
          />
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {mountingOptions.map((option) => {
              const value = option.value as BlindMountingType;
              const selected = value === variant.blindMountingType;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange("blindMountingType", value)}
                  aria-pressed={selected}
                  className={`text-left ${optionClass(selected, option.available)}`}
                >
                  <span className="block font-medium">{BLIND_MOUNTING_LABELS[value]}</span>
                  <span
                    className={`block text-xs ${selected ? "text-accent-foreground/80" : "text-foreground-muted"}`}
                  >
                    {BLIND_MOUNTING_DESCRIPTIONS[value]}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {controlSideOptions.length > 1 && variant.blindControlSide && (
        <fieldset>
          <Legend
            label="Côté de manœuvre"
            value={BLIND_CONTROL_SIDE_LABELS[variant.blindControlSide]}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {controlSideOptions.map((option) => {
              const value = option.value as BlindControlSide;
              const selected = value === variant.blindControlSide;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange("blindControlSide", value)}
                  aria-pressed={selected}
                  className={optionClass(selected, option.available)}
                >
                  {BLIND_CONTROL_SIDE_LABELS[value]}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {mechanismOptions.length > 1 && variant.blindMechanismColor && (
        <fieldset>
          <Legend
            label="Finition du mécanisme"
            value={BLIND_MECHANISM_COLOR_LABELS[variant.blindMechanismColor]}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {mechanismOptions.map((option) => {
              const value = option.value as BlindMechanismColor;
              const selected = value === variant.blindMechanismColor;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange("blindMechanismColor", value)}
                  aria-pressed={selected}
                  className={`flex items-center gap-2 ${optionClass(selected, option.available)}`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: BLIND_MECHANISM_COLOR_SWATCHES[value] }}
                    aria-hidden="true"
                  />
                  {BLIND_MECHANISM_COLOR_LABELS[value]}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
