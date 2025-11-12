# 🔔 Système de Rappels d'Événements

## 📋 Fonctionnalités

Le système de rappels envoie automatiquement des emails de rappel aux personnes inscrites à un événement :

- **Déclenchement** : Les rappels commencent 5 jours avant l'événement
- **Fréquence** : Un email de rappel est envoyé chaque jour
- **Arrêt automatique** : Les rappels s'arrêtent le jour de l'événement
- **Contrôle utilisateur** : Chaque personne peut désactiver les rappels pour un événement spécifique

## 🗄️ Base de Données

### Modèle Registration

Deux nouveaux champs ont été ajoutés :

```prisma
remindersEnabled Boolean @default(true)  // Rappels activés par défaut
lastReminderSent DateTime?               // Date du dernier rappel envoyé
```

## 🔧 Configuration

### Variables d'Environnement

Ajoutez dans votre `.env` :

```env
# Secret pour sécuriser les appels cron
CRON_SECRET=votre-secret-aleatoire-ici

# URL du site (déjà configuré normalement)
NEXT_PUBLIC_SITE_URL=https://reseau-oma.com
```

### Cron Job

Pour activer les rappels automatiques, configurez un cron job qui appelle l'API quotidiennement.

#### Option 1 : Vercel Cron (Recommandé)

Créez `vercel.json` à la racine :

```json
{
  "crons": [
    {
      "path": "/api/cron/event-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Cela exécutera le job tous les jours à 9h UTC.

#### Option 2 : GitHub Actions

Créez `.github/workflows/event-reminders.yml` :

```yaml
name: Event Reminders
on:
  schedule:
    - cron: '0 9 * * *'  # Tous les jours à 9h UTC
  workflow_dispatch:  # Permet l'exécution manuelle

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Send Event Reminders
        run: |
          curl -X GET "${{ secrets.SITE_URL }}/api/cron/event-reminders" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

#### Option 3 : Service externe (cron-job.org, etc.)

Configurez un service externe pour appeler :
```
GET https://votre-site.com/api/cron/event-reminders
Authorization: Bearer YOUR_CRON_SECRET
```

## 📧 Emails de Rappel

### Template

Les emails de rappel incluent :
- Nombre de jours restants avant l'événement
- Détails de l'événement (titre, date, lieu)
- Lien vers la page de l'événement
- Lien pour désactiver les rappels

### Exemple de contenu

```
⏰ Il reste 5 jours avant l'événement !

Bonjour [Nom],

Nous vous rappelons votre inscription à :
[Title de l'événement]

📅 Date : [Date formatée]
📍 Lieu : [Lieu]

[Lien vers l'événement]
[Lien pour désactiver les rappels]
```

## 🔗 API Routes

### GET /api/cron/event-reminders

Envoie les rappels pour les événements à venir.

**Sécurité** : Requiert `Authorization: Bearer CRON_SECRET`

**Réponse** :
```json
{
  "success": true,
  "message": "Rappels envoyés: 15, Erreurs: 0",
  "remindersSent": 15,
  "errors": 0,
  "eventsProcessed": 3
}
```

### PATCH /api/registrations/[id]/reminders

Active ou désactive les rappels pour une inscription.

**Body** :
```json
{
  "enabled": false
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Rappels désactivés pour cet événement",
  "data": {
    "id": "...",
    "email": "...",
    "remindersEnabled": false
  }
}
```

### GET /api/registrations/[id]/reminders

Récupère l'état des rappels pour une inscription.

## 🌐 Pages Publiques

### /events/[slug]/reminders

Page pour gérer les préférences de rappel.

**Paramètres URL** :
- `registration` : ID de l'inscription (requis)
- `action=unsubscribe` : Désactive automatiquement les rappels

**Exemple** :
```
/events/formation-mc/reminders?registration=abc123&action=unsubscribe
```

## 🔄 Flux de Fonctionnement

1. **Inscription** : L'utilisateur s'inscrit à un événement
   - `remindersEnabled` est défini à `true` par défaut
   - Un email de confirmation est envoyé avec un lien pour gérer les rappels

2. **5 jours avant** : Le cron job détecte l'événement
   - Trouve toutes les inscriptions avec `remindersEnabled = true`
   - Vérifie que `lastReminderSent` n'est pas aujourd'hui
   - Envoie un email de rappel
   - Met à jour `lastReminderSent`

3. **Jours suivants** : Répète le processus chaque jour
   - Jusqu'à ce que l'événement arrive
   - Ou que l'utilisateur désactive les rappels

4. **Désactivation** : L'utilisateur peut désactiver à tout moment
   - Via le lien dans l'email
   - Via la page de gestion des rappels
   - `remindersEnabled` est mis à `false`
   - `lastReminderSent` est réinitialisé

## 🛠️ Maintenance

### Vérifier les rappels envoyés

```sql
SELECT 
  r.email,
  e.title,
  r.lastReminderSent,
  r.remindersEnabled
FROM "Registration" r
JOIN "Event" e ON r."eventId" = e.id
WHERE r."remindersEnabled" = true
  AND e."startsAt" > NOW()
ORDER BY e."startsAt" ASC;
```

### Statistiques

L'API cron retourne des statistiques :
- Nombre de rappels envoyés
- Nombre d'erreurs
- Nombre d'événements traités

## ⚠️ Notes Importantes

1. **Performance** : Le cron job traite tous les événements à venir. Pour de gros volumes, envisagez la pagination.

2. **Fuseaux horaires** : Les calculs de dates utilisent le fuseau horaire du serveur. Assurez-vous qu'il est correctement configuré.

3. **Rate Limiting** : Les emails sont envoyés via Nodemailer. Respectez les limites de votre fournisseur SMTP.

4. **Erreurs** : Les erreurs d'envoi sont loggées mais n'empêchent pas le traitement des autres rappels.

5. **Sécurité** : Utilisez toujours un `CRON_SECRET` fort en production.

