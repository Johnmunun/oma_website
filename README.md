# Réseau OMA - Site Web Professionnel

Site web professionnel pour le Réseau OMA, un organisme axé sur l'art oratoire, la communication, le management et la formation, la mise en valeur de talents, et la publication d'événements, formations et contenus multimédias.

## 🚀 Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (Auth + Base de données)
- **Prisma ORM**
- **TailwindCSS + DaisyUI**
- **NextAuth.js v5** (Authentification)
- **ImageKit** (Gestion d'images)
- **React Hook Form + Zod** (Validation des formulaires)

## ✨ Fonctionnalités

### Front Office
- Landing page dynamique avec hero section
- Section d'événements avec bannière défilante
- Gestion des formations
- Page de contact avec formulaire
- Actualités et blog
- Design responsive et moderne

### Panneau d'Administration
- Authentification sécurisée (NextAuth.js)
- Gestion des événements (CRUD complet)
- Gestion des formations
- Personnalisation du thème (couleurs dynamiques)
- Upload de logo via ImageKit
- Gestion du contenu du site
- Partage social des événements (WhatsApp, Facebook, Twitter, LinkedIn, Instagram)

## 📋 Prérequis

- Node.js 18+ 
- pnpm (ou npm/yarn)
- Base de données PostgreSQL (Supabase ou Neon)
- Compte ImageKit (pour l'upload d'images)

## 🛠️ Installation

1. **Cloner le dépôt**
```bash
git clone <votre-repo-url>
cd code
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-nextauth"

# ImageKit
IMAGEKIT_PUBLIC_KEY="votre-public-key"
IMAGEKIT_PRIVATE_KEY="votre-private-key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/votre-id"

# Email (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-mot-de-passe"
```

4. **Initialiser la base de données**
```bash
# Générer le client Prisma
pnpm prisma:generate

# Appliquer les migrations
pnpm prisma:migrate

# Seed la base de données (optionnel)
pnpm prisma:seed
```

5. **Lancer le serveur de développement**
```bash
pnpm dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
code/
├── app/                    # Pages Next.js (App Router)
│   ├── admin/             # Panneau d'administration
│   ├── api/               # Routes API
│   └── page.tsx           # Landing page
├── components/            # Composants React réutilisables
│   ├── admin/            # Composants admin
│   └── theming/          # Système de thème dynamique
├── lib/                   # Utilitaires et configurations
├── prisma/                # Schéma Prisma et migrations
├── public/                # Fichiers statiques
└── types/                 # Types TypeScript
```

## 🔐 Sécurité

- Routes admin protégées par middleware Next.js
- Authentification via NextAuth.js
- Validation des données avec Zod
- Variables d'environnement pour les secrets
- Protection CSRF intégrée

## 🎨 Personnalisation

Le site permet de personnaliser :
- **Couleurs du thème** : Via le panneau admin > Settings > Theme
- **Logo** : Via le panneau admin > Content > Logo
- **Contenu** : Tous les contenus sont gérés depuis le panneau admin

## 📝 Scripts Disponibles

```bash
# Développement
pnpm dev              # Lancer le serveur de dev
pnpm build            # Build de production
pnpm start            # Lancer le serveur de production

# Prisma
pnpm prisma:generate  # Générer le client Prisma
pnpm prisma:migrate   # Créer/appliquer une migration
pnpm prisma:studio    # Ouvrir Prisma Studio
pnpm prisma:seed      # Seed la base de données

# Linting
pnpm lint             # Vérifier le code
```

## 🚀 Déploiement

Le projet est prêt pour le déploiement sur :
- **Vercel** (recommandé pour Next.js)
- **Netlify**
- **Railway**
- Tout autre hébergeur supportant Next.js

### Variables d'environnement à configurer en production

Assurez-vous de configurer toutes les variables d'environnement mentionnées dans la section Installation.

## 📄 Licence

Ce projet est privé et propriétaire du Réseau OMA.

## 👥 Contribution

Ce projet est un projet privé. Pour toute question ou suggestion, contactez l'équipe de développement.

---

Développé avec ❤️ pour le Réseau OMA

