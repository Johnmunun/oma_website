# 🔧 Dépannage - Erreur de connexion Neon

## Erreur : `Can't reach database server`

### Solutions rapides :

#### 1. Vérifier que la base Neon est active

Neon suspend automatiquement les bases inactives. Pour les réactiver :

1. Aller sur https://console.neon.tech
2. Sélectionner votre projet
3. La base devrait se réactiver automatiquement, ou cliquer sur "Resume" si disponible

#### 2. Vérifier le format de la connection string

Votre `DATABASE_URL` doit ressembler à :
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**Important** : Pour les migrations, Neon recommande parfois d'utiliser une connection directe au lieu du pooler.

#### 3. Configurer DIRECT_URL (optionnel)

Si le pooler ne fonctionne pas pour les migrations, ajoutez dans `.env` :

```env
DATABASE_URL="postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

**Note** : `DIRECT_URL` est la même URL mais **sans** `-pooler` dans le hostname.

#### 4. Tester la connexion

```bash
# Tester avec psql (si installé)
psql "postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Ou tester avec Prisma
npx prisma db pull
```

#### 5. Vérifier le firewall

Si vous êtes derrière un firewall d'entreprise, vérifiez que le port 5432 n'est pas bloqué.

---

## Format des connection strings Neon

### Connection avec pooler (recommandé pour l'application)
```
postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
```

### Connection directe (pour migrations si nécessaire)
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**Différence** : Le pooler a `-pooler` dans le hostname.

---

## Commandes de test

```bash
# 1. Générer le client Prisma
npx prisma generate

# 2. Tester la connexion
npx prisma db pull

# 3. Si ça fonctionne, créer la migration
npx prisma migrate dev --name init_neon_migration
```

---

## Si le problème persiste

1. Vérifier que la base Neon est active dans le dashboard
2. Vérifier que la connection string est correcte (copier depuis le dashboard Neon)
3. Essayer avec `DIRECT_URL` si le pooler ne fonctionne pas
4. Vérifier les logs dans le dashboard Neon pour voir les tentatives de connexion



