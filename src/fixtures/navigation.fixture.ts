import type { AnnouncementMessage, FooterColumn, NavItem } from "@/types/navigation.types";

export const announcements: AnnouncementMessage[] = [
  { id: "free-shipping", label: "Livraison gratuite dès 200 DT" },
  { id: "nationwide", label: "Livraison partout en Tunisie" },
  { id: "cod", label: "Paiement à la livraison" },
];

export const mainNavigation: NavItem[] = [
  { id: "nouveautes", label: "Nouveautés", href: "/nouveautes" },
  {
    id: "rideaux",
    label: "Rideaux",
    href: "/rideaux",
    megaMenu: [
      {
        title: "Par matière",
        links: [
          { label: "Velours", href: "/rideaux/velours" },
          { label: "Satin", href: "/rideaux/satin" },
          { label: "Lin", href: "/rideaux/lin" },
          { label: "Tous les rideaux", href: "/rideaux" },
        ],
      },
      {
        title: "Par besoin",
        links: [
          { label: "Occultants", href: "/rideaux/occultants" },
          { label: "Tamisants", href: "/rideaux/tamisants" },
          { label: "Thermiques", href: "/rideaux/thermiques" },
          { label: "Packs rideau et voilage", href: "/rideaux/packs" },
        ],
      },
      {
        title: "Par finition",
        links: [
          { label: "À œillets", href: "/rideaux/oeillets" },
          { label: "Pour rail", href: "/rideaux/rail" },
          { label: "À galon fronceur", href: "/rideaux" },
        ],
      },
    ],
  },
  {
    id: "voilages",
    label: "Voilages",
    href: "/voilages",
    megaMenu: [
      {
        title: "Par motif",
        links: [
          { label: "Unis", href: "/voilages/unis" },
          { label: "À motifs", href: "/voilages/motifs" },
          { label: "Tous les voilages", href: "/voilages" },
        ],
      },
      {
        title: "Par format",
        links: [
          { label: "Grande largeur", href: "/voilages/grande-largeur" },
          { label: "Pour rail", href: "/voilages/rail" },
        ],
      },
      {
        title: "Compléter",
        links: [
          { label: "Rideaux occultants", href: "/rideaux/occultants" },
          { label: "Packs rideau et voilage", href: "/rideaux/packs" },
        ],
      },
    ],
  },
  {
    id: "stores",
    label: "Stores",
    href: "/stores",
    megaMenu: [
      {
        title: "Par type",
        links: [
          { label: "Enrouleurs", href: "/stores/enrouleurs" },
          { label: "Jour/Nuit", href: "/stores/jour-nuit" },
          { label: "Bambou", href: "/stores/bambou" },
          { label: "Tous les stores", href: "/stores" },
        ],
      },
      {
        title: "Par besoin",
        links: [
          { label: "Occultants", href: "/stores/occultants" },
          { label: "Sans perçage", href: "/stores/sans-percage" },
        ],
      },
      {
        title: "Compléter",
        links: [
          { label: "Voilages unis", href: "/voilages/unis" },
          { label: "Guide des mesures", href: "/guide-des-mesures" },
        ],
      },
    ],
  },
  {
    id: "coussins",
    label: "Coussins",
    href: "/coussins",
    megaMenu: [
      {
        title: "Par matière",
        links: [
          { label: "Lin lavé", href: "/coussins/lin" },
          { label: "Velours", href: "/coussins/velours" },
          { label: "Tous les coussins", href: "/coussins" },
        ],
      },
      {
        title: "Par format",
        links: [
          { label: "Lots de coussins", href: "/coussins/lots" },
          { label: "Galettes de chaise", href: "/galettes-de-chaise" },
        ],
      },
      {
        title: "Assises",
        links: [
          { label: "Galettes carrées", href: "/galettes-de-chaise/carrees" },
          { label: "Galettes rondes", href: "/galettes-de-chaise/rondes" },
        ],
      },
    ],
  },
  {
    id: "accessoires",
    label: "Accessoires",
    href: "/accessoires",
    megaMenu: [
      {
        title: "Suspendre",
        links: [
          { label: "Tringles", href: "/accessoires/tringles" },
          { label: "Rails de plafond", href: "/accessoires/rails" },
          { label: "Tous les accessoires", href: "/accessoires" },
        ],
      },
      {
        title: "Retenir",
        links: [{ label: "Embrasses et attaches", href: "/accessoires/embrasses" }],
      },
      {
        title: "Poser",
        links: [
          { label: "Anneaux, supports et kits", href: "/accessoires/petites-pieces" },
          { label: "Guide des mesures", href: "/guide-des-mesures" },
        ],
      },
    ],
  },
  {
    id: "mobilier",
    label: "Mobilier",
    href: "/mobilier",
    megaMenu: [
      {
        title: "Assises",
        links: [
          { label: "Canapés", href: "/mobilier/canapes" },
          { label: "Fauteuils", href: "/mobilier/fauteuils" },
          { label: "Chaises", href: "/mobilier/chaises" },
          { label: "Poufs", href: "/mobilier/poufs" },
        ],
      },
      {
        title: "Tables et rangements",
        links: [
          { label: "Tables basses et consoles", href: "/mobilier/tables" },
          { label: "Meubles TV et rangements", href: "/mobilier/rangements" },
          { label: "Tout le mobilier", href: "/mobilier" },
        ],
      },
      {
        title: "Chambre",
        links: [
          { label: "Têtes de lit", href: "/mobilier/tetes-de-lit" },
          { label: "Rideaux occultants", href: "/rideaux/occultants" },
        ],
      },
    ],
  },
  {
    id: "plantes",
    label: "Plantes & déco",
    href: "/plantes",
    megaMenu: [
      {
        title: "Par nature",
        links: [
          { label: "Plantes artificielles", href: "/plantes/artificielles" },
          { label: "Plantes naturelles", href: "/plantes/naturelles" },
          { label: "Toutes les plantes", href: "/plantes" },
        ],
      },
      {
        title: "Par format",
        links: [
          { label: "Grandes plantes et arbres", href: "/plantes/grandes-plantes" },
          { label: "Plantes suspendues", href: "/plantes/suspendues" },
          { label: "Compositions séchées", href: "/plantes/compositions" },
        ],
      },
      {
        title: "Pots",
        links: [
          { label: "Pots et cache-pots", href: "/plantes/cache-pots" },
          { label: "Coussins déco", href: "/coussins" },
        ],
      },
    ],
  },
  { id: "sur-mesure", label: "Sur mesure", href: "/sur-mesure" },
  { id: "inspirations", label: "Inspirations", href: "/inspirations" },
  { id: "promotions", label: "Promotions", href: "/promotions", highlight: true },
];

export const footerColumns: FooterColumn[] = [
  {
    title: "Collections",
    links: [
      { label: "Rideaux", href: "/rideaux" },
      { label: "Voilages", href: "/voilages" },
      { label: "Stores", href: "/stores" },
      { label: "Coussins", href: "/coussins" },
      { label: "Mobilier", href: "/mobilier" },
      { label: "Plantes et décoration", href: "/plantes" },
      { label: "Galettes de chaise", href: "/galettes-de-chaise" },
      { label: "Accessoires", href: "/accessoires" },
    ],
  },
  {
    title: "Besoin d'aide",
    links: [
      { label: "Guide des mesures", href: "/guide-des-mesures" },
      { label: "FAQ", href: "/faq" },
      { label: "Livraison et retours", href: "/livraison-et-retours" },
      { label: "Suivi de commande", href: "/suivi-commande" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "HBS HOME",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Professionnels", href: "/professionnels" },
      { label: "Sur mesure", href: "/sur-mesure" },
      { label: "Inspirations", href: "/inspirations" },
    ],
  },
  {
    title: "Informations légales",
    links: [
      { label: "Conditions générales de vente", href: "/cgv" },
      { label: "Politique de confidentialité", href: "/confidentialite" },
      { label: "Politique de cookies", href: "/cookies" },
      { label: "Mentions légales", href: "/mentions-legales" },
    ],
  },
];
