# 📧 Configuration Nodemailer avec Gmail

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env` :

```env
# Configuration SMTP pour Gmail
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"  # true pour port 465, false pour port 587
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-app-password-gmail"  # App Password Gmail (16 caractères)
CONTACT_EMAIL="contact@oma.com"  # Email où recevoir les messages de contact
```

## Configuration Gmail

### 1. Activer la validation en 2 étapes

1. Aller sur https://myaccount.google.com/security
2. Activer la "Validation en deux étapes" si ce n'est pas déjà fait

### 2. Créer un App Password

1. Aller sur https://myaccount.google.com/apppasswords
2. Sélectionner "Mail" et "Autre (nom personnalisé)"
3. Entrer "Réseau OMA" comme nom
4. Cliquer sur "Générer"
5. **Copier le mot de passe de 16 caractères** (sans espaces)
6. Utiliser ce mot de passe dans `SMTP_PASS`

**Important** : Utilisez l'App Password, pas votre mot de passe Gmail normal !

## Test de la configuration

Après avoir configuré les variables, testez l'envoi d'email :

1. Aller sur la page de contact du site
2. Remplir et envoyer un message
3. Vérifier que :
   - Le message est enregistré en base de données
   - Un email est reçu à l'adresse `CONTACT_EMAIL`

## Dépannage

### Erreur : "Invalid login"

- Vérifier que vous utilisez un App Password, pas votre mot de passe Gmail
- Vérifier que la validation en 2 étapes est activée

### Erreur : "Connection timeout"

- Vérifier que `SMTP_PORT` est correct (587 pour TLS, 465 pour SSL)
- Vérifier que `SMTP_SECURE` correspond au port (false pour 587, true pour 465)

### Email non reçu

- Vérifier le dossier spam
- Vérifier que `CONTACT_EMAIL` est correct
- Vérifier les logs du serveur pour les erreurs




