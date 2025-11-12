# 📧 Configuration Email - Confirmation d'Inscription

## 🔧 Variables d'Environnement Requises

Pour activer l'envoi d'emails de confirmation, vous devez configurer les variables suivantes dans votre fichier `.env` :

```env
# Configuration SMTP
SMTP_HOST=smtp.gmail.com          # Serveur SMTP (Gmail, Outlook, etc.)
SMTP_PORT=587                     # Port SMTP (587 pour TLS, 465 pour SSL)
SMTP_SECURE=false                 # true pour SSL (port 465), false pour TLS (port 587)
SMTP_USER=votre-email@gmail.com   # Votre adresse email
SMTP_PASSWORD=votre-mot-de-passe  # Mot de passe ou App Password
SMTP_FROM=noreply@reseau-oma.com  # Adresse d'expéditeur (optionnel)

# Support
SUPPORT_EMAIL=contact@reseau-oma.com  # Email de support (optionnel)

# Site
NEXT_PUBLIC_SITE_URL=https://reseau-oma.com  # URL du site (optionnel)
```

## 📮 Configuration Gmail

### Option 1 : Mot de passe d'application (Recommandé)

1. Activez la validation en 2 étapes sur votre compte Google
2. Allez dans [Gestion de votre compte Google](https://myaccount.google.com/)
3. Sécurité → Validation en 2 étapes → Mots de passe des applications
4. Créez un nouveau mot de passe d'application
5. Utilisez ce mot de passe dans `SMTP_PASSWORD`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-app-password-ici
```

### Option 2 : OAuth2 (Avancé)

Pour une sécurité maximale, vous pouvez utiliser OAuth2 avec Gmail.

## 📮 Configuration Outlook/Office 365

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@outlook.com
SMTP_PASSWORD=votre-mot-de-passe
```

## 📮 Configuration Autre Fournisseur SMTP

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASSWORD=votre-api-key
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=votre-api-key-sendgrid
```

### Amazon SES
```env
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-access-key-id
SMTP_PASSWORD=votre-secret-access-key
```

## ✅ Test de Configuration

Le système vérifie automatiquement la configuration SMTP au démarrage. Si la configuration est manquante ou incorrecte :

- Les inscriptions seront toujours enregistrées
- Un avertissement sera loggé dans la console
- L'email ne sera pas envoyé (mais l'inscription réussit quand même)

## 📧 Template d'Email

L'email de confirmation inclut :

- ✅ Confirmation de l'inscription
- 📅 Date et heure de l'événement
- 📍 Lieu de l'événement
- 📝 Description de l'événement
- 🔢 Numéro de confirmation unique
- 📞 Informations de contact

## 🔄 Envoi Asynchrone

Les emails sont envoyés de manière asynchrone pour ne pas bloquer la réponse API :

- L'inscription est enregistrée immédiatement
- L'email est envoyé en arrière-plan
- Si l'envoi échoue, l'inscription reste valide

## 🛠️ Dépannage

### Email non reçu

1. Vérifiez les logs du serveur pour les erreurs
2. Vérifiez que les variables d'environnement sont correctes
3. Vérifiez que le port n'est pas bloqué par un firewall
4. Testez avec un autre fournisseur SMTP

### Erreur "Invalid login"

- Gmail : Utilisez un mot de passe d'application, pas votre mot de passe principal
- Vérifiez que la validation en 2 étapes est activée (Gmail)
- Vérifiez les identifiants SMTP

### Emails dans les spams

- Configurez SPF, DKIM et DMARC pour votre domaine
- Utilisez un service d'email professionnel (SendGrid, Mailgun, etc.)
- Évitez les mots-clés spam dans le contenu

## 📝 Notes

- Les emails sont envoyés uniquement si la configuration SMTP est valide
- Les erreurs d'envoi n'affectent pas l'inscription
- Le système fonctionne même sans configuration email (inscriptions sans email)

