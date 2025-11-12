# 📝 Système d'Inscription aux Événements

## 🗄️ Table de Base de Données

Le système utilise la table **`Registration`** (mappée à `"Registration"` dans PostgreSQL) pour stocker toutes les inscriptions aux événements.

## 📊 Structure de la Table

```prisma
model Registration {
  id              String             @id @default(uuid()) @db.Uuid
  eventId         String             @db.Uuid              // ID de l'événement
  userId          String?            @db.Uuid              // ID utilisateur (optionnel, pour les utilisateurs connectés)
  fullName        String                                      // Nom complet
  email           String                                      // Email (unique par événement)
  phone           String?                                     // Téléphone (optionnel)
  notes           String?                                     // Notes/Message (optionnel)
  status          RegistrationStatus @default(PENDING)      // Statut de l'inscription
  stripeSessionId String?                                     // ID session Stripe (pour paiements)
  amountInCents   Int?                                        // Montant en centimes (pour paiements)
  currency        String?                                     // Devise (pour paiements)
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  event           Event              @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId, email])  // Index pour éviter les doublons
  @@index([userId])
  @@index([status])
  @@map("Registration")
}
```

## 📋 Statuts d'Inscription

```prisma
enum RegistrationStatus {
  PENDING      // En attente (par défaut)
  CONFIRMED    // Confirmée
  CANCELLED    // Annulée
  REFUNDED     // Remboursée
}
```

## 🔗 Relations

- **Event** : Chaque inscription est liée à un événement (`eventId`)
- **User** (optionnel) : Peut être liée à un utilisateur connecté (`userId`)
- **Cascade Delete** : Si un événement est supprimé, toutes ses inscriptions sont supprimées

## 🔐 Sécurité et Contraintes

1. **Unicité Email par Événement** :
   - Un même email ne peut s'inscrire qu'une seule fois à un événement
   - Index sur `[eventId, email]` pour garantir cette contrainte

2. **Validation** :
   - `fullName` : Requis, minimum 2 caractères
   - `email` : Requis, format email valide
   - `phone` : Optionnel
   - `notes` : Optionnel

3. **Rate Limiting** :
   - Maximum 5 inscriptions par IP toutes les 15 minutes
   - Protection contre les abus

## 📍 Utilisation dans le Code

### API Publique (Inscription)
- **Route** : `/api/events/[id]/register`
- **Méthode** : `POST`
- **Table utilisée** : `Registration`
- **Statut par défaut** : `PENDING`

### API Admin (Gestion)
- **Route** : `/api/admin/events/[id]/registrations`
- **Méthode** : `GET` (liste) / `POST` (création manuelle)
- **Table utilisée** : `Registration`
- **Statut pour inscriptions manuelles** : `CONFIRMED`

## 🔍 Requêtes Exemples

### Créer une inscription
```typescript
const registration = await prisma.registration.create({
  data: {
    eventId: 'uuid-de-l-evenement',
    fullName: 'Jean Dupont',
    email: 'jean@example.com',
    phone: '+33 6 12 34 56 78',
    notes: 'Besoin d\'un parking',
    status: 'PENDING',
  },
})
```

### Récupérer les inscriptions d'un événement
```typescript
const registrations = await prisma.registration.findMany({
  where: { eventId: 'uuid-de-l-evenement' },
  orderBy: { createdAt: 'desc' },
})
```

### Vérifier si un email est déjà inscrit
```typescript
const existing = await prisma.registration.findFirst({
  where: {
    eventId: 'uuid-de-l-evenement',
    email: 'jean@example.com',
  },
})
```

## 📊 Statistiques

Pour obtenir le nombre d'inscriptions d'un événement :
```typescript
const count = await prisma.registration.count({
  where: { eventId: 'uuid-de-l-evenement' },
})
```

## 🎯 Cas d'Usage

1. **Inscription publique** : Via le formulaire `/events/[slug]/register`
2. **Inscription manuelle** : Depuis l'admin avec le bouton "Inscrire"
3. **Gestion des inscriptions** : Page admin pour voir/modifier les inscriptions
4. **Paiements** : Support Stripe intégré (champs `stripeSessionId`, `amountInCents`, `currency`)

