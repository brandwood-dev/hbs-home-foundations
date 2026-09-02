# Livraison du frontend HBS HOME

## Environnements

| Environnement | URL                            | Déclenchement                           | Indexation                         |
| ------------- | ------------------------------ | --------------------------------------- | ---------------------------------- |
| Local         | `http://localhost:5173`        | manuel                                  | désactivée par l'application       |
| Staging       | `https://preview.hbs-home.com` | automatique après CI verte sur `main`   | `X-Robots-Tag: noindex, nofollow`  |
| Production    | `https://hbs-home.com`         | approbation manuelle au lancement final | autorisée uniquement après recette |

La configuration Wrangler est volontairement dédiée au staging et ne contient aucun environnement
imbriqué, car Nitro génère une configuration redirigée que Wrangler n'autorise pas à contenir des
blocs `env`. Le domaine racine et `www` n'en font pas partie. Ils restent dirigés vers l'ancien site
jusqu'à la validation explicite du basculement final.

## Flux de livraison

1. Une branche de travail est publiée sans réécriture de l'historique Lovable.
2. Une pull request exécute formatage, lint, typage, contrat OpenAPI, tests, build et validation
   Cloudflare à blanc.
3. Après fusion sur `main`, GitHub Actions reconstruit la révision exacte validée.
4. Le Worker `hbs-home-staging` est publié sur le seul sous-domaine de staging.
5. Un smoke test vérifie le statut HTTP, la révision `x-hbs-release` et l'interdiction
   d'indexation.

## Secrets GitHub de l'environnement `staging`

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`, limité à l'édition du Worker et de sa route HBS HOME
- `CF_ACCESS_CLIENT_ID` et `CF_ACCESS_CLIENT_SECRET` lorsque Cloudflare Access protège la preview
- `VITE_SUPABASE_PUBLISHABLE_KEY`, clé publique du projet Supabase staging

Variable GitHub non sensible de l'environnement `staging` :

- `VITE_SUPABASE_URL`, URL publique du projet Supabase staging.

Toute variable `VITE_*` est intégrée au bundle public. La clé publishable Supabase est prévue pour
cet usage ; une clé secrète Supabase ou `service_role` ne doit jamais être préfixée par `VITE_`.

Supabase Auth doit autoriser exactement la redirection
`https://preview.hbs-home.com/admin/auth/callback`. Le frontend refuse l'accès aux modules Admin
tant que l'API n'a pas confirmé un profil actif et la permission demandée. Les opérations sensibles
déclenchent ensuite une vérification MFA « step-up » uniquement lorsque l'API exige le niveau `aal2`.

Si l'interface affiche `Supabase Auth n’est pas configuré pour cet environnement.` sur
`/admin/auth/callback`, cela signifie que le build actuel a été fait sans
`VITE_SUPABASE_URL` ou `VITE_SUPABASE_PUBLISHABLE_KEY`.
La correction consiste à relancer le déploiement avec les variables Supabase définies
avant `bun run build`, puis à redéployer le worker.

Exemple PowerShell local :

```powershell
$env:VITE_SUPABASE_URL = "https://<project-ref>.supabase.co"
$env:VITE_SUPABASE_PUBLISHABLE_KEY = "<anon-key>"
cd hbs-home-foundations
bun run deploy:manual
```

Le script injecte automatiquement la révision Git dans `VITE_RELEASE_SHA`. Si le working tree
contient des changements non commités, la release est suffixée par `-dirty` et ne doit servir
qu'au diagnostic local ; une release staging validée doit toujours provenir d'un commit propre.

## Retour arrière

Pour annuler une livraison staging, redéployer depuis GitHub Actions la dernière révision verte ou
utiliser le rollback de version Cloudflare. Le smoke test doit ensuite confirmer le SHA attendu.
Cette opération n'a aucun effet sur l'ancien site, car aucune route racine ou `www` n'est déclarée.

Le basculement production fera l'objet d'un runbook distinct avec sauvegarde DNS, TTL réduit,
validation de l'ancien et du nouveau site, puis procédure de retour aux enregistrements OVH
précédents.
