# 🔍 Guide de Diagnostic Email - Résolution du problème

## ⚠️ Message d'erreur
Si vous voyez : **"Votre message a été enregistré mais l'envoi de l'email a échoué"**

Cela signifie que le message est bien enregistré en base de données, mais l'email n'a pas pu être envoyé.

## 🚀 Solution rapide : Page de diagnostic

Une page de diagnostic a été créée pour vous aider :

**Aller sur : `/admin/settings/email-test`**

Cette page vous permet de :
1. ✅ Voir la configuration SMTP actuelle
2. ✅ Tester la connexion SMTP
3. ✅ Envoyer un email de test
4. ✅ Voir les erreurs détaillées

## 📋 Checklist de vérification

### 1. Vérifier la configuration SMTP

**Aller sur : `/admin/settings`**

Vérifiez que tous ces champs sont remplis :

- ✅ **Serveur SMTP (Host)** : `smtp.gmail.com`
- ✅ **Port SMTP** : `587`
- ✅ **Connexion sécurisée** : `Non (TLS - Port 587)`
- ✅ **Email SMTP (User)** : Votre email Gmail complet (ex: `votre-email@gmail.com`)
- ✅ **Mot de passe SMTP** : Votre App Password Gmail (⚠️ **PAS votre mot de passe Gmail normal**)

### 2. Créer un App Password Gmail

Si vous n'avez pas d'App Password :

1. Aller sur : https://myaccount.google.com/apppasswords
2. Sélectionner "Mail" et "Autre (nom personnalisé)"
3. Entrer "OMA Contact Form"
4. Cliquer sur "Générer"
5. **Copier le mot de passe généré** (16 caractères)
6. Coller ce mot de passe dans `/admin/settings` → "Mot de passe SMTP"

⚠️ **Important** : Utilisez l'App Password, pas votre mot de passe Gmail normal !

### 3. Vérifier l'email de contact

**Aller sur : `/admin/settings`**

Dans la section "Informations de contact", vérifiez que :
- ✅ L'**Email du site** est rempli (c'est cet email qui recevra les messages)

### 4. Vérifier les logs

**Dans le terminal où `npm run dev` tourne**, regardez les logs après avoir envoyé un message :

Vous devriez voir :
```
[Nodemailer] Début envoi email...
[Nodemailer] Email de contact: contact@oma.com
[Nodemailer] Config SMTP: { host: '...', port: ..., ... }
```

Si une erreur se produit, elle sera loggée avec tous les détails.

## 🔧 Erreurs courantes et solutions

### Erreur : "Configuration SMTP incomplète"

**Cause** : Un ou plusieurs paramètres SMTP sont manquants

**Solution** :
1. Aller sur `/admin/settings`
2. Remplir tous les champs de la section "Configuration Email (SMTP)"
3. Sauvegarder
4. Réessayer

### Erreur : "Invalid login" ou "Authentication failed"

**Cause** : Mauvais email ou mot de passe

**Solutions** :
1. Vérifier que l'email SMTP est correct (email Gmail complet)
2. Vérifier que vous utilisez un **App Password**, pas votre mot de passe Gmail normal
3. Recréer un App Password si nécessaire

### Erreur : "Connection timeout" ou "ECONNREFUSED"

**Cause** : Problème de connexion réseau ou port bloqué

**Solutions** :
1. Vérifier votre connexion internet
2. Vérifier que le port 587 n'est pas bloqué par un firewall
3. Essayer avec le port 465 et Secure = true (SSL)

### Erreur : "Email de contact non configuré"

**Cause** : L'email de contact n'est pas rempli dans les paramètres

**Solution** :
1. Aller sur `/admin/settings`
2. Remplir l'email dans la section "Informations de contact"
3. Sauvegarder

## 🧪 Test étape par étape

### Étape 1 : Tester la configuration

1. Aller sur `/admin/settings/email-test`
2. Vérifier que la configuration SMTP est correcte
3. Vérifier que le "Test de connexion SMTP" est vert ✅

### Étape 2 : Envoyer un email de test

1. Dans `/admin/settings/email-test`
2. Entrer votre email dans "Email de destination"
3. Cliquer sur "Envoyer"
4. Vérifier votre boîte mail (et les spams)

### Étape 3 : Tester avec le formulaire de contact

1. Aller sur la page de contact du site
2. Remplir et envoyer un message
3. Vérifier les logs dans le terminal
4. Vérifier votre boîte mail

## 📊 Vérifier les logs détaillés

Après avoir envoyé un message, dans le terminal du serveur, vous devriez voir :

**Si succès** :
```
[Nodemailer] Début envoi email...
[Nodemailer] Email de contact: contact@oma.com
[Nodemailer] Config SMTP: { host: 'smtp.gmail.com', port: 587, ... }
[Nodemailer] Transporteur créé avec succès
[Nodemailer] Envoi email...
[Nodemailer] Email envoyé avec succès: <message-id>
[API Contact] ✅ Email envoyé avec succès
```

**Si erreur** :
```
[Nodemailer] Erreur envoi email: [message d'erreur]
[Nodemailer] Détails erreur: { code: '...', response: '...', ... }
[API Contact] ❌ Erreur envoi email: [message d'erreur]
```

## 🆘 Si rien ne fonctionne

1. **Vérifier les logs** dans le terminal du serveur
2. **Utiliser la page de test** : `/admin/settings/email-test`
3. **Vérifier que Gmail autorise les "apps moins sécurisées"** (déconseillé, utilisez App Password)
4. **Essayer avec un autre service SMTP** (Outlook, SendGrid, etc.)

## 📝 Notes importantes

- ⚠️ **App Password obligatoire** : Gmail ne permet plus l'utilisation du mot de passe normal
- ⚠️ **Port 587 avec TLS** : C'est la configuration recommandée pour Gmail
- ⚠️ **Email de contact** : Doit être configuré dans les paramètres
- ✅ **Cache SMTP** : Les paramètres sont mis en cache 5 minutes, actualisez après modification

## 🎯 Prochaines étapes

1. Aller sur `/admin/settings/email-test`
2. Vérifier la configuration
3. Tester l'envoi d'email
4. Si ça fonctionne, tester avec le formulaire de contact
5. Si ça ne fonctionne pas, vérifier les logs et suivre les solutions ci-dessus



