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
          { label: "Velours", href: "/rideaux" },
          { label: "Satin", href: "/rideaux" },
          { label: "Lin", href: "/rideaux" },
          { label: "Tous les rideaux", href: "/rideaux" },
        ],
      },
      {
        title: "Par besoin",
        links: [
          { label: "Occultants", href: "/rideaux" },
          { label: "Tamisants", href: "/rideaux" },
          { label: "Thermiques", href: "/rideaux" },
          { label: "Grande largeur", href: "/rideaux" },
        ],
      },
      {
        title: "Par finition",
        links: [
          { label: "À œillets", href: "/rideaux" },
          { label: "Pour rail", href: "/rideaux" },
          { label: "À galon fronceur", href: "/rideaux" },
        ],
      },
    ],
  },
  { id: "voilages", label: "Voilages", href: "/voilages" },
  { id: "stores", label: "Stores", href: "/stores" },
  { id: "coussins", label: "Coussins", href: "/coussins" },
  { id: "accessoires", label: "Accessoires", href: "/accessoires" },
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
