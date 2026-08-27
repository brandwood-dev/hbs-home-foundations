# HBS HOME — Contrat d'API (préparation backend)

Les prix sont exprimés en millimes (1 DT = 1000). Le frontend consomme les repositories
(`ProductRepository`, `CartRepository`, `OrderRepository`) ; le passage à l'API ne doit modifier
aucun composant.

Le contrat machine faisant foi est `openapi/hbs-home-api.v1.json`. Ce document complète le contrat
avec les règles métier et de sécurité attendues.

## Identité et autorisations Admin (phase 2)

Toutes les routes Admin reçoivent un access token Supabase dans `Authorization: Bearer <token>`.
L'API vérifie la signature avec le JWKS du projet, puis recharge le profil, les rôles et les
permissions depuis PostgreSQL. Les métadonnées modifiables de l'utilisateur ne sont jamais une
source d'autorisation.

### `GET /api/v1/admin/session`

Accessible à un profil Admin actif dès `aal1` afin de permettre l'enrôlement MFA. Retourne l'identité
minimale, les rôles, les permissions, le niveau d'assurance et `mfaRequired`. Un utilisateur Supabase
sans profil Admin actif reçoit `403 ADMIN_ACCESS_DENIED`.

### `GET /api/v1/admin/audit-events?limit=50`

Exige `aal2` et la permission `audit.read`. Retourne les événements immuables les plus récents. Les
autres routes Admin sensibles suivront la même séquence : JWT valide, profil actif, MFA, permission
explicite, audit.

Erreurs normalisées : `401 AUTH_REQUIRED`, `401 INVALID_ACCESS_TOKEN`, `403 ADMIN_ACCESS_DENIED`,
`403 MFA_REQUIRED`, `403 PERMISSION_DENIED`.

## Catalogue Admin (phases 3C, 9A et 9B)

Le back-office consomme les routes catalogue avec le même bearer Supabase. Les lectures requièrent
`products.read` ou `categories.read`; les écritures requièrent respectivement `products.write` ou
`categories.write`, et la publication/archivage produit requiert `products.publish`. Les mutations
sont protégées par `aal2` et écrivent un événement d'audit.

Une catégorie expose ses métadonnées éditoriales (`imageUrl`, `imageMediaAssetId`, `seoTitle`,
`seoDescription` et `showInNavigation`). Un attribut expose son ordre, son usage comme axe de variante, son statut
système, ses options enrichies (`hex`, `family`, `isActive`) et les slugs des catégories auxquelles
il est associé (`categorySlugs`). Une liste vide de catégories signifie « toutes les catégories ».

Une fiche produit expose désormais `attributes`, indexé par clé technique. Les valeurs envoyées sur
`POST/PATCH /api/v1/admin/products` sont validées par l'API contre le type, la catégorie, les options
actives et les attributs obligatoires, puis persistées dans `catalog.product_attributes`. La publication
refuse tout produit dont un attribut obligatoire applicable est absent. Les options retirées d'un
attribut sont conservées comme inactives afin de ne pas invalider les valeurs historiques.

L'archivage d'une catégorie ou d'un attribut utilisé par un produit, une catégorie enfant ou une
association catalogue est refusé par l'API afin de préserver l'intégrité métier.

```text
GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
POST   /api/v1/admin/categories/image
PATCH  /api/v1/admin/categories/:id
GET    /api/v1/admin/attributes
POST   /api/v1/admin/attributes
PATCH  /api/v1/admin/attributes/:id
GET    /api/v1/admin/products?status=&q=&limit=&offset=
POST   /api/v1/admin/products
GET    /api/v1/admin/products/:id
PATCH  /api/v1/admin/products/:id
POST   /api/v1/admin/products/:id/publish
POST   /api/v1/admin/products/:id/archive
POST   /api/v1/admin/products/:id/variants
PATCH  /api/v1/admin/products/:id/variants/:variantId
POST   /api/v1/admin/products/:id/variants/:variantId/archive
```

### Upload des images de catégories (phase 10D)

L’interface Admin peut envoyer directement un fichier JPEG, PNG ou WebP à
`POST /api/v1/admin/categories/image` avec la session MFA courante. L’API limite le payload à
8 MiB, valide le contenu réel, redimensionne sans agrandissement au maximum à 2400 px, convertit
le fichier en WebP (qualité 82), puis le stocke dans le bucket public `catalog-media`. La réponse
contient l’URL publique et l’identifiant de l’asset ; cet identifiant doit être transmis dans
`imageMediaAssetId` lors de la création ou modification de la catégorie. Une URL externe reste
possible en secours en laissant cet identifiant nul.

Le secret Storage reste exclusivement côté API (`SUPABASE_STORAGE_SECRET_KEY`). Si cette variable
manque, l’endpoint répond `503 MEDIA_STORAGE_NOT_CONFIGURED` et aucune donnée n’est inventée côté
frontend.

Les produits et variantes utilisent des montants entiers en millimes. Le champ JSON `payload` reste
une projection de compatibilité ; les attributs administrables sont désormais normalisés dans
`catalog.product_attributes`. Une suppression demandée depuis l'interface est traduite en archivage
afin de préserver l'historique des commandes.

### Médias catalogue (phase 3C.5)

Les images ne transitent pas par l'API en multipart. Le navigateur Admin téléverse directement les
fichiers JPG, PNG, WebP ou AVIF (10 Mo maximum) dans le bucket public Supabase Storage
`product-media`, avec la session MFA courante, puis transmet leurs métadonnées dans
`payload.imageAssets` :

```json
{
  "id": "img-001",
  "url": "https://PROJECT_REF.supabase.co/storage/v1/object/public/product-media/products/rideau/uuid.jpg",
  "storagePath": "products/rideau/uuid.jpg",
  "publicUrl": "https://PROJECT_REF.supabase.co/storage/v1/object/public/product-media/products/rideau/uuid.jpg",
  "alt": "Rideau en lin naturel",
  "order": 1,
  "isPrimary": true,
  "type": "front"
}
```

Les réponses Admin `AdminProduct` exposent `media[]` avec le chemin Storage, l'URL publique, le
texte alternatif, le type, le statut et l'ordre. À la publication, l'API reconstruit la projection
publique `images[]` depuis `catalog.product_media`. Une clé Supabase secrète ou `service_role` ne
doit jamais être exposée au frontend.

### Contenu éditorial et pages (phase 9C.2)

Les pages suivent le flux `draft → published → archived`. Les lectures Admin requièrent
`content.read`; les créations et mises à jour requièrent `content.write` avec une session MFA
`aal2`; la publication et l'archivage requièrent `content.publish` avec `aal2`. Chaque mutation est
auditée. Une page publiée ne peut pas être modifiée en place dans cette première incrémentation :
elle doit être archivée puis remplacée par un nouveau brouillon afin qu'un brouillon ne modifie jamais
le contenu public par accident.

```text
GET   /api/v1/admin/content/pages
GET   /api/v1/admin/content/pages/:id
POST  /api/v1/admin/content/pages
PATCH /api/v1/admin/content/pages/:id
POST  /api/v1/admin/content/pages/:id/publish
POST  /api/v1/admin/content/pages/:id/archive
GET   /api/v1/content/pages/:slug
```

Les blocs sont ordonnés, limités à 64 KiB chacun et stockés comme objets JSON. Un bloc peut référencer
un média de `content.media_assets`; la publication exige que les médias associés soient actifs. La
réponse publique retire les identifiants internes et ne renvoie que les pages publiées et les URLs de
médias actifs.

La lecture publique est cacheable par Cloudflare : `s-maxage=60` et
`stale-while-revalidate=300`. Les 404 de pages non publiées sont conservées au maximum 30 secondes.
Une publication peut donc nécessiter jusqu'à une minute avant l'expiration du cache partagé.

### Configuration de la page d'accueil (phase 9D.1)

La configuration de la page d'accueil suit le même cycle `draft → published → archived`. Le premier
incrément couvre les sections `hero`, `promo_banner` et `shop_the_look` ; les autres sections de la
page restent servies par le contenu existant jusqu'à leur prochaine phase d'administration.

```text
GET  /api/v1/admin/content/home
PUT  /api/v1/admin/content/home
POST /api/v1/admin/content/home/publish
POST /api/v1/admin/content/home/archive
GET  /api/v1/content/home
```

La lecture Admin requiert `content.read`. L'enregistrement d'un brouillon requiert `content.write`
et une session MFA `aal2`; publier ou archiver requiert `content.publish` et `aal2`. Le payload est
versionné (`expectedVersion`) pour éviter qu'un éditeur écrase les modifications d'un autre. Les
hotspots Shop the Look référencent un produit catalogue publié et utilisent des coordonnées en
pourcentage (`xPercent`, `yPercent`, de 0 à 100). La réponse publique ne contient aucun identifiant
interne de révision, section, média ou hotspot et ne renvoie que les médias actifs et les produits
publiés. Elle est cacheable par Cloudflare avec `s-maxage=60` et
`stale-while-revalidate=300`; l'absence de publication est cacheable 30 secondes.

La section `promo_banner` utilise le payload suivant :

```json
{
  "messages": [
    {
      "id": "shipping-200",
      "label": "HBS HOME",
      "text": "Livraison gratuite dès 200 DT",
      "href": "/promotions",
      "isEnabled": true,
      "sortOrder": 0
    }
  ]
}
```

Le backend accepte encore l'ancien format `{ "label", "text", "href" }` et le normalise en un
message. Les messages sont limités à 20 éléments, triés par `sortOrder`, contrôlés côté serveur et
les liens doivent être des chemins relatifs ou des URLs HTTP(S). Le frontend n'affiche que les
messages actifs ; zéro message actif masque la banderole et plusieurs messages sont animés en boucle
au-dessus du header global.

La section `collections` de la homepage est alimentée par le catalogue public :
`GET /api/v1/catalog/categories?navigation=true` renvoie les catégories racines actives et visibles
dans la navigation, avec leur image publique lorsqu'elle existe. Le frontend utilise ces données
pour les cartes de collections et n'affiche pas une catégorie sans image. Les sous-catégories sont
exposées dans la réponse catalogue et utilisées par les pages de catégorie, pas comme cartes racines
de la homepage. Cette route est cacheable avec `s-maxage=60` et
`stale-while-revalidate=300`.

## Suivi de commande sans compte

### `POST /api/v1/orders/track`

Payload :

```json
{ "orderNumber": "HBS-20260818-100001", "phone": "+21622123456" }
```

Le téléphone ne doit jamais transiter par l'URL ni par un `GET`.

Réponse de succès :

```json
{
  "success": true,
  "data": {
    "orderNumber": "HBS-20260818-100001",
    "status": "preparing",
    "statusLabel": "En préparation",
    "createdAt": "2026-08-18T09:15:00.000Z",
    "updatedAt": "2026-08-18T11:00:00.000Z",
    "maskedPhone": "+216 22 *** 456",
    "deliveryMethod": "home_delivery",
    "deliveryLocation": { "governorate": "tunis", "city": "Tunis" },
    "items": [],
    "totals": { "subtotalMinor": 0, "shippingMinor": 0, "totalMinor": 0 },
    "timeline": [
      {
        "key": "received",
        "label": "Commande reçue",
        "description": "Nous avons bien enregistré votre commande.",
        "state": "completed",
        "completedAt": "2026-08-18T09:15:00.000Z"
      }
    ]
  }
}
```

Statuts : `pending_confirmation`, `confirmed`, `preparing`, `shipped`, `delivered`, `cancelled`.
États d'étape : `completed`, `current`, `upcoming`, `cancelled`.

Réponse introuvable — identique que la commande soit inconnue ou que le téléphone ne corresponde
pas :

```json
{
  "success": false,
  "error": {
    "code": "ORDER_TRACKING_NOT_FOUND",
    "message": "Aucune commande ne correspond aux informations saisies."
  }
}
```

### Données interdites dans la réponse

Téléphone complet, adresse complète, point de repère, note au livreur, e-mail, notes internes,
informations administratives.

## Recherche catalogue (phase 8A — contrat actuellement déployé)

La recherche actuellement déployée réutilise l'endpoint catalogue paginé. Le frontend envoie la
requête et les filtres au serveur ; les catégories de suggestion restent un index de navigation
frontend et les articles ne sont pas encore renvoyés par l'API.

### `GET /api/v1/products`

```
GET /api/v1/products?q=fauteuil%20boucle&categories=mobilier_interieur&sort=recommended&page=1&pageSize=12
```

`sort` : `recommended` | `newest` | `best_sellers` | `price_asc` | `price_desc` | `discount`.
`categories` accepte une liste séparée par des virgules. Les paramètres de filtres catalogue
(`materials`, `colors`, `availability`, prix, attributs métier, etc.) sont définis par le schéma
OpenAPI généré et sont validés par l'API.

```json
{
  "items": ["ProductDto"],
  "page": 1,
  "pageSize": 12,
  "total": 12,
  "totalPages": 1,
  "categoryCounts": { "mobilier_interieur": 5, "plantes_decoration": 3 }
}
```

### Suggestions

Les suggestions de produits utilisent le même endpoint `/api/v1/products` avec `page=1` et une
taille limitée. Les suggestions de catégories sont calculées depuis l'index de navigation du
frontend. Une future route dédiée `/api/v1/search/suggestions` pourra être ajoutée sans modifier le
contrat `SearchRepository`.

Réponse frontend : `{ products, categories, articles }`, avec `articles: []` tant que la recherche
éditoriale n'est pas persistée côté API.

### Attentes du moteur backend

- indexation des produits publiés uniquement (variantes inactives et produits archivés exclus) ;
- normalisation identique au frontend : accents, apostrophes, tirets, ligatures, casse ;
- synonymes éditoriaux explicites (`src/services/search/search-synonyms.ts`) ;
- recherche par référence et par SKU exacts prioritaires ;
- attributs multi-catégories indexés (matière, couleur, opacité, type de store, type d'accessoire,
  type de mobilier, style, pièce, nature de plante, entretien, exposition, pot inclus…) ;
- dimensions reconnues (`45x45`, `150 cm`, `120-210 cm`) en bonus de pertinence ;
- pagination serveur, tri stable, barème de pertinence documenté ;
- suggestions limitées côté frontend et mises en cache court ; le rate limiting API reste à
  implémenter avant l'exposition publique de fonctions de recherche dédiées ;
- analytics agrégés uniquement : requête normalisée, nombre de résultats, catégorie — jamais de
  donnée personnelle.

## Favoris (phase 8B)

En preview/staging et en production, les favoris invités sont persistés côté API avec un cookie
HttpOnly opaque (`hbs_favorites_token`, durée maximale 365 jours). Sans URL API, le repository local
reste disponible pour le développement isolé.

```
GET    /api/v1/favorites
POST   /api/v1/favorites/items      { "productId": "string" }
DELETE /api/v1/favorites/items/:productId
DELETE /api/v1/favorites
```

```json
{
  "items": [
    {
      "productId": "string",
      "addedAt": "2026-01-01T10:00:00.000Z",
      "product": "ProductDto",
      "isAvailable": true
    }
  ],
  "removedProductIds": [],
  "count": 1
}
```

### Migration locale vers le cookie invité

1. lire les favoris locaux existants ;
2. envoyer chaque `productId` au backend ;
3. ignorer uniquement les produits retirés du catalogue (404) ;
4. vider le stockage local **uniquement après succès de tous les envois**.

La future activation des comptes clients ajoutera une fusion compte/invité explicite. La table
`commerce.favorite_items` est privée, protégée par RLS et accessible uniquement au rôle `hbs_api`.

## Guide des mesures, sur-mesure et professionnels

### GET /api/v1/measurement-rules

Retourne l'objet `MeasurementRules` (limites, ampleurs autorisées, ajustements sol, jeux de pose
store, tolérances de recommandation). Aujourd'hui servi par `MockMeasurementRulesRepository`.
Réponse : `{ "data": MeasurementRules }`. Doit être reconfigurable sans redéploiement.

### POST /api/v1/custom-quotes

Corps : `CustomQuoteRequest` (type de produit, liste d'ouvertures avec dimensions, préférences,
coordonnées, métadonnées de pièces jointes, consentement).
Réponse : `{ "data": { "reference": "DEV-YYMMDD-XXXX", "submittedAt": ISO8601 } }`.
Les fichiers seront envoyés séparément (upload signé) ; le front n'envoie que les métadonnées.

### POST /api/v1/professional-leads

Corps : `ProfessionalLeadRequest` (raison sociale, activité, volume, contact, message, consentement).
Réponse : `{ "data": { "reference": "PRO-YYMMDD-XXXX", "submittedAt": ISO8601 } }`.

Les recommandations produits du guide restent calculées côté client à partir du catalogue
(`GET /api/v1/products`) ; aucune donnée de mesure n'est transmise tant qu'un devis n'est pas envoyé.

## Panier serveur et prix (phase 5A)

Le panier invité est identifié par un jeton opaque envoyé dans un cookie `HttpOnly`, `Secure` et
`SameSite=Lax` sur le domaine HBS HOME. Le navigateur ne transmet jamais de prix comme source de
vérité. Le backend relit la variante publiée et le stock disponible à chaque mutation et lecture.
L'ajout au panier ne réserve pas le stock ; la réservation transactionnelle intervient au checkout.

````text
GET    /api/v1/cart
POST   /api/v1/cart/items                  { "productId": "…", "variantId": "…", "quantity": 1 }
PATCH  /api/v1/cart/items/:lineId          { "quantity": 2 }
DELETE /api/v1/cart/items/:lineId
DELETE /api/v1/cart
POST   /api/v1/cart/promotion              { "code": "…" }
DELETE /api/v1/cart/promotion

### Promotions Admin — Phase 5B

Les règles de promotion sont gérées exclusivement par l’API avec une permission
`promotions.read` (lecture) ou `promotions.write` (mutations, MFA `aal2`). Les écritures
sont auditées et une promotion est désactivée par archivage logique.

```text
GET    /api/v1/admin/promotions
POST   /api/v1/admin/promotions
GET    /api/v1/admin/promotions/:id
PATCH  /api/v1/admin/promotions/:id
POST   /api/v1/admin/promotions/:id/archive
````

Le corps utilise `name`, `code`, `discountType` (`percentage` ou `fixed_amount`),
`discountValue`, `minSubtotalMinor`, `startsAt`, `endsAt`, `maxRedemptions` et `isActive`.
Le serveur normalise le code en majuscules et recalcule toujours la remise à partir du
sous-total serveur.

```

La réponse expose les lignes réconciliées, le prix courant, le prix observé à l'ajout, la
disponibilité, les frais de livraison estimés et `discountMinor`. Une seule promotion peut être
attachée au panier en V1. Les promotions sont vérifiées par fenêtre de validité, minimum de panier
et limite d'utilisation ; leur compteur n'est consommé qu'à la création de commande.
```
