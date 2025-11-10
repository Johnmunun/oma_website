# 📝 Commandes de Migration - Guide Rapide

## ⚡ Installation Rapide (Copier-Coller)

### 1. Installer les dépendances

```bash
# Windows (PowerShell) ou Unix/Mac
pnpm install next-auth@^5.0.0-beta.25 @auth/prisma-adapter@^2.7.0 imagekit@^5.0.0 bcryptjs@^2.4.3 @types/bcryptjs@^2.4.6 tsx@^4.19.2
```

### 2. Créer le fichier .env

**Windows:**
```powershell
Copy-Item .env.example .env
```

**Unix/Mac:**
```bash
cp .env.example .env
```

Puis éditer `.env` et remplir :
- `DATABASE_URL` : Connection string Neon
- `NEXTAUTH_SECRET` : Générer avec `openssl rand -base64 32`
- `NEXTAUTH_URL` : `http://localhost:3000` (dev) ou votre URL de prod
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` : Depuis ImageKit dashboard

### 3. Générer le client Prisma

```bash
npx prisma generate
```

### 4. Créer et appliquer les migrations

```bash
npx prisma migrate dev --name init_neon_migration
```

### 5. Seed la base de données

```bash
pnpm run db:seed
```

Ou directement :
```bash
npx tsx prisma/seed.ts
```

### 6. Démarrer le serveur

```bash
pnpm dev
```

### 7. Tester la connexion

1. Aller sur `http://localhost:3000/login`
2. Se connecter avec :
   - Email: `admin@oma.com`
   - Password: `Admin123!`
3. ✅ Doit rediriger vers `/admin`

---

## 🔧 Commandes Utiles

### Prisma

```bash
# Générer le client Prisma
npx prisma generate

# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio

# Réinitialiser la base (⚠️ supprime toutes les données)
npx prisma migrate reset
```

### Seed

```bash
# Via npm script
pnpm run db:seed

# Directement
npx tsx prisma/seed.ts
```

### Développement

```bash
# Démarrer le serveur de développement
pnpm dev

# Build pour production
pnpm build

# Démarrer en production
pnpm start
```

---

## 🧪 Tests de Vérification

### Test 1 : Connexion à la base de données

```bash
npx prisma db pull
```

Si succès → ✅ Connexion OK

### Test 2 : Authentification

1. Démarrer : `pnpm dev`
2. Aller sur `/login`
3. Se connecter avec `admin@oma.com` / `Admin123!`
4. ✅ Doit rediriger vers `/admin`

### Test 3 : API Routes

```bash
# Test route publique (sans auth)
curl http://localhost:3000/api/site-settings

# Test route protégée (nécessite session)
# Ouvrir le navigateur, se connecter, puis :
curl http://localhost:3000/api/admin/settings \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### Test 4 : Upload ImageKit

1. Aller sur `/admin/settings`
2. Essayer d'uploader une image
3. ✅ L'image doit être uploadée et l'URL retournée

---

## 🚀 Déploiement Vercel

### Variables d'environnement à ajouter

Dans Vercel Dashboard > Settings > Environment Variables :

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

### Build Command (optionnel)

Vercel détecte automatiquement Next.js, mais vous pouvez ajouter :

```json
{
  "buildCommand": "prisma generate && next build"
}
```

### Post-deploy (optionnel)

Dans Vercel, ajouter un script post-deploy :

```bash
npx prisma migrate deploy
```

---

## ⚠️ Problèmes Courants

### Erreur : "Prisma Client not generated"

```bash
npx prisma generate
```

### Erreur : "DATABASE_URL is not set"

Vérifier que `.env` existe et contient `DATABASE_URL`

### Erreur : "NEXTAUTH_SECRET is not set"

Générer un secret :
```bash
# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Unix/Mac
openssl rand -base64 32
```

### Erreur : "Cannot find module '@/lib/generated/prisma'"

```bash
npx prisma generate
```

### Erreur de connexion à Neon

- Vérifier la connection string
- Vérifier que le projet Neon est actif
- Vérifier les paramètres de firewall

---

## 📋 Checklist Finale

- [ ] ✅ Toutes les dépendances installées (`pnpm install`)
- [ ] ✅ Fichier `.env` créé et configuré
- [ ] ✅ `npx prisma generate` exécuté
- [ ] ✅ `npx prisma migrate dev` exécuté
- [ ] ✅ `pnpm run db:seed` exécuté
- [ ] ✅ Connexion à `/login` fonctionne
- [ ] ✅ Authentification avec admin fonctionne
- [ ] ✅ Redirection vers `/admin` après login
- [ ] ✅ Page `/admin/settings` charge les données
- [ ] ✅ Sauvegarde des settings fonctionne
- [ ] ✅ Upload ImageKit fonctionne
- [ ] ✅ Footer et ContactSection affichent les contacts
- [ ] ✅ Variables d'environnement ajoutées dans Vercel (si déployé)

---

**✅ Une fois tous les tests passés, la migration est terminée !**


