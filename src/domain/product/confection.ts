import type { ProductCategory } from "@/domain/product/product.types";

export type ConfectionKey = "oeillets_argent" | "oeillets_dore" | "galon_fronceur" | "wave";

export interface ConfectionOption {
  key: ConfectionKey;
  label: string;
  description: string;
  imageUrl: string;
  priceDeltaMinor?: number;
}

/** Configuration héritée par défaut par les rideaux et les voilages. */
export const DEFAULT_CONFECTION_OPTIONS: readonly ConfectionOption[] = [
  {
    key: "oeillets_argent",
    label: "Œillets argentés",
    description: "Anneaux métalliques argentés, à glisser sur une tringle.",
    imageUrl: "/images/confections/oeillets-argent.webp",
  },
  {
    key: "oeillets_dore",
    label: "Œillets dorés",
    description: "Anneaux métalliques dorés, à glisser sur une tringle.",
    imageUrl: "/images/confections/oeillets-dore.webp",
  },
  {
    key: "galon_fronceur",
    label: "Galon fronceur",
    description: "Ruban à froncer pour obtenir des plis souples et réguliers.",
    imageUrl: "/images/confections/galon-fronceur.webp",
  },
  {
    key: "wave",
    label: "Wave — rail coulissant",
    description: "Finition Wave adaptée à un rail coulissant au plafond.",
    imageUrl: "/images/confections/wave.png",
  },
];

export function isCurtainFamily(category: ProductCategory | string): boolean {
  return category === "rideaux" || category === "voilages";
}

export function confectionOptionsFor(
  category: ProductCategory | string,
  options?: readonly ConfectionOption[],
): readonly ConfectionOption[] {
  if (!isCurtainFamily(category)) return [];
  return options && options.length > 0 ? options : DEFAULT_CONFECTION_OPTIONS;
}

export function confectionKeyForVariant(variant: {
  curtainHeader?: string;
  eyeletColor?: string;
}): ConfectionKey | undefined {
  if (variant.curtainHeader === "oeillets") {
    if (variant.eyeletColor === "dore") return "oeillets_dore";
    if (variant.eyeletColor === "argent") return "oeillets_argent";
  }
  if (variant.curtainHeader === "galon_fronceur") return "galon_fronceur";
  if (variant.curtainHeader === "rail" || variant.curtainHeader === "wave") return "wave";
  return undefined;
}
