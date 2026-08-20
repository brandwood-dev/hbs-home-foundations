export const storeConfig = {
  brandName: "HBS HOME",
  tagline: "Rideaux, voilages et décoration textile",
  locale: "fr-TN",
  currency: "TND",

  standardShippingFeeMinor: 7000,
  freeShippingThresholdMinor: 200000,
  estimatedDeliveryLabel: "24 à 48 heures",

  cashOnDeliveryEnabled: true,
  storePickupEnabled: true,

  whatsappNumber: "+216 00 000 000",
  whatsappMessage: "Bonjour HBS HOME, j'aimerais avoir des informations.",
  customerServicePhone: "",
  customerServiceEmail: "",

  storeAddress: "Ras Jebel, Bizerte, Tunisie",

  socialLinks: {
    facebook: "",
    instagram: "",
    tiktok: "",
  },
} as const;

export function formatMinor(minor: number): string {
  return `${(minor / 1000).toFixed(0)} DT`;
}
