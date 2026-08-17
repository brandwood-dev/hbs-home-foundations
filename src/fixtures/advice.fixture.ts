import colRideaux from "@/assets/col-rideaux.jpg";
import colVoilages from "@/assets/col-voilages.jpg";
import colCoussins from "@/assets/col-coussins.jpg";
import type { AdviceArticlePreview } from "@/domain/content/home-content.types";

/** Previews éditoriales — les articles complets arriveront avec le CMS. */
export const adviceArticles: AdviceArticlePreview[] = [
  {
    id: "advice-mesures",
    slug: "comment-mesurer-fenetre-rideaux",
    title: "Comment mesurer une fenêtre pour choisir ses rideaux ?",
    excerpt:
      "Largeur, hauteur, retombée : les repères simples pour commander des rideaux aux bonnes dimensions.",
    category: "Guide",
    readingTimeMinutes: 4,
    image: { src: colRideaux, alt: "Fenêtre mesurée avant l'installation d'un rideau" },
  },
  {
    id: "advice-occultant",
    slug: "rideau-occultant-ou-tamisant",
    title: "Rideau occultant ou tamisant : lequel choisir ?",
    excerpt:
      "Deux niveaux d'opacité, deux usages : comparez la lumière, le confort et l'intimité pièce par pièce.",
    category: "Conseils",
    readingTimeMinutes: 5,
    image: { src: colVoilages, alt: "Comparaison entre un rideau tamisant et un rideau occultant" },
  },
  {
    id: "advice-associer",
    slug: "associer-rideaux-voilages-coussins",
    title: "Comment associer rideaux, voilages et coussins ?",
    excerpt:
      "Matières, teintes et proportions : la méthode pour composer un ensemble textile cohérent.",
    category: "Inspiration",
    readingTimeMinutes: 6,
    image: { src: colCoussins, alt: "Coussins et rideaux assortis dans un salon" },
  },
];
