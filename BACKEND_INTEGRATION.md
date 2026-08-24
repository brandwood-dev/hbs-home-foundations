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
- `ApiOrderRepository` — commandes et suivi serveur dès que `VITE_HBS_API_BASE_URL` est défini ;
  `MockOrderRepository` reste disponible uniquement pour le développement isolé.

Le site public lit les produits publiés via les endpoints publics `/api/v1/products*`. Le
back-office utilise `adminConfig.catalogDataProvider = "api"` pour le catalogue ; les commandes,
clients, stock, promotions et favoris sont déjà branchés selon leurs phases. La médiathèque Admin,
les pages éditoriales et les trois sections administrables de l'accueil utilisent désormais l'API.
Les autres sections de la homepage et certaines fonctions de contact restent explicitement en
fallback fixture jusqu'à leurs phases d'intégration.

Le provider public est sélectionné au build : `"api"` si `VITE_HBS_API_BASE_URL` est défini,
sinon `"mock"` en développement local. Les configurations de pages de catégories restent statiques
jusqu'à l'intégration CMS dédiée. L'écran Admin `/admin/contenu/pages` est persisté via l'API et
Supabase, avec brouillon, blocs JSON, liaison médiathèque et publication contrôlée.

### Pages éditoriales Admin — phase 9C.2

Le scénario de recette est :

```text
Admin crée un brouillon → ajoute des blocs et médias actifs → enregistre
→ publie avec MFA → GET /api/v1/content/pages/:slug → page publique
```

Le backend reste la source de vérité : les pages archivées ou en brouillon ne sont jamais exposées
par l'endpoint public. Les pages publiées sont protégées contre une modification en place dans cette
première version ; le remplacement passe par archivage puis création d'un nouveau brouillon.

### Rendu public et cache — phase 9C.3

Les routes éditoriales publiques (`/a-propos`, `/cgv`, `/confidentialite`, `/contact`, `/cookies`,
`/faq`, `/inspirations`, `/livraison-et-retours`, `/mentions-legales`) chargent exclusivement la
page publiée via `GET /api/v1/content/pages/:slug`. Le frontend ne rend jamais le JSON de bloc comme
du HTML arbitraire : seuls les blocs connus sont rendus et le texte est échappé par React. Le titre,
la description SEO et le canonical sont dérivés de la page publiée. Les brouillons/archives donnent
une page introuvable indexée `noindex`.

Le cache partagé est limité à 60 secondes (`stale-while-revalidate=300`) afin de laisser le temps à
Cloudflare d'expirer après une publication sans exposer durablement une ancienne version.

### Panier serveur (phase 5A)

En preview/staging, `repositoryFactory.ts` sélectionne `ApiCartRepository`. Le cookie de panier est
géré par l'API et envoyé avec `credentials: include`; aucun prix ou stock ne vient du localStorage.
Le repository local reste disponible uniquement pour le développement isolé sans URL API. La réponse
serveur peut signaler une variation de prix, une quantité ajustée, une ligne indisponible ou une
promotion non applicable afin que l'UI demande une confirmation avant le checkout.

### Promotions Admin — Phase 5B

L’écran `/admin/promotions` consomme `GET/POST/PATCH /api/v1/admin/promotions` et
`POST /api/v1/admin/promotions/:id/archive`. Le navigateur ne lit jamais la table
`commerce.promotions` directement : le token Supabase est transmis à l’API, qui applique
RBAC (`promotions.read`/`promotions.write`), MFA pour les mutations et l’audit append-only.

Le panier public expose le champ code sur `/panier` et dans le drawer. `POST`/`DELETE`
`/api/v1/cart/promotion` sont la source de vérité des totaux et du retrait du code.

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

### Catalogue Admin (phases 3C.3, 9A et 9B)

Les routes suivantes sont consommées avec la session Supabase courante :

```text
GET/PATCH/POST /api/v1/admin/categories
GET/PATCH/POST /api/v1/admin/attributes
GET/POST/PATCH /api/v1/admin/products
POST           /api/v1/admin/products/:id/publish|archive
POST/PATCH     /api/v1/admin/products/:id/variants
POST           /api/v1/admin/products/:id/variants/:variantId/archive
```

Le modèle API normalisé est adapté vers les types Admin historiques. Les métadonnées de catégories
(image, SEO, navigation) et les propriétés d'attributs (ordre, axe de variante, système, options
de couleur/statut) sont persistées dans les tables normalisées. Les associations d'attributs sont
exprimées par les slugs de catégories API ; une liste vide signifie toutes les catégories.
L'archivage d'une ressource utilisée est refusé par l'API afin de préserver l'intégrité du catalogue.

Les valeurs dynamiques de la fiche produit sont maintenant chargées depuis `GET /admin/attributes`
et affichées dans l'onglet « Caractéristiques ». Lors d'un enregistrement, elles sont envoyées dans
`attributes`, validées par l'API selon le type, la catégorie et les options actives, puis persistées
dans `catalog.product_attributes`. La publication applique aussi les attributs obligatoires. Le
champ `payload` n'est conservé que comme projection de compatibilité pour le catalogue public.

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
OrderTrackingForm → useTrackOrder → OrderRepository.trackOrder → ApiOrderRepository (staging/prod)
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

## Recherche et favoris (phase 8A/8B)

- `SearchRepository` (`suggest`, `search`) — implémentation actuelle `ApiSearchRepository` dès que
  `VITE_HBS_API_BASE_URL` est défini. Les produits, filtres, tris, pagination et compteurs sont
  résolus par `GET /api/v1/products`; les catégories restent un index de navigation frontend et
  les articles ne sont pas encore fournis par l'API.
- `SearchHistoryRepository` — `LocalSearchHistoryRepository`, historique local, 8 entrées max,
  jamais envoyé au serveur, même après branchement de l'API.
- `FavoritesRepository` — `ApiFavoritesRepository` en preview/staging et production : les
  favoris invités sont persistés par l'API avec le cookie HttpOnly `hbs_favorites_token` ; seuls
  le hash du cookie, `product_id`, `added_at` et l'expiration sont conservés dans la table privée
  `commerce.favorite_items`. `LocalFavoritesRepository` reste le fallback du développement isolé.
- La réponse API résout toujours les produits publiés et retourne `removedProductIds` pour les
  produits retirés. Le plafond est de 200 favoris par cookie et l'expiration est de 365 jours.
- Une migration best-effort importe les favoris locaux existants avant de les vider, uniquement
  après le succès de tous les appels. Un échec réseau conserve les données locales pour une reprise.
- Synchronisation entre onglets via l'événement `storage` et invalidation TanStack Query.
- SSR : aucun accès à `localStorage` pendant le rendu serveur ; compteurs et cœurs n'apparaissent
  qu'après hydratation.
- Bascule backend : `src/repositories/repositoryFactory.ts` sélectionne désormais
  `ApiSearchRepository` et `ApiFavoritesRepository` dès que `VITE_HBS_API_BASE_URL` est défini —
  aucun composant ne change.
- Endpoints actifs : voir `API_CONTRACT.md` → sections Catalogue/recherche et Favoris. Les routes
  dédiées `/api/v1/search` et `/api/v1/search/suggestions` restent contractuelles pour une phase
  ultérieure et ne doivent pas être considérées comme disponibles en staging.

## Page d'accueil administrable (phase 9D.1)

Le socle backend introduit une révision versionnée pour le hero, la banderole promotionnelle et
Shop the Look. L'Admin enregistre un brouillon avec contrôle optimiste `expectedVersion`, puis le
publie explicitement. Une publication crée un snapshot public immuable; les anciennes révisions
restent archivées pour audit et retour arrière. Les coordonnées des hotspots sont relatives à l'image
(`xPercent`/`yPercent`) afin de rester stables sur mobile et desktop, et chaque hotspot pointe vers
un produit catalogue contrôlé par l'API.

L'éditeur visuel et le branchement de `ContentRepository` au frontend sont livrés dans les
sous-phases 9D.2 et 9D.3. Le frontend conserve néanmoins un fallback fixture pour les sections non
encore administrables ; aucune donnée de brouillon n'est exposée publiquement.

### Éditeur Admin homepage (phase 9D.2)

La route `/admin/contenu/accueil` utilise désormais `ApiAdminHomeContentRepository`. Elle permet
de modifier le brouillon du Hero, de la banderole promotionnelle et de Shop the Look. Les médias
sont sélectionnés depuis la médiathèque API et les hotspots sont positionnés en pourcentage sur
l’image, puis liés à un produit publié du catalogue.

L’enregistrement envoie `expectedVersion` pour conserver le contrôle optimiste. La publication et
l’archivage restent des actions séparées, protégées par `content.publish` et par la MFA exigée par
l’API.

### Homepage publique connectée (phase 9D.3)

`ApiContentRepository.getHomePage()` consomme désormais `GET /api/v1/content/home` lorsque l’URL
API est configurée. Le snapshot public est mappé vers le contrat frontend sans exposer les
identifiants internes :

- `hero` remplace les textes, CTA, média desktop et média mobile ;
- `promo_banner` alimente la banderole affichée en haut de la homepage ;
- `shop_the_look` remplace le titre, l’image et les hotspots liés aux produits publiés.

Les autres sections restent provisoirement servies par les fixtures, conformément au périmètre
9D.1. Tant qu’aucune publication homepage n’existe, un 404 public conserve le fallback existant
afin que le site reste navigable pendant la préparation du premier contenu. Les erreurs API autres
qu’un 404 sont propagées pour être visibles dans l’observabilité et l’interface d’erreur.
