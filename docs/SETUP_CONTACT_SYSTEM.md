# 📧 Système de Contact - Guide d'installation

## ✅ Ce qui a été créé

### 1. Modèle Prisma
- ✅ `ContactMessage` dans `prisma/schema.prisma`
- Champs : id, name, email, subject, message, isRead, readAt, createdAt

### 2. API Routes
- ✅ `app/api/contact/route.ts` - Reçoit les messages et envoie l'email
- ✅ `app/api/admin/messages/route.ts` - GET/PATCH pour gérer les messages
- ✅ `app/api/admin/messages/count/route.ts` - Compteur de messages non lus

### 3. Configuration Nodemailer
- ✅ `lib/nodemailer.ts` - Configuration et fonctions d'envoi d'email

### 4. Formulaire de contact
- ✅ `components/contact-section.tsx` - Mis à jour pour envoyer les messages

### 5. Page Admin Messages
- ✅ `app/admin/messages/page.tsx` - Interface pour voir et gérer les messages

### 6. Navigation Admin
- ✅ `app/admin/layout.tsx` - Ajout de l'item "Messages" avec compteur en temps réel

## 📋 Étapes d'installation

### 1. Installer les dépendances

```bash
pnpm install nodemailer@^6.9.16 @types/nodemailer@^6.4.15
```

### 2. Créer la migration Prisma

```bash
npx prisma migrate dev --name add_contact_messages
```

### 3. Configurer les variables d'environnement

Ajouter dans `.env` :

```env
# Nodemailer / Gmail
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-app-password-gmail"
CONTACT_EMAIL="contact@oma.com"
```

**Important** : Pour Gmail, vous devez créer un App Password (voir `NODEMAILER_SETUP.md`)

### 4. Générer le client Prisma

```bash
npx prisma generate
```

## 🎯 Fonctionnalités

### Côté client (visiteur)
- Formulaire de contact fonctionnel
- Validation des champs
- Messages de succès/erreur
- Envoi automatique d'email

### Côté admin
- Page `/admin/messages` pour voir tous les messages
- Filtres : Tous / Non lus / Lus
- Compteur de messages non lus en temps réel dans le sidebar
- Marquer comme lu/non lu
- Interface pour voir les détails d'un message
- Bouton pour répondre (ouvre le client email)

## 🔄 Mise à jour en temps réel

- Le compteur dans le sidebar se met à jour automatiquement toutes les 30 secondes
- Les événements `message-updated` déclenchent une mise à jour immédiate
- Pas besoin de rafraîchir la page

## 📝 Prochaines étapes

1. Installer nodemailer : `pnpm install nodemailer @types/nodemailer`
2. Créer la migration : `npx prisma migrate dev --name add_contact_messages`
3. Configurer Gmail avec App Password
4. Tester l'envoi d'un message depuis le formulaire de contact




