# HBS HOME — Contrat d'API (préparation backend)

Les prix sont exprimés en millimes (1 DT = 1000). Le frontend consomme les repositories
(`ProductRepository`, `CartRepository`, `OrderRepository`) ; le passage à l'API ne doit modifier
aucun composant.

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
