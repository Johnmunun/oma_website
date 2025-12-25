# 🔒 Migration - Rate Limiting et Validation de Token

## 📋 Résumé des changements

Cette migration améliore la sécurité en :
1. ✅ Implémentant un rate limiting basé sur la base de données (sans Redis/KV)
2. ✅ Améliorant la validation de token avec HMAC
3. ✅ Supprimant les secrets en dur dans le code
4. ✅ Ajoutant le rate limiting sur toutes les routes publiques

## 🚀 Étapes de migration

### 1. Ajouter la variable d'environnement

Ajoutez dans votre fichier `.env` (et dans Vercel) :

```env
# Secret pour la génération de tokens d'inscription aux événements
# Doit être une chaîne aléatoire sécurisée d'au moins 32 caractères
EVENT_REGISTRATION_SECRET="votre-secret-super-securise-minimum-32-caracteres"
```

**⚠️ Important** : 
- Ne pas utiliser `change-me-in-production`
- Générer un secret aléatoire avec : `openssl rand -hex 32`
- Ou utiliser un générateur en ligne : https://randomkeygen.com/

### 2. Appliquer la migration Prisma

```bash
# Générer le client Prisma avec le nouveau modèle
pnpm prisma generate

# Créer et appliquer la migration
pnpm prisma migrate dev --name add_rate_limit_table
```

### 3. Vérifier que tout fonctionne

```bash
# Lancer le serveur de développement
pnpm dev

# Tester une inscription à un événement
# Le rate limiting devrait fonctionner automatiquement
```

## 📝 Détails techniques

### Nouveau modèle Prisma : `RateLimit`

Le modèle `RateLimit` stocke les compteurs de rate limiting dans la base de données :

```prisma
model RateLimit {
  id        String   @id @default(uuid()) @db.Uuid
  key       String   // Clé unique (ex: "ip:192.168.1.1")
  count     Int      @default(1)
  resetAt   DateTime // Date de réinitialisation
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([key])
  @@index([key, resetAt])
  @@index([resetAt])
}
```

### Nouveaux utilitaires

#### `lib/rate-limit.ts`
- `checkRateLimit()` : Vérifie et incrémente le compteur
- `getClientIP()` : Extrait l'IP du client depuis les headers
- `RATE_LIMIT_CONFIGS` : Configurations par défaut

#### `lib/token-utils.ts`
- `generateEventTokenWithTimestamp()` : Génère un token HMAC avec timestamp
- `verifyEventTokenWithTimestamp()` : Valide un token avec vérification d'expiration

### Routes protégées

Les routes suivantes ont maintenant le rate limiting :

1. **`/api/events/[id]/register`** (POST)
   - 5 requêtes par IP toutes les 15 minutes

2. **`/api/contact`** (POST)
   - 3 requêtes par IP toutes les 15 minutes

3. **`/api/newsletter`** (POST)
   - 2 requêtes par IP toutes les heures
   - 2 requêtes par email toutes les heures

## 🔧 Configuration

Vous pouvez ajuster les limites dans `lib/rate-limit.ts` :

```typescript
export const RATE_LIMIT_CONFIGS = {
  eventRegistration: {
    maxRequests: 5,        // Nombre de requêtes
    windowMs: 15 * 60 * 1000, // Fenêtre (15 minutes)
    keyPrefix: 'event-register',
  },
  // ...
}
```

## 🧹 Nettoyage automatique

Le système nettoie automatiquement les anciennes entrées de rate limiting lors de chaque vérification. Les entrées expirées sont supprimées automatiquement.

## ⚠️ Notes importantes

1. **Performance** : Le rate limiting utilise la base de données, ce qui est légèrement plus lent que Redis mais fonctionne sur toutes les instances Vercel sans configuration supplémentaire.

2. **Nettoyage** : Les anciennes entrées sont nettoyées automatiquement, mais vous pouvez aussi créer un cron job pour nettoyer périodiquement :

```sql
DELETE FROM "RateLimit" WHERE "resetAt" < NOW() - INTERVAL '1 day';
```

3. **Monitoring** : Surveillez la taille de la table `RateLimit` en production. Elle devrait rester petite grâce au nettoyage automatique.

## 🐛 Dépannage

### Erreur : "EVENT_REGISTRATION_SECRET n'est pas défini"

**Solution** : Ajoutez la variable d'environnement dans `.env` et redéployez sur Vercel.

### Erreur : "EVENT_REGISTRATION_SECRET doit être un secret sécurisé"

**Solution** : Le secret doit faire au moins 32 caractères et ne pas être `change-me-in-production`.

### Le rate limiting ne fonctionne pas

**Vérifications** :
1. La migration Prisma a été appliquée
2. Le modèle `RateLimit` existe dans la base de données
3. Les logs ne montrent pas d'erreurs de connexion DB

## ✅ Checklist de migration

- [ ] Variable `EVENT_REGISTRATION_SECRET` ajoutée dans `.env`
- [ ] Variable `EVENT_REGISTRATION_SECRET` ajoutée dans Vercel
- [ ] Migration Prisma appliquée (`pnpm prisma migrate dev`)
- [ ] Client Prisma régénéré (`pnpm prisma generate`)
- [ ] Tests effectués en local
- [ ] Déploiement sur Vercel réussi
- [ ] Tests effectués en production

## 📚 Références

- [Documentation Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)


