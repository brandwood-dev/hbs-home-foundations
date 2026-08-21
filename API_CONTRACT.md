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

## Catalogue Admin (phase 3C)

Le back-office consomme les routes catalogue avec le même bearer Supabase. Les lectures requièrent
`products.read` ou `categories.read`; les écritures requièrent respectivement `products.write` ou
`categories.write`, et la publication/archivage produit requiert `products.publish`. Les mutations
sont protégées par `aal2` et écrivent un événement d'audit.

```text
GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
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

Les produits et variantes utilisent des montants entiers en millimes et un champ JSON `payload`
pour les attributs spécifiques non encore normalisés. Une suppression demandée depuis l'interface
est traduite en archivage afin de préserver l'historique des commandes.

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

## Recherche globale (phase 10)

### `GET /api/v1/search`

```
GET /api/v1/search?q=fauteuil%20boucle&category=mobilier_interieur&sort=relevance&page=1&limit=12
```

`sort` : `relevance` | `newest` | `price_asc` | `price_desc`.
`category` : une des huit catégories publiques (`rideaux`, `voilages`, `stores`, `coussins`,
`galettes_de_chaise`, `accessoires`, `mobilier_interieur`, `plantes_decoration`) ou absente.
Les paramètres inconnus sont ignorés.

```json
{
  "success": true,
  "data": {
    "query": "fauteuil boucle",
    "products": ["ProductDto"],
    "categories": [{ "id": "string", "label": "string", "href": "string" }],
    "articles": [
      {
        "id": "string",
        "title": "string",
        "slug": "string",
        "excerpt": "string",
        "imageUrl": "string",
        "readingTime": "string"
      }
    ],
    "page": 1,
    "limit": 12,
    "totalProducts": 12,
    "totalPages": 1,
    "categoryCounts": { "mobilier_interieur": 5, "plantes_decoration": 3 }
  }
}
```

### `GET /api/v1/search/suggestions`

```
GET /api/v1/search/suggestions?q=plante
```

Réponse : `{ products: ProductDto[6], categories: […5], articles: […3] }`.
Requête minimale : 2 caractères après normalisation.

### Attentes du moteur backend

- indexation des produits publiés uniquement (variantes inactives et produits archivés exclus) ;
- normalisation identique au frontend : accents, apostrophes, tirets, ligatures, casse ;
- synonymes éditoriaux explicites (`src/services/search/search-synonyms.ts`) ;
- recherche par référence et par SKU exacts prioritaires ;
- attributs multi-catégories indexés (matière, couleur, opacité, type de store, type d'accessoire,
  type de mobilier, style, pièce, nature de plante, entretien, exposition, pot inclus…) ;
- dimensions reconnues (`45x45`, `150 cm`, `120-210 cm`) en bonus de pertinence ;
- pagination serveur, tri stable, barème de pertinence documenté ;
- suggestions limitées et mises en cache court, rate limiting par IP ;
- analytics agrégés uniquement : requête normalisée, nombre de résultats, catégorie — jamais de
  donnée personnelle.

## Favoris (phase 10)

Mode actuel : favoris invités stockés localement (`hbs-home-favorites-v1`), aucun appel réseau.

```
GET    /api/v1/favorites
POST   /api/v1/favorites/items      { "productId": "string" }
DELETE /api/v1/favorites/items/:productId
DELETE /api/v1/favorites
```

```json
{
  "success": true,
  "data": {
    "items": [{ "product": "ProductDto", "addedAt": "2026-01-01T10:00:00.000Z" }]
  }
}
```

### Fusion future à la connexion (non implémentée)

1. lire les favoris invités locaux ;
2. lire les favoris du compte ;
3. fusionner par `productId` ;
4. conserver la date d'ajout la plus ancienne en cas de conflit ;
5. envoyer la liste fusionnée au backend ;
6. vider le stockage local **uniquement après succès**.

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
