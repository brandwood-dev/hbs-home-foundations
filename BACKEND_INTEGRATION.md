# HBS HOME — Intégration backend

## État actuel

Le frontend fonctionne intégralement en mode mock :

- `MockProductRepository` — catalogue statique (24 produits) ;
- `LocalCartRepository` — panier persistant (localStorage, versionné) ;
- `MockOrderRepository` — commandes créées et lues dans `sessionStorage`.

`dataProvider` dans `src/config/features.config.ts` vaut `"mock"`. Le futur `ApiOrderRepository`
devra implémenter la même interface ; aucun composant ne devra changer.

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
