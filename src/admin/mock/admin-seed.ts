import { demoProducts } from "@/fixtures/products.fixture";
import { TUNISIA_GOVERNORATES } from "@/fixtures/tunisia-governorates.fixture";
import { storeConfig } from "@/config/store.config";
import { HEADER_LABELS, MATERIAL_LABELS } from "@/domain/product/product.constants";
import type {
  AdminAttribute,
  AdminAuditLog,
  AdminCategory,
  AdminContent,
  AdminCustomer,
  AdminMockDatabase,
  AdminOrder,
  AdminOrderItem,
  AdminOrderStatus,
  AdminProduct,
  AdminPromotion,
  AdminSettings,
  AdminUser,
  AdminVariant,
  StockMovement,
} from "@/admin/types/admin.types";
import { slugify } from "@/admin/utils/admin.utils";

/**
 * Jeu de démonstration du back-office.
 * Construit à partir du catalogue public, sans modifier ses structures.
 * Généré paresseusement (jamais au niveau module) : le worker SSR interdit
 * les opérations non déterministes au chargement.
 */

/** PRNG déterministe : les données de démo sont stables entre serveur et client. */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const SEED_NOW = Date.parse("2026-08-01T09:00:00.000Z");

function isoDaysAgo(days: number, hourOffset = 0): string {
  return new Date(SEED_NOW - days * 86400000 + hourOffset * 3600000).toISOString();
}

const CATEGORY_SEED: Array<{ name: string; parent?: string }> = [
  { name: "Rideaux" },
  { name: "Voilages" },
  { name: "Stores" },
  { name: "Coussins" },
  { name: "Galettes de chaise" },
  { name: "Tringles" },
  { name: "Rails" },
  { name: "Supports", parent: "tringles" },
  { name: "Embouts", parent: "tringles" },
  { name: "Embrasses" },
  { name: "Attaches magnétiques", parent: "embrasses" },
  { name: "Accessoires" },
  { name: "Sur mesure" },
];

function buildCategories(): AdminCategory[] {
  return CATEGORY_SEED.map((entry, index) => {
    const slug = slugify(entry.name);
    return {
      id: `cat_${slug}`,
      name: entry.name,
      slug,
      ...(entry.parent ? { parentId: `cat_${entry.parent}` } : {}),
      order: index + 1,
      isActive: true,
      description: `Sélection HBS HOME — ${entry.name.toLowerCase()}.`,
      seoTitle: `${entry.name} | HBS HOME`,
      seoDescription: `Découvrez notre sélection ${entry.name.toLowerCase()} chez HBS HOME.`,
    };
  });
}

function variantLabel(variant: AdminVariant): string {
  return `${variant.colorLabel} · ${variant.widthCm}×${variant.heightCm} cm`;
}

function buildProducts(): AdminProduct[] {
  const random = createRandom(20260801);

  return demoProducts.map((product, productIndex) => {
    const variants: AdminVariant[] = product.variants.map((variant, index) => {
      const color = product.colors.find((item) => item.id === variant.colorId);
      const stock = variant.availability === "out_of_stock" ? 0 : variant.availableQuantity;
      const cost = Math.round(variant.price.amountMinor * 0.55);
      return {
        id: variant.id,
        sku: variant.sku,
        colorId: variant.colorId,
        colorLabel: color?.name ?? "Coloris",
        widthCm: variant.widthCm,
        heightCm: variant.heightCm,
        curtainHeader: variant.curtainHeader,
        ...(variant.eyeletColor ? { eyeletColor: variant.eyeletColor } : {}),
        lining: variant.lining,
        priceMinor: variant.price.amountMinor,
        ...(variant.compareAtPrice
          ? { compareAtPriceMinor: variant.compareAtPrice.amountMinor }
          : {}),
        costMinor: cost,
        stock,
        lowStockThreshold: 5,
        availability: variant.availability,
        imageUrl: variant.imageUrl,
        isActive: index < 40,
      };
    });

    const status =
      productIndex % 11 === 0 ? "draft" : productIndex % 17 === 0 ? "archived" : "published";

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      reference: product.reference,
      categoryId: "cat_rideaux",
      sellingMode:
        product.sellingMode === "pack"
          ? "pack"
          : product.sellingMode === "pair"
            ? "pair"
            : product.sellingMode === "ready_made"
              ? "ready_made"
              : "single_panel",
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      brand: "HBS HOME",
      tags: [product.material, product.opacityLevel],
      rooms: random() > 0.5 ? ["salon", "chambre"] : ["salon"],
      style: "contemporain",
      material: product.material,
      opacityLevel: product.opacityLevel,
      status,
      imageUrl: product.variants[0]?.imageUrl ?? "",
      images: product.images.map((image) => image.url),
      variants,
      seoTitle: product.seo.title,
      seoDescription: product.seo.description,
      publicSlug: product.slug,
      createdAt: product.createdAt,
      updatedAt: isoDaysAgo(productIndex % 30),
    } satisfies AdminProduct;
  });
}

function buildAttributes(products: AdminProduct[]): AdminAttribute[] {
  const colors = new Map<string, { label: string; hex: string; family: string }>();
  for (const product of demoProducts) {
    for (const color of product.colors) {
      colors.set(color.slug, { label: color.name, hex: color.hex, family: color.family });
    }
  }

  const simple = (
    id: string,
    name: string,
    key: string,
    order: number,
    labels: Record<string, string> | string[],
    options: { filterable?: boolean; variantAxis?: boolean } = {},
  ): AdminAttribute => {
    const entries = Array.isArray(labels)
      ? labels.map((label) => [slugify(label), label] as const)
      : (Object.entries(labels) as Array<readonly [string, string]>);
    return {
      id,
      name,
      key,
      fieldType: "select",
      isFilterable: options.filterable ?? true,
      isVariantAxis: options.variantAxis ?? false,
      order,
      values: entries.map(([slug, label], index) => ({
        id: `${key}_${slug}`,
        label,
        slug: slugify(slug),
        order: index + 1,
        isActive: true,
      })),
    };
  };

  const widths = [...new Set(products.flatMap((p) => p.variants.map((v) => v.widthCm)))].sort(
    (a, b) => a - b,
  );
  const heights = [...new Set(products.flatMap((p) => p.variants.map((v) => v.heightCm)))].sort(
    (a, b) => a - b,
  );

  return [
    simple("attr_material", "Matière", "material", 1, MATERIAL_LABELS, { variantAxis: false }),
    {
      id: "attr_color",
      name: "Couleur",
      key: "color",
      fieldType: "color",
      isFilterable: true,
      isVariantAxis: true,
      order: 2,
      values: [...colors.entries()].map(([slug, value], index) => ({
        id: `color_${slug}`,
        label: value.label,
        slug,
        hex: value.hex,
        family: value.family,
        order: index + 1,
        isActive: true,
      })),
    },
    simple("attr_color_family", "Famille de couleur", "color_family", 3, [
      "Blanc",
      "Beige",
      "Gris",
      "Noir",
      "Marron",
      "Rouge",
      "Rose",
      "Jaune",
      "Orange",
      "Vert",
      "Bleu",
      "Violet",
      "Métallisé",
    ]),
    simple("attr_opacity", "Niveau de lumière", "opacity", 4, [
      "Tamisant léger",
      "Tamisant",
      "Obscurcissant",
      "Occultant",
    ]),
    simple("attr_header", "Tête de rideau", "curtain_header", 5, HEADER_LABELS, {
      variantAxis: true,
    }),
    simple("attr_eyelet", "Couleur des œillets", "eyelet_color", 6, ["Argent", "Doré", "Noir"], {
      variantAxis: true,
    }),
    simple("attr_lining", "Doublure", "lining", 7, ["Sans doublure", "Thermique"], {
      variantAxis: true,
    }),
    {
      id: "attr_width",
      name: "Largeur",
      key: "width_cm",
      fieldType: "number",
      isFilterable: true,
      isVariantAxis: true,
      order: 8,
      values: widths.map((width, index) => ({
        id: `width_${width}`,
        label: `${width} cm`,
        slug: `${width}`,
        order: index + 1,
        isActive: true,
      })),
    },
    {
      id: "attr_height",
      name: "Hauteur",
      key: "height_cm",
      fieldType: "number",
      isFilterable: true,
      isVariantAxis: true,
      order: 9,
      values: heights.map((height, index) => ({
        id: `height_${height}`,
        label: `${height} cm`,
        slug: `${height}`,
        order: index + 1,
        isActive: true,
      })),
    },
    simple("attr_style", "Style", "style", 10, ["Contemporain", "Classique", "Bohème", "Minimal"]),
    simple("attr_room", "Pièce", "room", 11, ["Salon", "Chambre", "Cuisine", "Bureau"]),
    simple("attr_selling_mode", "Mode de vente", "selling_mode", 12, [
      "Panneau seul",
      "Paire",
      "Pack",
      "Au mètre",
      "Prêt à poser",
      "Sur devis",
      "Accessoire",
    ]),
    simple("attr_availability", "Disponibilité", "availability", 13, [
      "En stock",
      "Stock faible",
      "Épuisé",
      "Sur commande",
    ]),
  ];
}

const FIRST_NAMES = [
  "Amira",
  "Youssef",
  "Sonia",
  "Mehdi",
  "Nour",
  "Karim",
  "Ines",
  "Hatem",
  "Rania",
  "Slim",
];
const LAST_NAMES = [
  "Ben Ali",
  "Trabelsi",
  "Gharbi",
  "Jaziri",
  "Chaabane",
  "Mansouri",
  "Bouazizi",
  "Khelifi",
];
const CITIES = [
  "Ras Jebel",
  "Menzel Bourguiba",
  "La Marsa",
  "Sousse Ville",
  "Sfax Nord",
  "Ariana Ville",
];

function buildCustomers(): AdminCustomer[] {
  const random = createRandom(424242);
  return Array.from({ length: 18 }, (_, index) => {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length] as string;
    const lastName = LAST_NAMES[index % LAST_NAMES.length] as string;
    const gov = TUNISIA_GOVERNORATES[index % TUNISIA_GOVERNORATES.length] as { value: string };
    const phone = `+2169${String(1000000 + Math.floor(random() * 8999999)).slice(0, 7)}`;
    return {
      id: `cus_${index + 1}`,
      firstName,
      lastName,
      phone,
      email: `${slugify(firstName)}.${slugify(lastName)}@example.tn`,
      governorate: gov.value,
      tags: index % 4 === 0 ? ["fidèle"] : index % 5 === 0 ? ["professionnel"] : [],
      internalNotes: "",
      addresses: [
        {
          id: `adr_${index + 1}`,
          governorate: gov.value,
          city: CITIES[index % CITIES.length] as string,
          addressLine: `${10 + index} rue des Jasmins`,
        },
      ],
      createdAt: isoDaysAgo(120 - index * 3),
    } satisfies AdminCustomer;
  });
}

const ORDER_STATUS_CYCLE: AdminOrderStatus[] = [
  "delivered",
  "delivered",
  "delivered",
  "shipped",
  "preparing",
  "confirmed",
  "pending_confirmation",
  "received",
  "cancelled",
  "delivered",
  "return_requested",
  "returned",
];

function buildOrders(products: AdminProduct[], customers: AdminCustomer[]): AdminOrder[] {
  const random = createRandom(987654);
  const publishable = products.filter((product) => product.variants.length > 0);

  return Array.from({ length: 32 }, (_, index) => {
    const customer = customers[index % customers.length] as AdminCustomer;
    const status = ORDER_STATUS_CYCLE[index % ORDER_STATUS_CYCLE.length] as AdminOrderStatus;
    const itemCount = 1 + Math.floor(random() * 3);
    const items: AdminOrderItem[] = [];

    for (let line = 0; line < itemCount; line += 1) {
      const product = publishable[(index * 3 + line * 5) % publishable.length] as AdminProduct;
      const variant = product.variants[(index + line) % product.variants.length] as AdminVariant;
      const quantity = 1 + Math.floor(random() * 2);
      items.push({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantLabel: variantLabel(variant),
        sku: variant.sku,
        quantity,
        unitPriceMinor: variant.priceMinor,
        lineTotalMinor: variant.priceMinor * quantity,
      });
    }

    const subtotalMinor = items.reduce((total, item) => total + item.lineTotalMinor, 0);
    const deliveryMethod = index % 6 === 0 ? "store_pickup" : "home_delivery";
    const shippingMinor =
      deliveryMethod === "store_pickup" || subtotalMinor >= storeConfig.freeShippingThresholdMinor
        ? 0
        : storeConfig.standardShippingFeeMinor;
    const createdAt = isoDaysAgo(45 - index, index % 12);
    const address = customer.addresses[0] as { city: string; addressLine: string };

    return {
      id: `ord_${index + 1}`,
      orderNumber: `HBS-2607${String(100 + index)}`,
      createdAt,
      updatedAt: createdAt,
      status,
      paymentStatus:
        status === "delivered" ? "collected" : status === "returned" ? "refunded" : "pending",
      paymentMethod: "cash_on_delivery",
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerPhone: customer.phone,
      ...(customer.email ? { customerEmail: customer.email } : {}),
      deliveryMethod,
      governorate: customer.governorate,
      city: address.city,
      addressLine: address.addressLine,
      items,
      subtotalMinor,
      shippingMinor,
      discountMinor: 0,
      totalMinor: subtotalMinor + shippingMinor,
      timeline: [
        { id: `evt_${index}_0`, at: createdAt, status: "received", label: "Commande reçue" },
        ...(status === "received"
          ? []
          : [{ id: `evt_${index}_1`, at: createdAt, status, label: `Statut : ${status}` }]),
      ],
      notes: [],
    } satisfies AdminOrder;
  });
}

function buildPromotions(): AdminPromotion[] {
  return [
    {
      id: "promo_rentree",
      name: "Rentrée déco -15%",
      type: "automatic",
      discountType: "percentage",
      value: 15,
      startAt: isoDaysAgo(10),
      endAt: isoDaysAgo(-20),
      isActive: true,
      minimumOrderMinor: 150000,
      productIds: [],
      categoryIds: ["cat_rideaux"],
      usageCount: 42,
      priority: 1,
      isStackable: false,
    },
    {
      id: "promo_bienvenue",
      name: "Code bienvenue",
      code: "BIENVENUE10",
      type: "coupon",
      discountType: "fixed_amount",
      value: 10000,
      startAt: isoDaysAgo(60),
      endAt: isoDaysAgo(-90),
      isActive: true,
      minimumOrderMinor: 80000,
      productIds: [],
      categoryIds: [],
      usageLimit: 500,
      usageCount: 118,
      priority: 2,
      isStackable: true,
    },
    {
      id: "promo_livraison",
      name: "Livraison offerte week-end",
      type: "automatic",
      discountType: "free_shipping",
      value: 0,
      startAt: isoDaysAgo(3),
      endAt: isoDaysAgo(-3),
      isActive: false,
      minimumOrderMinor: 120000,
      productIds: [],
      categoryIds: [],
      usageCount: 7,
      priority: 3,
      isStackable: false,
    },
  ];
}

const HOME_SECTIONS: Array<[string, string, string, string]> = [
  ["announcement", "Barre d'annonces", "Livraison 24/48h partout en Tunisie", ""],
  ["hero", "Slides Hero", "L'élégance textile pour votre intérieur", "Rideaux, voilages et stores"],
  ["collections", "Collections mises en avant", "Nos collections", "Sélection HBS HOME"],
  ["products", "Sélections de produits", "Les plus vendus", "Best-sellers du mois"],
  ["editorial", "Blocs éditoriaux", "Notre savoir-faire", "Textile de maison depuis 1998"],
  ["measure_guide", "Guide des mesures", "Bien mesurer vos fenêtres", "Guide pratique"],
  ["shop_the_look", "Shop the Look", "Shop the Look", "Inspirations complètes"],
  ["accessories", "Accessoires", "Tringles et accessoires", "Complétez votre installation"],
  ["professionals", "Professionnels", "Vous êtes professionnel ?", "Tarifs dédiés"],
  ["reviews", "Avis", "Ils nous font confiance", "Avis clients"],
  ["articles", "Articles", "Journal HBS HOME", "Conseils déco"],
  ["newsletter", "Newsletter", "Restons en contact", "Offres et nouveautés"],
  ["social", "Réseaux sociaux", "Suivez-nous", "@hbshome"],
];

const EDITORIAL_PAGES: Array<[string, string]> = [
  ["À propos", "a-propos"],
  ["Contact", "contact"],
  ["FAQ", "faq"],
  ["Livraison et retours", "livraison-et-retours"],
  ["Guide des mesures", "guide-des-mesures"],
  ["Professionnels", "professionnels"],
  ["Conditions générales de vente", "cgv"],
  ["Politique de confidentialité", "confidentialite"],
  ["Politique de cookies", "cookies"],
  ["Mentions légales", "mentions-legales"],
];

const NAV_SEED: Array<[string, string, "main" | "footer"]> = [
  ["Rideaux", "/rideaux", "main"],
  ["Voilages", "/voilages", "main"],
  ["Stores", "/stores", "main"],
  ["Coussins", "/coussins", "main"],
  ["Tringles", "/tringles", "main"],
  ["Accessoires", "/accessoires", "main"],
  ["Sur mesure", "/sur-mesure", "main"],
  ["Promotions", "/promotions", "main"],
  ["À propos", "/a-propos", "footer"],
  ["Contact", "/contact", "footer"],
  ["FAQ", "/faq", "footer"],
  ["Livraison et retours", "/livraison-et-retours", "footer"],
  ["CGV", "/cgv", "footer"],
  ["Confidentialité", "/confidentialite", "footer"],
];

function buildContent(products: AdminProduct[]): AdminContent {
  return {
    homeSections: HOME_SECTIONS.map(([key, label, title, subtitle], index) => ({
      id: `sec_${key}`,
      key,
      label,
      isEnabled: true,
      order: index + 1,
      title,
      subtitle,
      ctaLabel: "Découvrir",
      ctaHref: "/rideaux",
      imageUrl: "",
      productIds: [],
      categoryIds: [],
    })),
    navigation: NAV_SEED.map(([label, href, group], index) => ({
      id: `nav_${slugify(label)}_${group}`,
      label,
      href,
      order: index + 1,
      isActive: true,
      isHighlighted: label === "Promotions",
      group,
    })),
    pages: EDITORIAL_PAGES.map(([title, slug]) => ({
      id: `page_${slug}`,
      title,
      slug,
      status: "published" as const,
      body: `# ${title}\n\nContenu de démonstration à remplacer par le contenu réel.`,
      seoTitle: `${title} | HBS HOME`,
      seoDescription: `${title} — HBS HOME, textile de maison en Tunisie.`,
      updatedAt: isoDaysAgo(20),
    })),
    media: products.slice(0, 16).map((product, index) => ({
      id: `med_${index + 1}`,
      name: `${product.slug}.jpg`,
      url: product.imageUrl ?? "",
      alt: product.name,
      width: 1200,
      height: 1600,
      mimeType: "image/jpeg",
      createdAt: isoDaysAgo(60 - index),
      usage: `Produit ${product.reference}`,
    })),
  };
}

function buildSettings(): AdminSettings {
  return {
    store: {
      name: storeConfig.brandName,
      currency: storeConfig.currency,
      language: "fr-TN",
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
      phone: storeConfig.customerServicePhone || "+216 00 000 000",
      email: storeConfig.customerServiceEmail || "contact@hbs-home.tn",
      whatsapp: storeConfig.whatsappNumber || "",
      openingHours: "Lundi au samedi, 9h - 18h",
    },
    social: { facebook: "", instagram: "", tiktok: "" },
    seo: {
      defaultTitle: "HBS HOME — Rideaux et textile de maison",
      defaultDescription: "Rideaux, voilages, stores et accessoires livrés partout en Tunisie.",
      ogImageUrl: "",
    },
    features: {
      checkout: true,
      favorites: false,
      reviews: false,
      customMade: true,
      professionals: true,
      orderTracking: false,
      customerAccounts: false,
      onlinePayment: false,
    },
  };
}

function buildUsers(): AdminUser[] {
  return [
    {
      id: "usr_1",
      fullName: "Hana Ben Salah",
      email: "hana@hbs-home.tn",
      role: "super_admin",
      isActive: true,
      createdAt: isoDaysAgo(300),
      lastSeenAt: isoDaysAgo(0),
    },
    {
      id: "usr_2",
      fullName: "Walid Trabelsi",
      email: "walid@hbs-home.tn",
      role: "catalog_manager",
      isActive: true,
      createdAt: isoDaysAgo(200),
    },
    {
      id: "usr_3",
      fullName: "Emna Gharbi",
      email: "emna@hbs-home.tn",
      role: "orders_manager",
      isActive: true,
      createdAt: isoDaysAgo(150),
    },
    {
      id: "usr_4",
      fullName: "Sami Khelifi",
      email: "sami@hbs-home.tn",
      role: "content_editor",
      isActive: false,
      createdAt: isoDaysAgo(90),
    },
  ];
}

function buildAuditLogs(): AdminAuditLog[] {
  const samples: Array<[string, string, string]> = [
    ["create", "product", "Produit créé"],
    ["update", "product", "Produit modifié"],
    ["adjustment", "inventory", "Stock ajusté"],
    ["status_change", "order", "Commande confirmée"],
    ["status_change", "order", "Commande expédiée"],
    ["create", "promotion", "Promotion créée"],
    ["update", "content", "Contenu modifié"],
    ["update", "settings", "Paramètre modifié"],
  ];
  return samples.map((entry, index) => ({
    id: `log_${index + 1}`,
    at: isoDaysAgo(index, index),
    userId: index % 2 === 0 ? "usr_1" : "usr_2",
    userName: index % 2 === 0 ? "Hana Ben Salah" : "Walid Trabelsi",
    action: entry[0] as AdminAuditLog["action"],
    resourceType: entry[1] as string,
    resourceId: `${entry[1]}_${index + 1}`,
    details: entry[2] as string,
  }));
}

function buildStockMovements(products: AdminProduct[]): StockMovement[] {
  return products.slice(0, 6).map((product, index) => {
    const variant = product.variants[0] as AdminVariant;
    return {
      id: `mov_${index + 1}`,
      variantId: variant.id,
      productId: product.id,
      type: "set",
      quantity: variant.stock,
      reason: "Inventaire initial",
      createdAt: isoDaysAgo(30 - index),
      userId: "usr_1",
    };
  });
}

export function createSeedDatabase(): AdminMockDatabase {
  const products = buildProducts();
  const customers = buildCustomers();
  return {
    version: 1,
    products,
    categories: buildCategories(),
    attributes: buildAttributes(products),
    stockMovements: buildStockMovements(products),
    orders: buildOrders(products, customers),
    customers,
    promotions: buildPromotions(),
    content: buildContent(products),
    settings: buildSettings(),
    users: buildUsers(),
    auditLogs: buildAuditLogs(),
  };
}
