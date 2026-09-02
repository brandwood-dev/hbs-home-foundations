export interface StoreSettings {
  store: {
    name: string;
    currency: string;
    language: string;
    timezone: string;
    address: string;
  };
  shipping: {
    standardFeeMinor: number;
    freeShippingThresholdMinor: number;
    estimatedDeliveryLabel: string;
    storePickupEnabled: boolean;
    pickupAddress: string;
  };
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
    openingHours: string;
  };
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImageUrl: string;
  };
  features: {
    checkout: boolean;
    favorites: boolean;
    reviews: boolean;
    customMade: boolean;
    professionals: boolean;
    orderTracking: boolean;
    customerAccounts: boolean;
    onlinePayment: boolean;
  };
}

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

/** Valeurs de secours utilisées avant le chargement des paramètres publics. */
export const storeSettingsFallback: StoreSettings = {
  store: {
    name: storeConfig.brandName,
    currency: storeConfig.currency,
    language: "fr",
    timezone: "Africa/Tunis",
    address: storeConfig.storeAddress,
  },
  shipping: {
    standardFeeMinor: storeConfig.standardShippingFeeMinor,
    freeShippingThresholdMinor: storeConfig.freeShippingThresholdMinor,
    estimatedDeliveryLabel: storeConfig.estimatedDeliveryLabel,
    storePickupEnabled: storeConfig.storePickupEnabled,
    pickupAddress: storeConfig.storeAddress,
  },
  contact: {
    phone: storeConfig.customerServicePhone,
    email: storeConfig.customerServiceEmail,
    whatsapp: storeConfig.whatsappNumber,
    openingHours: "",
  },
  social: storeConfig.socialLinks,
  seo: {
    defaultTitle: storeConfig.brandName,
    defaultDescription: "",
    ogImageUrl: "",
  },
  features: {
    checkout: true,
    favorites: true,
    reviews: false,
    customMade: true,
    professionals: false,
    orderTracking: true,
    customerAccounts: false,
    onlinePayment: false,
  },
};

export function formatMinor(minor: number): string {
  return `${(minor / 1000).toFixed(0)} DT`;
}
