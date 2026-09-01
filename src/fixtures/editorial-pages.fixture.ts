import type { EditorialPage, EditorialPageBlock } from "@/domain/content/editorial-page.types";

const publishedAt = "2026-09-01T00:00:00.000Z";

function block(
  sortOrder: number,
  blockType: EditorialPageBlock["blockType"],
  payload: Record<string, string>,
): EditorialPageBlock {
  return { sortOrder, blockType, payload, media: null };
}

function page(
  slug: string,
  title: string,
  body: string,
  seoDescription: string,
  blocks: EditorialPageBlock[],
): EditorialPage {
  return {
    slug,
    title,
    body,
    seoTitle: `${title} — HBS HOME`,
    seoDescription,
    version: 1,
    publishedAt,
    updatedAt: publishedAt,
    blocks,
  };
}

/**
 * Editorial baseline used until a page is published from Admin.
 *
 * The API always wins when it contains a real published page. Keeping this
 * content in the same EditorialPage contract means the public routes never
 * become empty during a CMS migration or after a fresh environment setup.
 */
export const editorialPageFixtures: Record<string, EditorialPage> = {
  faq: page(
    "faq",
    "FAQ",
    "Les réponses aux questions les plus fréquentes sur les rideaux, voilages, stores et la décoration HBS HOME.",
    "FAQ HBS HOME : dimensions des rideaux, choix des matières, livraison, paiement à la livraison et retours en Tunisie.",
    [
      block(0, "hero", {
        eyebrow: "Bien choisir",
        heading: "Tout savoir avant de commander",
        body: "Notre équipe vous aide à choisir les bonnes dimensions, la matière adaptée et la finition qui correspond à votre intérieur.",
      }),
      block(1, "faq", {
        question: "Comment calculer la largeur de mes rideaux ou voilages ?",
        answer:
          "L’ampleur fixe est de ×2 : multipliez la largeur de votre fenêtre ou de votre tringle par deux. Pour une fenêtre de 1,50 m, prévoyez donc un rideau de 3 m de largeur. Cette règle s’applique aux rideaux comme aux voilages.",
      }),
      block(2, "faq", {
        question: "Quelle règle pour un rideau en velours ?",
        answer:
          "Chaque panneau de velours mesure 1,50 m de largeur. Un rideau de 3 m correspond à deux panneaux, 4,50 m à trois panneaux. Pour une très grande largeur, deux panneaux de 3 m peuvent être assemblés afin d’obtenir 6 m. Les largeurs sont toujours des multiples de 1,50 m.",
      }),
      block(3, "faq", {
        question: "Quelle hauteur maximale peut-on commander ?",
        answer:
          "La hauteur maximale réalisable est de 3,15 m. Mesurez la hauteur finie souhaitée entre la tringle et le niveau de tombé, puis indiquez-la dans votre demande ou contactez-nous pour un conseil personnalisé.",
      }),
      block(4, "faq", {
        question: "Quelles tringles sont proposées ?",
        answer:
          "Nous proposons des tringles extensibles en acier inoxydable, réglables de 1,50 m à 3 m. Pour une largeur supérieure ou une configuration particulière, notre équipe peut vous orienter vers la solution de pose la plus adaptée.",
      }),
      block(5, "faq", {
        question: "Comment choisir une couleur ou une variante ?",
        answer:
          "Sur chaque fiche produit, les coloris et dimensions disponibles sont affichés comme des options distinctes. Sélectionnez la variante souhaitée avant de l’ajouter au panier ; son coloris, son format et sa référence sont conservés jusqu’à la commande.",
      }),
      block(6, "faq", {
        question: "Quels sont les délais et les moyens de paiement ?",
        answer:
          "La livraison standard est généralement effectuée sous 24 à 48 heures partout en Tunisie. Le paiement à la livraison est disponible. Les articles volumineux, fragiles ou réalisés sur mesure peuvent nécessiter une confirmation préalable.",
      }),
      block(7, "faq", {
        question: "Puis-je retourner un article ?",
        answer:
          "Vous pouvez demander un échange ou un retour sous 7 jours, à condition que le produit n’ait pas été lavé, utilisé ou détérioré et qu’il soit retourné dans son emballage d’origine. Consultez la page Livraison et retours pour les modalités pratiques.",
      }),
    ],
  ),

  "livraison-et-retours": page(
    "livraison-et-retours",
    "Livraison et retours",
    "Une livraison claire et un accompagnement simple, de la validation de votre panier jusqu’à la réception de votre commande HBS HOME.",
    "Livraison et retours HBS HOME : délais, frais, paiement à la livraison et conditions d’échange partout en Tunisie.",
    [
      block(0, "hero", {
        eyebrow: "Service HBS HOME",
        heading: "Votre commande, livrée avec attention",
        body: "Nous préparons chaque commande avec soin afin de préserver les matières, les finitions et la qualité de présentation de vos articles.",
      }),
      block(1, "section", {
        heading: "Zones et délais de livraison",
        body: "Nous livrons partout en Tunisie. La livraison standard intervient généralement sous 24 à 48 heures après confirmation de la commande. Le transporteur peut vous contacter pour organiser le passage selon votre adresse.",
      }),
      block(2, "section", {
        heading: "Frais de livraison",
        body: "Les frais standards sont de 7 DT. La livraison est offerte à partir de 200 DT d’achat. Pour le mobilier, les plantes fragiles, les pièces volumineuses ou les projets sur mesure, un mode de livraison spécifique peut être confirmé avant l’expédition.",
      }),
      block(3, "section", {
        heading: "Paiement à la livraison",
        body: "Le paiement à la livraison est disponible pour les commandes éligibles. Vérifiez votre adresse et votre numéro de téléphone au moment de la validation afin de faciliter la remise du colis.",
      }),
      block(4, "section", {
        heading: "Retrait à Ras Jebel",
        body: "Le retrait en boutique est possible à Ras Jebel, Bizerte, lorsque cette option est proposée au moment de la commande. Attendez la confirmation de disponibilité avant de vous déplacer.",
      }),
      block(5, "section", {
        heading: "Échanges et retours",
        body: "Un échange ou un retour peut être demandé sous 7 jours. L’article doit être non lavé, non utilisé, intact et conservé dans son emballage d’origine. Les articles confectionnés sur mesure ou personnalisés peuvent être exclus du retour ; contactez-nous avant toute expédition.",
      }),
      block(6, "section", {
        heading: "Besoin d’aide ?",
        body: "Pour une question sur une livraison, une dimension ou une commande, consultez la FAQ ou contactez notre équipe avant de valider votre achat.",
      }),
    ],
  ),

  contact: page(
    "contact",
    "Contact",
    "Une question sur un produit, une dimension ou un projet d’aménagement ? HBS HOME vous accompagne avec des conseils simples et personnalisés.",
    "Contact HBS HOME : conseils rideaux, voilages, stores, décoration et projets sur mesure en Tunisie.",
    [
      block(0, "hero", {
        eyebrow: "À votre écoute",
        heading: "Parlons de votre intérieur",
        body: "Décrivez-nous votre besoin : nous vous aiderons à choisir la matière, le coloris, les dimensions et la solution de pose les plus adaptés.",
      }),
      block(1, "section", {
        heading: "Une question produit ?",
        body: "Vous hésitez entre le lin, le velours, le satin ou un voilage ? Vous souhaitez vérifier une largeur, une hauteur ou une couleur ? Indiquez la référence du produit et les dimensions de votre fenêtre pour recevoir une réponse plus précise.",
      }),
      block(2, "section", {
        heading: "Un projet sur mesure ?",
        body: "Pour une grande baie, une hauteur jusqu’à 3,15 m, un rideau en velours par panneaux de 1,50 m ou une installation complète, notre demande sur mesure vous permet de partager vos contraintes et vos inspirations.",
        primaryCtaLabel: "Parler de mon projet",
        primaryCtaHref: "/sur-mesure",
      }),
      block(3, "section", {
        heading: "Suivre une commande",
        body: "Pour connaître l’avancement d’une commande, utilisez la page de suivi avec le numéro de commande et le téléphone saisi lors de l’achat. Pour une modification urgente, contactez-nous dès que possible.",
        primaryCtaLabel: "Suivre ma commande",
        primaryCtaHref: "/suivi-commande",
      }),
      block(4, "section", {
        heading: "Nous trouver",
        body: "HBS HOME — Ras Jebel, Bizerte, Tunisie. Les modalités de retrait et les horaires disponibles sont confirmés avant votre déplacement.",
      }),
    ],
  ),

  cgv: page(
    "cgv",
    "Conditions générales de vente",
    "Les présentes conditions encadrent les ventes réalisées sur la boutique en ligne HBS HOME et précisent les droits et obligations de chaque partie.",
    "Conditions générales de vente HBS HOME : commandes, prix, paiement, livraison, retours et garanties en Tunisie.",
    [
      block(0, "section", {
        heading: "1. Objet et champ d’application",
        body: "Les présentes conditions générales de vente s’appliquent aux achats effectués sur le site HBS HOME. La validation d’une commande implique leur lecture et leur acceptation. Elles peuvent être mises à jour pour tenir compte de l’évolution du site ou de la réglementation applicable.",
      }),
      block(1, "section", {
        heading: "2. Produits et disponibilités",
        body: "Les fiches présentent les caractéristiques essentielles des rideaux, voilages, stores, coussins, accessoires, mobilier et plantes proposés. Les photos et couleurs peuvent varier légèrement selon l’écran. Une variante n’est commandable que si elle est indiquée comme disponible.",
      }),
      block(2, "section", {
        heading: "3. Prix et commande",
        body: "Les prix sont indiqués en dinars tunisiens, toutes taxes comprises lorsque la réglementation le prévoit. Le panier récapitule les produits, variantes, quantités, frais éventuels et total avant validation. Une commande devient ferme après confirmation par HBS HOME.",
      }),
      block(3, "section", {
        heading: "4. Paiement",
        body: "Le paiement à la livraison est proposé pour les commandes éligibles. Le client s’engage à être joignable et à régler le montant indiqué lors de la remise. Toute commande présentant une information incohérente peut être vérifiée avant expédition.",
      }),
      block(4, "section", {
        heading: "5. Livraison",
        body: "Les délais et frais sont décrits sur la page Livraison et retours. Ils peuvent varier pour les articles volumineux, fragiles, sur mesure ou nécessitant un rendez-vous. Une adresse complète et un numéro de téléphone valide sont nécessaires à la livraison.",
      }),
      block(5, "section", {
        heading: "6. Échanges et retours",
        body: "Un échange ou un retour peut être demandé sous 7 jours pour un article non lavé, non utilisé, intact et conservé dans son emballage d’origine. Les produits personnalisés ou confectionnés sur mesure peuvent être exclus du retour, sauf défaut ou non-conformité.",
      }),
      block(6, "section", {
        heading: "7. Garanties et responsabilité",
        body: "HBS HOME applique les garanties légales dont bénéficie le consommateur. Les conseils de mesure et de pose sont fournis pour aider à préparer le projet ; le client reste responsable de la vérification de ses mesures et de la compatibilité de son installation.",
      }),
      block(7, "section", {
        heading: "8. Contact",
        body: "Pour toute question relative à une commande ou à ces conditions, utilisez la page Contact en indiquant votre référence de commande et les informations utiles à son traitement.",
      }),
    ],
  ),

  confidentialite: page(
    "confidentialite",
    "Politique de confidentialité",
    "Cette politique de confidentialité explique comment HBS HOME collecte, utilise et protège les données personnelles liées à la boutique en ligne, aux commandes et aux demandes de conseil en Tunisie.",
    "Politique de confidentialité HBS HOME : données de commande, compte, newsletter, droits et protection des visiteurs en Tunisie.",
    [
      block(0, "section", {
        heading: "Qui traite vos données ?",
        body: "HBS HOME, enseigne spécialisée dans les rideaux, voilages, stores et la décoration textile, est responsable des informations transmises sur ce site. Pour toute question relative à vos données personnelles, vous pouvez nous écrire à contact@hbs-home.tn ou utiliser la page Contact.",
      }),
      block(1, "section", {
        heading: "Les données collectées",
        body: "Selon votre parcours, nous pouvons traiter votre nom, votre adresse de livraison, votre numéro de téléphone et, si vous le renseignez, votre adresse e-mail. Ces informations sont collectées lors d’une commande, d’une demande sur mesure, d’un contact avec notre équipe ou d’une inscription à la newsletter. Les champs non nécessaires ne sont pas demandés.",
      }),
      block(2, "section", {
        heading: "Pourquoi les utiliser ?",
        body: "Nous utilisons ces informations pour confirmer et préparer une commande, organiser la livraison partout en Tunisie, répondre à vos questions, assurer le suivi après-vente et traiter les demandes de confection ou de conseil. Votre adresse e-mail sert à la newsletter uniquement si vous l’avez demandée ; vous pouvez vous désinscrire à tout moment.",
      }),
      block(3, "section", {
        heading: "Partage et sécurité",
        body: "Les données utiles peuvent être communiquées aux personnes ou prestataires strictement nécessaires au traitement de la commande, à la livraison, à l’hébergement technique ou à la sécurité du service. HBS HOME ne vend pas vos données personnelles. Des mesures techniques et organisationnelles sont mises en place pour limiter les accès non autorisés.",
      }),
      block(4, "section", {
        heading: "Conservation et données locales",
        body: "Les informations liées à une commande ou à une demande sont conservées pendant la durée nécessaire au service et aux obligations applicables. Le panier, les favoris et l’historique de recherche peuvent aussi être conservés localement dans votre navigateur ; vous pouvez les supprimer depuis le site ou les réglages de votre navigateur.",
      }),
      block(5, "section", {
        heading: "Vos droits",
        body: "Vous pouvez demander l’accès, la rectification ou la suppression des informations vous concernant, ainsi que vous opposer à une communication non indispensable. Pour exercer un droit, écrivez à contact@hbs-home.tn en précisant votre demande et un moyen de vous recontacter. Nous pourrons demander un justificatif raisonnable afin de protéger vos informations.",
      }),
      block(6, "section", {
        heading: "Cookies et mesure d’audience",
        body: "Le fonctionnement du panier, des favoris et de certaines préférences peut nécessiter des cookies ou du stockage local. Aucun outil d’analytics ou pixel publicitaire n’est actuellement activé sur le site. Consultez la Politique de cookies pour connaître les réglages disponibles.",
      }),
      block(7, "section", {
        heading: "Mise à jour de cette politique",
        body: "Cette politique peut évoluer lorsque le site, les services ou le cadre applicable changent. La version publiée sur cette page est la référence en vigueur ; nous vous invitons à la consulter régulièrement.",
      }),
    ],
  ),

  cookies: page(
    "cookies",
    "Politique de cookies",
    "Cette page explique les cookies et mécanismes de stockage utilisés par HBS HOME pour faire fonctionner la boutique et mémoriser vos choix.",
    "Politique de cookies HBS HOME : cookies essentiels, panier, favoris, recherche et gestion des préférences du navigateur.",
    [
      block(0, "section", {
        heading: "À quoi servent les cookies ?",
        body: "Un cookie est un petit fichier transmis à votre navigateur. Le stockage local peut jouer un rôle similaire. Ces technologies permettent de conserver un panier, des favoris ou certaines préférences afin d’éviter de recommencer votre parcours à chaque page.",
      }),
      block(1, "section", {
        heading: "Technologies essentielles",
        body: "HBS HOME utilise uniquement les mécanismes nécessaires au fonctionnement de la boutique : panier, favoris, historique de recherche et maintien de certaines préférences d’interface. Sans eux, plusieurs fonctions de navigation et de commande peuvent être moins pratiques.",
      }),
      block(2, "section", {
        heading: "Mesure d’audience",
        body: "Aucun pixel publicitaire ni identifiant d’analytics n’est actuellement connecté à l’application. Si cela change, la présente politique sera mise à jour et les choix requis seront proposés avant toute mesure non essentielle.",
      }),
      block(3, "section", {
        heading: "Gérer vos préférences",
        body: "Vous pouvez supprimer les données locales depuis les réglages de votre navigateur. La désactivation des cookies ou du stockage local peut vider votre panier enregistré sur cet appareil et limiter certaines fonctionnalités.",
      }),
      block(4, "section", {
        heading: "Nous contacter",
        body: "Pour toute question sur la confidentialité ou les technologies utilisées, consultez la page Contact et indiquez votre demande. Cette politique est révisée lorsque le fonctionnement du site évolue.",
      }),
    ],
  ),

  "mentions-legales": page(
    "mentions-legales",
    "Mentions légales",
    "Retrouvez ici les informations générales relatives à l’éditeur du site HBS HOME, à son utilisation et à la propriété de ses contenus.",
    "Mentions légales HBS HOME : éditeur, propriété intellectuelle, responsabilité et informations du site marchand en Tunisie.",
    [
      block(0, "section", {
        heading: "Éditeur du site",
        body: "HBS HOME est une enseigne spécialisée dans les rideaux, voilages, stores, coussins, accessoires et éléments de décoration pour l’intérieur. Adresse de contact et de retrait : Ras Jebel, Bizerte, Tunisie.",
      }),
      block(1, "section", {
        heading: "Objet du site",
        body: "Le site présente le catalogue HBS HOME, permet de consulter les caractéristiques des produits, de préparer un panier et de transmettre une commande selon les options disponibles. Les informations peuvent être ajustées pour rester à jour.",
      }),
      block(2, "section", {
        heading: "Propriété intellectuelle",
        body: "Les textes, photographies, visuels, logos, marques, interfaces et éléments graphiques présents sur le site sont protégés. Toute reproduction, adaptation ou réutilisation sans autorisation préalable est interdite, sauf dans le cadre prévu par la loi.",
      }),
      block(3, "section", {
        heading: "Responsabilité",
        body: "HBS HOME s’efforce de fournir des informations exactes et un accès continu au site. Des interruptions peuvent toutefois survenir pour maintenance, sécurité ou raisons indépendantes de sa volonté. Les liens externes sont proposés pour faciliter la navigation et restent sous la responsabilité de leurs éditeurs.",
      }),
      block(4, "section", {
        heading: "Données et contact",
        body: "Le traitement des données est décrit dans la Politique de confidentialité. Pour toute question concernant le site, une commande ou un contenu, utilisez la page Contact.",
      }),
    ],
  ),

  "a-propos": page(
    "a-propos",
    "À propos",
    "HBS HOME imagine des intérieurs chaleureux et durables grâce à des matières choisies, des finitions soignées et un accompagnement attentif en Tunisie.",
    "À propos de HBS HOME : rideaux, voilages, stores et décoration textile pensés pour chaque intérieur en Tunisie.",
    [
      block(0, "hero", {
        eyebrow: "L’esprit HBS HOME",
        heading: "Habiller la lumière, révéler les pièces",
        body: "Nous croyons qu’un textile bien choisi change la perception d’un espace. Notre sélection associe lignes sobres, matières tactiles et coloris faciles à vivre.",
      }),
      block(1, "section", {
        heading: "Une maison pensée autour de la matière",
        body: "Rideaux en lin, velours et satin, voilages légers, stores et accessoires de pose : chaque famille est choisie pour créer une atmosphère cohérente, de la chambre au salon. Les dimensions et variantes sont présentées clairement pour faciliter une décision sereine.",
      }),
      block(2, "section", {
        heading: "Le détail qui fait la différence",
        body: "Nous portons une attention particulière au tombé, à la lumière, aux coloris et à la simplicité de pose. Les règles de mesure, les dimensions disponibles et les options de chaque variante sont expliquées pour que le résultat soit aussi beau que fonctionnel.",
      }),
      block(3, "section", {
        heading: "Un accompagnement humain",
        body: "Une fenêtre, une grande baie ou un projet sur mesure ne se ressemblent pas. HBS HOME vous accompagne dans le choix de la matière, de la largeur, de la hauteur et de la tringle afin de composer un intérieur qui vous ressemble.",
      }),
      block(4, "section", {
        heading: "HBS HOME en Tunisie",
        body: "Depuis Ras Jebel, Bizerte, nous préparons vos commandes et vous accompagnons partout en Tunisie. Découvrez nos collections, consultez le guide des mesures ou contactez-nous pour commencer votre projet.",
      }),
    ],
  ),
};

export function getEditorialPageFixture(slug: string): EditorialPage | null {
  return editorialPageFixtures[slug] ?? null;
}
