import heroImage from "@/assets/hero-rideaux.jpg";
import colRideaux from "@/assets/col-rideaux.jpg";
import colVoilages from "@/assets/col-voilages.jpg";
import colStores from "@/assets/col-stores.jpg";
import colCoussins from "@/assets/col-coussins.jpg";
import colTringles from "@/assets/col-tringles.jpg";
import colEmbrasses from "@/assets/col-embrasses.jpg";
import type { Collection, HeroContent, TrustItem } from "@/types/home.types";

export const homeHero: HeroContent = {
  tagline: "Nouvelle collection",
  title: "Des rideaux qui transforment votre intérieur",
  text: "Découvrez des matières élégantes, des couleurs actuelles et des finitions pensées pour habiller chaque pièce avec style.",
  primaryCta: { label: "Découvrir les rideaux", href: "/rideaux" },
  secondaryCta: { label: "Voir les nouveautés", href: "/nouveautes" },
  image: {
    src: heroImage,
    alt: "Salon lumineux habillé de rideaux en lin devant une grande fenêtre",
  },
};

export const trustItems: TrustItem[] = [
  {
    id: "delivery",
    label: "Livraison partout en Tunisie",
    description: "Expédition sous 24 à 48 heures",
    icon: "truck",
  },
  {
    id: "cod",
    label: "Paiement à la livraison",
    description: "Réglez à réception de votre commande",
    icon: "banknote",
  },
  {
    id: "free-shipping",
    label: "Livraison gratuite dès 200 DT",
    description: "Sur l'ensemble de nos collections",
    icon: "package-check",
  },
  {
    id: "advice",
    label: "Conseil personnalisé",
    description: "Accompagnement mesures et finitions",
    icon: "message-circle",
  },
];

export const featuredCollections: Collection[] = [
  {
    id: "rideaux",
    title: "Rideaux",
    description: "Velours, satin et lin pour habiller vos fenêtres.",
    href: "/rideaux",
    image: { src: colRideaux, alt: "Rideaux en velours devant une fenêtre" },
  },
  {
    id: "voilages",
    title: "Voilages",
    description: "La lumière filtrée, en toute légèreté.",
    href: "/voilages",
    image: { src: colVoilages, alt: "Voilages blancs traversés par la lumière" },
  },
  {
    id: "stores",
    title: "Stores",
    description: "Des solutions nettes pour chaque ouverture.",
    href: "/stores",
    image: { src: colStores, alt: "Store en fibres naturelles sur une fenêtre" },
  },
  {
    id: "coussins",
    title: "Coussins",
    description: "Matières douces et teintes chaleureuses.",
    href: "/coussins",
    image: { src: colCoussins, alt: "Coussins en lin et velours empilés" },
  },
  {
    id: "tringles",
    title: "Tringles",
    description: "Supports et finitions au bon format.",
    href: "/tringles",
    image: { src: colTringles, alt: "Tringle à rideaux en laiton avec embout décoratif" },
  },
  {
    id: "embrasses",
    title: "Embrasses",
    description: "Le détail qui structure vos rideaux.",
    href: "/embrasses",
    image: { src: colEmbrasses, alt: "Embrasse tressée retenant un rideau clair" },
  },
];
