# 🔐 Guide de Résolution des Problèmes de Connexion

## ✅ Modifications apportées

1. **Logo dynamique** : Le logo depuis la base de données s'affiche maintenant sur la page de connexion
2. **Slogan ajouté** : "We are the best" affiché sous le titre
3. **Meilleure gestion des erreurs** : Messages d'erreur plus détaillés pour diagnostiquer les problèmes

## 🔍 Diagnostic des problèmes de connexion

### 1. Vérifier qu'un utilisateur admin existe dans la base de données

Exécutez le script de seed pour créer un utilisateur admin :

```bash
pnpm prisma:seed
```

Ou manuellement avec Prisma Studio :

```bash
pnpm prisma:studio
```

### 2. Identifiants par défaut après le seed

Après avoir exécuté `pnpm prisma:seed`, les identifiants par défaut sont :

- **Email** : `admin@oma.com` (ou la valeur de `ADMIN_EMAIL` dans `.env`)
- **Mot de passe** : `Admin123!` (ou la valeur de `ADMIN_PASSWORD` dans `.env`)

### 3. Créer un utilisateur admin manuellement

Si vous préférez créer un utilisateur manuellement, utilisez Prisma Studio ou exécutez cette commande :

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@oma.com'
  const password = await bcrypt.hash('Admin123!', 10)
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { password },
    create: {
      email,
      password,
      name: 'Administrateur OMA',
      role: 'ADMIN',
      isActive: true,
      emailVerified: new Date(),
    },
  })
  
  console.log('✅ Utilisateur créé:', user.email)
}

main().catch(console.error).finally(() => prisma.\$disconnect())
"
```

### 4. Vérifier les variables d'environnement

Assurez-vous que ces variables sont définies dans votre fichier `.env` :

```env
# NextAuth (OBLIGATOIRE)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-aleatoire-ici

# Base de données
DATABASE_URL="postgresql://..."
```

**Générer un NEXTAUTH_SECRET** :

```bash
# Sur Linux/Mac
openssl rand -base64 32

# Sur Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 5. Vérifier la configuration NextAuth

Le fichier `app/api/auth/[...nextauth]/route.ts` doit :
- ✅ Avoir `NEXTAUTH_SECRET` défini
- ✅ Avoir `NEXTAUTH_URL` défini (ou utiliser localhost:3000 en dev)
- ✅ Utiliser le bon adapter Prisma

### 6. Vérifier que la base de données est accessible

Testez la connexion à la base de données :

```bash
npx prisma db pull
```

Si cette commande échoue, vérifiez votre `DATABASE_URL`.

### 7. Vérifier les logs du serveur

Lors de la tentative de connexion, regardez les logs du serveur Next.js. Vous devriez voir :

- `[NextAuth] Erreur authentification:` si l'authentification échoue
- Les erreurs de connexion à la base de données
- Les erreurs de validation

### 8. Erreurs courantes et solutions

#### Erreur : "Identifiants invalides"
- ✅ Vérifiez que l'email existe dans la base de données
- ✅ Vérifiez que le mot de passe est correct
- ✅ Vérifiez que le mot de passe est bien hashé avec bcrypt

#### Erreur : "Compte désactivé"
- ✅ Vérifiez que `isActive: true` dans la base de données
- ✅ Utilisez Prisma Studio pour activer le compte

#### Erreur : "Erreur de communication avec le serveur"
- ✅ Vérifiez que le serveur Next.js est bien démarré
- ✅ Vérifiez que l'API `/api/auth/[...nextauth]` est accessible
- ✅ Vérifiez les logs du serveur pour plus de détails

#### Erreur : "NEXTAUTH_SECRET n'est pas défini"
- ✅ Ajoutez `NEXTAUTH_SECRET` dans votre fichier `.env`
- ✅ Redémarrez le serveur après avoir ajouté la variable

## 🧪 Tester la connexion

1. **Démarrer le serveur** :
```bash
pnpm dev
```

2. **Aller sur** : http://localhost:3000/login

3. **Utiliser les identifiants** :
   - Email : `admin@oma.com`
   - Mot de passe : `Admin123!`

4. **Vérifier les logs** :
   - Ouvrez la console du navigateur (F12)
   - Regardez les logs du serveur dans le terminal

## 📝 Créer un nouvel utilisateur via l'interface

Si vous avez déjà accès au panneau admin, vous pouvez créer de nouveaux utilisateurs via :
- `/admin/users` (réservé aux ADMIN)

## 🔄 Réinitialiser le mot de passe d'un utilisateur

Si vous avez oublié le mot de passe, vous pouvez le réinitialiser via Prisma Studio :

1. Ouvrir Prisma Studio : `pnpm prisma:studio`
2. Aller dans la table `User`
3. Trouver l'utilisateur
4. Modifier le champ `password` avec un nouveau hash bcrypt

Ou utiliser ce script :

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@oma.com'
  const newPassword = 'NouveauMotDePasse123!'
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  })
  
  console.log('✅ Mot de passe mis à jour pour:', user.email)
  console.log('Nouveau mot de passe:', newPassword)
}

main().catch(console.error).finally(() => prisma.\$disconnect())
"
```

## ✅ Checklist de vérification

- [ ] Base de données accessible (`pnpm prisma db pull` fonctionne)
- [ ] Utilisateur admin existe dans la base de données
- [ ] `NEXTAUTH_SECRET` est défini dans `.env`
- [ ] `NEXTAUTH_URL` est défini dans `.env` (ou utilise localhost:3000 en dev)
- [ ] `DATABASE_URL` est correct dans `.env`
- [ ] Le serveur Next.js est démarré
- [ ] Les logs du serveur ne montrent pas d'erreurs critiques
- [ ] Le navigateur ne bloque pas les cookies (vérifiez les paramètres)

## 🆘 Si le problème persiste

1. **Vérifiez les logs du serveur** pour des erreurs détaillées
2. **Vérifiez la console du navigateur** (F12) pour des erreurs JavaScript
3. **Testez avec un autre navigateur** pour éliminer les problèmes de cache/cookies
4. **Vérifiez que Prisma Client est à jour** : `pnpm prisma:generate`

