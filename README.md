# HBS Home Foundations

HBS HOME — PHASE 1 : FONDATIONS DU SITE

Agis comme un Senior UX/UI Designer et un Senior Frontend Developer spécialisé en e-commerce.

Nous allons construire progressivement un site e-commerce pour HBS HOME, une marque tunisienne spécialisée dans la vente de rideaux, voilages, stores, coussins, tringles, embrasses et accessoires.

Pour cette première étape, ne crée pas tout le site. Travaille uniquement sur les fondations techniques et visuelles.

Références

Analyse comme inspiration UX et merchandising :

https://www.madura.com/

Analyse également le site actuel de HBS HOME afin de comprendre la marque, les catégories et les avantages commerciaux existants :

https://www.hbs-home.com/

Le nouveau site peut s’inspirer des bonnes pratiques de Madura, mais ne doit jamais être une copie.

Ne copie pas :

les textes ;

les images ;

le logo ;

les noms de collections ;

la structure exacte ;

le design exact ;

les composants propriétaires.

Crée une identité originale pour HBS HOME adaptée au marché tunisien.

OBJECTIF DE CETTE PREMIÈRE PHASE

Réalise uniquement les éléments suivants :

audit rapide du projet existant ;

design system HBS HOME ;

configuration globale du site ;

layout principal ;

barre d’annonces ;

header desktop ;

header mobile ;

navigation principale ;

menu mobile ;

footer ;

début de la page d’accueil avec seulement :

le Hero principal ;

la bande de réassurance ;

la section des principales collections.

Ne développe pas encore :

le catalogue complet ;

les filtres ;

les fiches produits ;

le panier ;

le checkout ;

l’authentification ;

le backend ;

Supabase ;

l’administration ;

le paiement ;

le déploiement.

1. AUDIT TECHNIQUE

Avant de modifier le projet, inspecte :

le framework utilisé ;

le routeur ;

le gestionnaire de paquets ;

le fichier package.json ;

le lockfile ;

la configuration TypeScript ;

Tailwind CSS ;

les composants déjà présents ;

la structure des dossiers ;

le système de build.

Respecte le framework généré par Lovable.

Ne migre pas arbitrairement le projet vers Next.js, Vite, React Router ou un autre framework.

Ne crée pas plusieurs lockfiles.

2. DIRECTION ARTISTIQUE

Créer une identité visuelle :

premium mais accessible ;

chaleureuse ;

lumineuse ;

contemporaine ;

élégante ;

méditerranéenne ;

spécialisée dans le textile et la décoration intérieure.

Utiliser comme palette initiale :

--background: #F7F3EE;
--surface: #FFFFFF;
--surface-muted: #EFE8E0;
--sand: #DED2C4;
--taupe: #9B8878;
--accent: #B47755;
--accent-dark: #8D563A;
--foreground: #222220;
--foreground-muted: #6E6A65;
--border: #E7E1DA;
--success: #387A53;
--error: #B54747;

Utiliser :

Cormorant Garamond pour les grands titres ;

Manrope pour les textes et l’interface.

Le design doit être clair, aéré et élégant.

Éviter :

les interfaces très sombres ;

l’excès de doré ;

les dégradés artificiels ;

les ombres trop fortes ;

les cartes trop encadrées ;

les animations inutiles ;

les textes illisibles sur les images.

Utiliser Lucide Icons.

Ne pas utiliser d’émojis comme icônes d’interface.

3. CONFIGURATION GLOBALE

Créer une configuration centralisée, par exemple :

export const storeConfig = {
brandName: "HBS HOME",
locale: "fr-TN",
currency: "TND",

standardShippingFeeMinor: 7000,
freeShippingThresholdMinor: 200000,
estimatedDeliveryLabel: "24 à 48 heures",

cashOnDeliveryEnabled: true,
storePickupEnabled: true,

whatsappNumber: "",
customerServicePhone: "",
customerServiceEmail: "",
storeAddress: "Ras Jebel, Bizerte, Tunisie",

socialLinks: {
facebook: "",
instagram: "",
tiktok: "",
},
};

Toutes les valeurs commerciales doivent être modifiables depuis un seul fichier.

Ne pas inventer de numéro de téléphone, d’adresse e-mail ou de lien social.

Lorsqu’une information n’est pas confirmée, laisser la valeur vide.

4. BARRE D’ANNONCES

Créer une barre d’annonces au-dessus du header avec les messages suivants :

Livraison gratuite dès 200 DT

Livraison partout en Tunisie

Paiement à la livraison

Sur mobile, afficher un seul message à la fois.

L’animation doit être lente et respecter prefers-reduced-motion.

5. HEADER DESKTOP

Créer un header sticky avec :

logo texte temporaire HBS HOME si aucun logo officiel n’est disponible ;

navigation principale ;

recherche ;

favoris ;

suivi de commande ;

panier avec compteur.

Navigation principale :

Nouveautés

Rideaux

Voilages

Stores

Coussins

Accessoires

Sur mesure

Inspirations

Promotions

Créer un premier méga-menu pour la rubrique Rideaux.

Sous-sections :

Par matière

Velours

Satin

Lin

Tous les rideaux

Par besoin

Occultants

Tamisants

Thermiques

Grande largeur

Par finition

À œillets

Pour rail

À galon fronceur

Pour cette phase, la navigation doit être alimentée par une fixture centralisée et non codée directement dans le JSX du header.

6. HEADER ET MENU MOBILE

Créer un header mobile compact contenant :

bouton menu ;

logo HBS HOME ;

bouton recherche ;

panier.

Créer un menu mobile accessible sous forme de drawer plein écran.

Les catégories avec sous-catégories doivent utiliser des accordéons.

Prévoir :

fermeture avec la touche Échap ;

focus visible ;

blocage du scroll arrière-plan ;

zones tactiles d’au moins 44 × 44 px.

7. HERO DE LA PAGE D’ACCUEIL

Créer un seul Hero pour cette première phase.

Contenu :

Tagline : Nouvelle collection

Titre : Des rideaux qui transforment votre intérieur

Texte : Découvrez des matières élégantes, des couleurs actuelles et des finitions pensées pour habiller chaque pièce avec style.

CTA principal : Découvrir les rideaux

CTA secondaire : Voir les nouveautés

Le CTA principal doit conduire vers :

/rideaux

Le CTA secondaire doit conduire vers :

/nouveautes

Sur desktop :

texte à gauche ;

image d’intérieur à droite ;

composition lumineuse ;

hauteur maîtrisée.

Sur mobile :

image au-dessus ;

contenu sous l’image ;

CTA visible sans devoir parcourir plusieurs écrans ;

aucun texte illisible superposé à l’image.

Ne copie pas une image du site Madura.

Utilise une image de démonstration libre, un placeholder qualitatif ou un asset déjà fourni dans le projet.

8. BANDE DE RÉASSURANCE

Sous le Hero, afficher quatre avantages :

Livraison partout en Tunisie

Paiement à la livraison

Livraison gratuite dès 200 DT

Conseil personnalisé

Utiliser des icônes sobres.

Sur mobile, afficher une grille de deux colonnes ou un défilement horizontal accessible.

9. SECTION PRINCIPALES COLLECTIONS

Créer une section intitulée :

Habillez chaque pièce selon votre style

Afficher six cartes :

Rideaux

Voilages

Stores

Coussins

Tringles

Embrasses

Chaque carte doit contenir :

une image ;

un titre ;

une phrase courte ;

un lien Découvrir.

Les données des collections doivent venir d’une fixture centralisée.

Sur desktop, utiliser une grille éditoriale élégante.

Sur mobile, utiliser deux colonnes ou un carousel accessible avec aperçu de la carte suivante.

10. FOOTER

Créer un footer organisé en quatre colonnes.

Collections

Rideaux

Voilages

Stores

Coussins

Accessoires

Besoin d’aide

Guide des mesures

FAQ

Livraison et retours

Suivi de commande

Contact

HBS HOME

À propos

Professionnels

Sur mesure

Inspirations

Informations légales

Conditions générales de vente

Politique de confidentialité

Politique de cookies

Mentions légales

Afficher uniquement les coordonnées configurées.

Ne pas afficher de faux numéro ou de faux réseau social.

11. ARCHITECTURE MINIMALE

Créer au minimum :

src/
components/
layout/
home/
ui/

config/
store.config.ts

fixtures/
navigation.fixture.ts
home.fixture.ts

types/
navigation.types.ts
home.types.ts

Créer des composants réutilisables :

AnnouncementBar
SiteHeader
DesktopMegaMenu
MobileMenu
SiteFooter
HomeHero
TrustStrip
CollectionCard
FeaturedCollections

Ne place pas les données directement dans les composants.

Ne connecte aucune API.

Ne crée aucune base de données.

12. RESPONSIVE ET ACCESSIBILITÉ

Tester au minimum :

375 px ;

768 px ;

1024 px ;

1440 px.

Vérifier :

absence de débordement horizontal ;

navigation clavier ;

focus visible ;

contraste lisible ;

textes alternatifs ;

boutons accessibles ;

menu mobile fonctionnel ;

fermeture des drawers ;

lisibilité mobile.

13. VALIDATION DE LA PHASE

Avant de terminer cette première phase :

vérifie que le header desktop fonctionne ;

vérifie que le menu mobile fonctionne ;

vérifie les liens du Hero ;

vérifie les liens des collections ;

vérifie le responsive ;

exécute le lint si disponible ;

exécute le typecheck si disponible ;

exécute le build de production.

Ne continue pas vers le catalogue ou le panier.

RAPPORT FINAL

À la fin, donne un rapport court avec :

framework détecté ;

routeur utilisé ;

gestionnaire de paquets ;

fichiers créés ;

composants créés ;

sections terminées ;

routes utilisées ;

résultats du lint ;

résultats du typecheck ;

résultat du build ;

problèmes éventuels ;

prochaines étapes recommandées.

Commence maintenant uniquement cette première phase.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/56ca984e-abb8-4b18-b125-9c1b11bbcfb7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
