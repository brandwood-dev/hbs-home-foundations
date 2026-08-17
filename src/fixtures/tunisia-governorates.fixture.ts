/** Les 24 gouvernorats tunisiens — source unique pour le checkout. */
export const TUNISIA_GOVERNORATES = [
  { value: "ariana", label: "Ariana" },
  { value: "beja", label: "Béja" },
  { value: "ben-arous", label: "Ben Arous" },
  { value: "bizerte", label: "Bizerte" },
  { value: "gabes", label: "Gabès" },
  { value: "gafsa", label: "Gafsa" },
  { value: "jendouba", label: "Jendouba" },
  { value: "kairouan", label: "Kairouan" },
  { value: "kasserine", label: "Kasserine" },
  { value: "kebili", label: "Kébili" },
  { value: "kef", label: "Le Kef" },
  { value: "mahdia", label: "Mahdia" },
  { value: "manouba", label: "La Manouba" },
  { value: "medenine", label: "Médenine" },
  { value: "monastir", label: "Monastir" },
  { value: "nabeul", label: "Nabeul" },
  { value: "sfax", label: "Sfax" },
  { value: "sidi-bouzid", label: "Sidi Bouzid" },
  { value: "siliana", label: "Siliana" },
  { value: "sousse", label: "Sousse" },
  { value: "tataouine", label: "Tataouine" },
  { value: "tozeur", label: "Tozeur" },
  { value: "tunis", label: "Tunis" },
  { value: "zaghouan", label: "Zaghouan" },
] as const;

export type GovernorateValue = (typeof TUNISIA_GOVERNORATES)[number]["value"];

export const GOVERNORATE_VALUES = TUNISIA_GOVERNORATES.map((item) => item.value);

export function getGovernorateLabel(value: string): string {
  return TUNISIA_GOVERNORATES.find((item) => item.value === value)?.label ?? value;
}
