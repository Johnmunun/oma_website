# 🚀 Guide de Migration : Supabase → Neon + Prisma + NextAuth + ImageKit

## 📋 Table des matières

1. [Installation des dépendances](#1-installation-des-dépendances)
2. [Configuration des variables d'environnement](#2-configuration-des-variables-denvironnement)
3. [Configuration Prisma + Neon](#3-configuration-prisma--neon)
4. [Migrations de la base de données](#4-migrations-de-la-base-de-données)
5. [Seed de la base de données](#5-seed-de-la-base-de-données)
6. [Configuration NextAuth](#6-configuration-nextauth)
7. [Intégration ImageKit](#7-intégration-imagekit)
8. [Tests de vérification](#8-tests-de-vérification)
9. [Déploiement sur Vercel](#9-déploiement-sur-vercel)
10. [Procédure de rollback](#10-procédure-de-rollback)

---

## 1. Installation des dépendances

### Commandes à exécuter

```bash
# Windows (PowerShell)
pnpm install next-auth@^5.0.0-beta.25 @auth/prisma-adapter@^2.7.0 imagekit@^5.0.0 bcryptjs@^2.4.3 @types/bcryptjs@^2.4.6 tsx@^4.19.2

# Unix/Mac
pnpm install next-auth@^5.0.0-beta.25 @auth/prisma-adapter@^2.7.0 imagekit@^5.0.0 bcryptjs@^2.4.3 @types/bcryptjs@^2.4.6 tsx@^4.19.2
```

### Dépendances à retirer (optionnel, après migration complète)

```bash
# À retirer après migration complète
pnpm remove @supabase/ssr @supabase/supabase-js
```

---

## 2. Configuration des variables d'environnement

### Créer le fichier `.env`

Copiez `.env.example` vers `.env` et remplissez les valeurs :

```bash
# Windows
copy .env.example .env

# Unix/Mac
cp .env.example .env
```

### Variables requises

Voir le fichier `.env.example` créé pour la liste complète. Principales variables :

- `DATABASE_URL` : Connection string Neon PostgreSQL
- `NEXTAUTH_SECRET` : Secret pour NextAuth (générer avec `openssl rand -base64 32`)
- `NEXTAUTH_URL` : URL de votre application
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` : Clés ImageKit

---

## 3. Configuration Prisma + Neon

### 3.1 Créer un projet Neon

1. Aller sur https://console.neon.tech
2. Créer un nouveau projet
3. Copier la connection string (format: `postgresql://user:password@host/dbname?sslmode=require`)
4. Ajouter dans `.env` comme `DATABASE_URL`

### 3.2 Vérifier le schema Prisma

Le fichier `prisma/schema.prisma` est déjà configuré avec :
- Modèles NextAuth (Account, Session, User, VerificationToken)
- Modèle Contact
- Modèle Setting
- Tous les autres modèles existants

### 3.3 Générer le client Prisma

```bash
npx prisma generate
```

---

## 4. Migrations de la base de données

### 4.1 Créer la migration initiale

```bash
npx prisma migrate dev --name init_neon_migration
```

Cette commande va :
- Créer le fichier de migration dans `prisma/migrations/`
- Appliquer la migration à votre base Neon
- Générer automatiquement le client Prisma

### 4.2 Vérifier la migration

```bash
# Ouvrir Prisma Studio pour voir les données
npx prisma studio
```

### 4.3 Pour la production

```bash
# Appliquer les migrations en production (sans prompt interactif)
npx prisma migrate deploy
```

**⚠️ Important** : En production, utilisez `migrate deploy` et non `migrate dev`

---

## 5. Seed de la base de données

### 5.1 Exécuter le seed

```bash
# Méthode 1 : Via script npm
pnpm run db:seed

# Méthode 2 : Directement
npx tsx prisma/seed.ts
```

### 5.2 Ce que le seed crée

- ✅ Un utilisateur ADMIN : `admin@oma.com` / `Admin123!`
- ✅ Un utilisateur EDITOR : `editor@oma.com` / `Editor123!`
- ✅ Les paramètres du site par défaut
- ✅ Un contact d'exemple avec réseaux sociaux

**⚠️ Changez ces mots de passe en production !**

---

## 6. Configuration NextAuth

### 6.1 Fichiers créés

- ✅ `app/api/auth/[...nextauth]/route.ts` : Configuration NextAuth
- ✅ `types/next-auth.d.ts` : Extensions de types TypeScript
- ✅ `middleware.ts` : Protection des routes admin

### 6.2 Vérifier la configuration

1. Démarrer le serveur : `pnpm dev`
2. Aller sur `/login`
3. Se connecter avec `admin@oma.com` / `Admin123!`
4. Vérifier la redirection vers `/admin`

### 6.3 Provider Google (optionnel)

Si vous voulez activer Google OAuth :

1. Créer un projet sur https://console.cloud.google.com
2. Configurer OAuth 2.0
3. Ajouter les variables `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans `.env`
4. Le provider sera automatiquement activé

---

## 7. Intégration ImageKit

### 7.1 Créer un compte ImageKit

1. Aller sur https://imagekit.io
2. Créer un compte gratuit
3. Récupérer les clés depuis le dashboard
4. Ajouter dans `.env` :
   - `IMAGEKIT_PUBLIC_KEY`
   - `IMAGEKIT_PRIVATE_KEY`
   - `IMAGEKIT_URL_ENDPOINT`

### 7.2 Fichiers créés

- ✅ `lib/imagekit.ts` : Configuration et helpers ImageKit
- ✅ `app/api/uploads/route.ts` : Endpoint d'upload protégé

### 7.3 Utilisation dans un composant React

```tsx
// Exemple d'upload depuis un formulaire
const handleFileUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', '/uploads')

  const res = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  if (data.success) {
    console.log('Image uploadée:', data.data.url)
  }
}

// Utiliser l'image avec transformations
import { getImageKitUrl } from '@/lib/imagekit'

const imageUrl = getImageKitUrl('https://ik.imagekit.io/your-id/image.jpg', {
  width: 800,
  height: 600,
  quality: 80,
  format: 'webp',
})
```

---

## 8. Tests de vérification

### 8.1 Test de connexion à la base de données

```bash
# Vérifier la connexion
npx prisma db pull

# Si succès, la connexion fonctionne
```

### 8.2 Test d'authentification

1. Démarrer : `pnpm dev`
2. Aller sur `/login`
3. Se connecter avec `admin@oma.com` / `Admin123!`
4. ✅ Doit rediriger vers `/admin`

### 8.3 Test d'upload ImageKit

1. Aller sur `/admin/settings`
2. Essayer d'uploader une image
3. ✅ L'image doit être uploadée et l'URL retournée

### 8.4 Test des API routes

```bash
# Test GET /api/admin/settings (nécessite auth)
curl -X GET http://localhost:3000/api/admin/settings \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Test GET /api/site-settings (publique)
curl -X GET http://localhost:3000/api/site-settings
```

---

## 9. Déploiement sur Vercel

### 9.1 Variables d'environnement à ajouter dans Vercel

Dans Vercel Dashboard > Settings > Environment Variables, ajouter :

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...
GOOGLE_CLIENT_ID=... (optionnel)
GOOGLE_CLIENT_SECRET=... (optionnel)
```

### 9.2 Build Command

Vercel détecte automatiquement Next.js, mais vous pouvez ajouter :

```json
{
  "buildCommand": "prisma generate && next build"
}
```

### 9.3 Post-deploy Script (optionnel)

Dans Vercel, ajouter un script post-deploy pour les migrations :

```bash
npx prisma migrate deploy
```

---

## 10. Procédure de rollback

### 10.1 En développement

```bash
# Réinitialiser complètement la base (⚠️ supprime toutes les données)
npx prisma migrate reset

# Puis re-seed
pnpm run db:seed
```

### 10.2 En production

1. **Ne jamais utiliser `migrate reset` en production !**

2. Si une migration casse :
   ```bash
   # Revenir à la migration précédente
   npx prisma migrate resolve --rolled-back <migration_name>
   ```

3. Pour restaurer depuis un backup :
   - Neon propose des backups automatiques
   - Restaurer depuis le dashboard Neon
   - Puis réappliquer les migrations valides

---

## 📝 Checklist de vérification finale

- [ ] ✅ Toutes les dépendances installées
- [ ] ✅ Fichier `.env` configuré avec toutes les variables
- [ ] ✅ `npx prisma generate` exécuté avec succès
- [ ] ✅ `npx prisma migrate dev` exécuté avec succès
- [ ] ✅ `pnpm run db:seed` exécuté avec succès
- [ ] ✅ Connexion à `/login` fonctionne
- [ ] ✅ Authentification avec admin fonctionne
- [ ] ✅ Redirection vers `/admin` après login
- [ ] ✅ Page `/admin/settings` charge les données
- [ ] ✅ Sauvegarde des settings fonctionne
- [ ] ✅ Upload ImageKit fonctionne
- [ ] ✅ Footer et ContactSection affichent les contacts dynamiquement
- [ ] ✅ Variables d'environnement ajoutées dans Vercel (si déployé)

---

## 🔒 Sécurité - Bonnes pratiques

### Variables sensibles

- ❌ **Ne jamais** commiter `.env` dans Git
- ✅ Utiliser `.env.example` comme template
- ✅ Stocker les secrets dans Vercel Environment Variables
- ✅ Utiliser des secrets différents pour dev/prod

### Protection des routes

- ✅ Middleware vérifie l'authentification
- ✅ API routes vérifient le rôle utilisateur
- ✅ Endpoints d'upload protégés (ADMIN/EDITOR uniquement)

### ImageKit

- ✅ `IMAGEKIT_PRIVATE_KEY` jamais exposé côté client
- ✅ Upload uniquement depuis le serveur
- ✅ Validation des types de fichiers (images uniquement)
- ✅ Limite de taille (10MB max)

---

## 🆘 Dépannage

### Erreur : "Prisma Client not generated"

```bash
npx prisma generate
```

### Erreur : "DATABASE_URL is not set"

Vérifier que `.env` existe et contient `DATABASE_URL`

### Erreur : "NEXTAUTH_SECRET is not set"

Générer un secret : `openssl rand -base64 32`

### Erreur : "Cannot find module '@/lib/generated/prisma'"

```bash
npx prisma generate
```

### Erreur de connexion à Neon

- Vérifier que la connection string est correcte
- Vérifier que le projet Neon est actif
- Vérifier les paramètres de firewall (si applicable)

---

## 📚 Ressources

- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [ImageKit Docs](https://docs.imagekit.io)
- [Neon Docs](https://neon.tech/docs)

---

**✅ Migration terminée ! Votre application utilise maintenant Neon + Prisma + NextAuth + ImageKit.**


