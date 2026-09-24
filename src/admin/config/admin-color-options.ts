import type { AdminAttribute } from "@/admin/types/admin.types";
import { COLORS } from "@/domain/product/product-colors";

export interface AdminColorOption {
  value: string;
  label: string;
  hex?: string;
}

/** Coloris standards disponibles même si l'API n'a pas encore provisionné l'attribut. */
export const BRONZE_ADMIN_COLOR_OPTION: AdminColorOption = {
  value: COLORS.bronze.id,
  label: COLORS.bronze.name,
  hex: COLORS.bronze.hex,
};

export const DEFAULT_ADMIN_COLOR_OPTIONS: AdminColorOption[] = Object.values(COLORS)
  .filter((color) => color.id !== BRONZE_ADMIN_COLOR_OPTION.value)
  .map((color) => ({
    value: color.id,
    label: color.name,
    hex: color.hex,
  }));

/** Coloris métier proposés exclusivement pour les tringles à rideaux. */
export const TRINGLES_ADMIN_COLOR_OPTIONS: AdminColorOption[] = [
  BRONZE_ADMIN_COLOR_OPTION,
  { value: "c-dore", label: "Doré", hex: COLORS.dore.hex },
  { value: "c-argent", label: "Argenté", hex: COLORS.argent.hex },
  { value: "c-noir", label: "Noir", hex: COLORS.noir.hex },
];

/** Ajoute le bronze uniquement aux familles qui le proposent explicitement. */
export function ensureBronzeAdminColorOption(
  options: readonly AdminColorOption[],
): AdminColorOption[] {
  const hasBronze = options.some((option) => {
    const token = `${option.value} ${option.label}`
      .trim()
      .toLocaleLowerCase("fr")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "");
    return token.includes("c-bronze") || token.split(/\s+/).includes("bronze");
  });
  return hasBronze ? [...options] : [...options, BRONZE_ADMIN_COLOR_OPTION];
}

/**
 * Résout les choix affichés par le formulaire produit.
 *
 * L'API reste prioritaire afin que les coloris gérés par l'admin soient pris en
 * compte. La palette standard évite toutefois un menu vide pendant le
 * provisionnement initial ou si l'attribut `color` a été désactivé par erreur.
 * Les slugs connus sont normalisés vers les identifiants publics `c-*`, ce qui
 * maintient la compatibilité avec les variantes déjà présentes dans le catalogue.
 */
export function resolveAdminColorOptions(
  attributes: readonly AdminAttribute[],
): AdminColorOption[] {
  const colorAttribute = attributes.find(
    (attribute) =>
      attribute.isActive !== false &&
      (attribute.key.toLowerCase() === "color" || attribute.key.toLowerCase() === "colors"),
  );
  const canonicalByToken = new Map<string, (typeof COLORS)[keyof typeof COLORS]>();
  for (const color of Object.values(COLORS)) {
    canonicalByToken.set(color.id.toLowerCase(), color);
    canonicalByToken.set(color.slug.toLowerCase(), color);
  }

  const configured = (colorAttribute?.values ?? [])
    .filter((value) => value.isActive !== false)
    .map((value) => {
      const rawValue = value.slug.trim();
      const canonical = canonicalByToken.get(rawValue.toLowerCase());
      const hex = value.hex ?? canonical?.hex;
      return {
        value: canonical?.id ?? rawValue,
        label: value.label.trim() || canonical?.name || rawValue,
        ...(hex ? { hex } : {}),
      };
    })
    .filter((value) => value.value.length > 0);

  const unique = [...new Map(configured.map((option) => [option.value, option])).values()];
  return unique.length > 0 ? unique : DEFAULT_ADMIN_COLOR_OPTIONS;
}
