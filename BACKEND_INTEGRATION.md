# HBS HOME — Intégration backend

## État actuel

Les données métier du frontend sont encore mixtes :

- le catalogue public utilise `ApiProductRepository` dès que
  `VITE_HBS_API_BASE_URL` est fourni au build (preview/staging et production) ; sans cette
  variable, le fallback local reste `MockProductRepository` pour permettre le développement isolé ;
- les écrans Admin Produits, Catégories et Attributs utilisent désormais les
  repositories HTTP de `src/admin/repositories/api/admin-catalog-api-repositories.ts` ;
- `LocalCartRepository` — panier persistant (localStorage, versionné) ;
- `ApiCartRepository` — panier invité serveur dès que `VITE_HBS_API_BASE_URL` est défini ;
- `MockOrderRepository` — commandes créées et lues dans `sessionStorage`.

Le site public lit les produits publiés via les endpoints publics `/api/v1/products*`. Le
back-office utilise `adminConfig.catalogDataProvider = "api"` pour le catalogue uniquement ; les
commandes, clients, stock et contenu restent explicitement mockés jusqu'à leurs phases dédiées.

Le provider public est sélectionné au build : `"api"` si `VITE_HBS_API_BASE_URL` est défini,
sinon `"mock"` en développement local. Les données de contenu éditorial et les configurations de
pages de catégories restent statiques jusqu'à l'intégration CMS dédiée.

### Panier serveur (phase 5A)

En preview/staging, `repositoryFactory.ts` sélectionne `ApiCartRepository`. Le cookie de panier est
géré par l'API et envoyé avec `credentials: include`; aucun prix ou stock ne vient du localStorage.
Le repository local reste disponible uniquement pour le développement isolé sans URL API. La réponse
serveur peut signaler une variation de prix, une quantité ajustée, une ligne indisponible ou une
promotion non applicable afin que l'UI demande une confirmation avant le checkout.

### Catalogue public (phase 3C.4)

Le même `ProductRepository` est utilisé par les listes, la page détail, les recommandations,
les sélections de la page d'accueil et la résolution des favoris locaux. En preview, le scénario
attendu est :

```text
Admin publie un produit → GET /api/v1/products* → catalogue public
```

Les produits renvoyés par l'API conservent leur indicateur `isDemo`; le frontend ne force plus
tous les produits API en mode démonstration.

L'authentification du back-office n'est plus simulée. La phase 2 fournit une connexion Supabase
Auth en PKCE, une activation par invitation, un MFA TOTP obligatoire et une résolution des rôles et
permissions par l'API. Chaque mutation catalogue transmet le bearer Supabase et laisse l'API
appliquer MFA, permissions et audit. Les erreurs `401`, `403` et `409/422` sont remontées à l'UI.

### Catalogue Admin (phase 3C.3)

Les routes suivantes sont consommées avec la session Supabase courante :

```text
GET/PATCH/POST /api/v1/admin/categories
GET/PATCH/POST /api/v1/admin/attributes
GET/POST/PATCH /api/v1/admin/products
POST           /api/v1/admin/products/:id/publish|archive
POST/PATCH     /api/v1/admin/products/:id/variants
POST           /api/v1/admin/products/:id/variants/:variantId/archive
```

Le modèle API normalisé est adapté vers les types Admin historiques. Les champs UI plus riches
(SEO, tags et axes) restent conservés dans le `payload`. Les médias sont maintenant téléversés
dans le bucket public Supabase `product-media`, puis leurs métadonnées sont synchronisées par
l'API dans `catalog.product_media`. La suppression est volontairement une archive réversible,
car l'API ne propose pas de suppression physique.

### Médias produits (phase 3C.5)

Le navigateur utilise uniquement `VITE_SUPABASE_PUBLISHABLE_KEY` et la session Admin MFA pour
téléverser les images acceptées (JPG, PNG, WebP, AVIF, 10 Mo maximum). Le secret Supabase n'est
jamais exposé. Le payload produit transmet ensuite `imageAssets` et l'API reconstruit la projection
publique `images` à partir de `catalog.product_media` lors d'une publication.

Le scénario de recette est :

```text
Admin → Storage product-media → PATCH/POST produit (métadonnées) → publication API → catalogue public
```

Variables publiques requises au build staging :

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_HBS_API_BASE_URL=https://api-preview.hbs-home.com
```

La clé publishable est destinée au navigateur et ne confère aucun droit serveur. Une clé Supabase
secrète ou `service_role` est interdite dans toute variable `VITE_*`.

## Suivi de commande sans compte (phase 6)

### Flux frontend

```
OrderTrackingForm → useTrackOrder → OrderRepository.trackOrder → MockOrderRepository
                                     → vérification numéro + téléphone → OrderTrackingResult
```

- Le numéro de commande est normalisé (`normalizeOrderNumber`), le téléphone via
  `normalizeTunisianPhone` ; la comparaison est exacte après normalisation.
- Aucun composant n'accède au stockage, ne lit les fixtures, ni ne construit la timeline.
- La timeline est produite par la fonction pure `buildOrderTrackingTimeline(order)`.
- Le frontend ne fait jamais progresser automatiquement une commande : le backend sera la source
  de vérité du statut, des dates et des événements de suivi.

### Stockage mock

- Clé : `hbs-home-orders-demo-v1`, structure `{ version: 1, orders: Order[] }` ;
- `sessionStorage` uniquement (jamais `localStorage` pour les commandes) ;
- 10 commandes maximum, les plus anciennes sont supprimées ;
- migration automatique de la clé de la phase 5 (`hbs-home-orders-demo`) ;
- données corrompues ou version inconnue : historique ignoré silencieusement ;
- limitation connue : la fermeture de l'onglet supprime l'historique.

Six commandes de démonstration (`src/fixtures/order-tracking.fixture.ts`) couvrent tous les
statuts et restent consultables en SSR.

### Endpoint cible

Voir `API_CONTRACT.md` → `POST /api/v1/orders/track`.

### Sécurité à implémenter côté backend

- rate limiting par IP et par numéro de commande ;
- validation stricte du payload et normalisation du téléphone côté serveur ;
- journalisation des tentatives **sans donnée personnelle** ;
- protection anti-bot (captcha ou équivalent) ;
- réponse générique unique pour limiter l'énumération des commandes ;
- limitation et masquage des données retournées ;
- cache désactivé (`Cache-Control: no-store`) pour cette réponse.

Le mock frontend est une démonstration fonctionnelle : il n'apporte aucune sécurité réelle.

## Recherche et favoris (phase 10)

- `SearchRepository` (`suggest`, `search`) — implémentation actuelle `MockSearchRepository`,
  index mémoire construit une seule fois par cycle de données à partir du `ProductRepository`.
- `SearchHistoryRepository` — `LocalSearchHistoryRepository`, historique local, 8 entrées max,
  jamais envoyé au serveur, même après branchement de l'API.
- `FavoritesRepository` — `LocalFavoritesRepository` : seuls `productId` et `addedAt` sont
  persistés ; les produits sont résolus à chaque lecture via `ProductRepository.getByIds()`,
  les produits disparus du catalogue sont nettoyés silencieusement.
- Synchronisation entre onglets via l'événement `storage` et invalidation TanStack Query.
- SSR : aucun accès à `localStorage` pendant le rendu serveur ; compteurs et cœurs n'apparaissent
  qu'après hydratation.
- Bascule backend : remplacer les implémentations dans `src/repositories/repositoryFactory.ts`
  par `ApiSearchRepository` et `ApiFavoritesRepository` — aucun composant ne change.
- Endpoints cibles : voir `API_CONTRACT.md` → sections Recherche globale et Favoris.
