# Configuration Email Professionnel Hostinger

Ce guide explique comment configurer l'envoi d'emails professionnels avec une adresse email Hostinger.

## 📧 Paramètres SMTP Hostinger

### Configuration standard Hostinger

Les paramètres SMTP pour Hostinger sont les suivants :

- **Serveur SMTP (Host)** : `smtp.hostinger.com`
- **Port SSL** : `465` (recommandé, avec `secure: true`)
- **Port TLS** : `587` (alternative, avec `secure: false`)
- **Sécurité** : SSL/TLS activé
- **Authentification** : Requise

### Configuration via l'interface Admin

1. Allez dans **Admin → Paramètres**
2. Recherchez la section **Configuration Email / SMTP**
3. Configurez les paramètres suivants :

```
SMTP Host: smtp.hostinger.com
SMTP Port: 465 (ou 587)
SMTP Secure: true (pour port 465) ou false (pour port 587)
SMTP User: votre-email@votre-domaine.com
SMTP Pass: votre-mot-de-passe-email
```

### Configuration via Variables d'Environnement

Si vous préférez configurer via `.env`, ajoutez :

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=votre-email@votre-domaine.com
SMTP_PASS=votre-mot-de-passe-email
```

## 🔐 Récupération des identifiants Hostinger

### Via hPanel (Hostinger)

1. Connectez-vous à votre compte Hostinger
2. Allez dans **Email → Comptes Email**
3. Sélectionnez votre compte email professionnel
4. Cliquez sur **Gérer** ou **Paramètres**
5. Notez les informations SMTP affichées

### Informations nécessaires

- **Adresse email complète** : `contact@votre-domaine.com`
- **Mot de passe** : Le mot de passe de votre compte email (pas celui de votre compte Hostinger)

## ✅ Vérification de la Configuration

### Test d'envoi

1. Allez dans **Admin → Paramètres**
2. Utilisez la fonction de test d'envoi d'email (si disponible)
3. Vérifiez que l'email arrive correctement

### Vérification des logs

Les logs d'envoi d'email sont disponibles dans la console :
- Succès : `[Nodemailer] Email envoyé avec succès`
- Erreur : `[Nodemailer] Erreur envoi email: ...`

## 🛠️ Dépannage

### Erreur "Authentication failed"

- Vérifiez que l'adresse email et le mot de passe sont corrects
- Assurez-vous d'utiliser le mot de passe du compte email, pas celui du compte Hostinger
- Vérifiez que l'authentification SMTP est activée dans Hostinger

### Erreur "Connection timeout"

- Vérifiez que le port est correct (465 pour SSL, 587 pour TLS)
- Vérifiez que `SMTP_SECURE` correspond au port utilisé
- Vérifiez votre pare-feu et que le port n'est pas bloqué

### Erreur "Certificate verification failed"

- En développement, le code ignore les certificats auto-signés
- En production, assurez-vous que le certificat SSL de Hostinger est valide

## 📝 Notes importantes

1. **Sécurité** : Ne commitez jamais vos identifiants SMTP dans le code source
2. **Port recommandé** : Utilisez le port 465 avec SSL pour une meilleure sécurité
3. **Limites** : Vérifiez les limites d'envoi de votre plan Hostinger
4. **SPF/DKIM** : Assurez-vous que les enregistrements SPF et DKIM sont configurés pour éviter que vos emails soient marqués comme spam

## 🔄 Migration depuis Gmail

Si vous migrez depuis Gmail :

1. Mettez à jour les paramètres SMTP dans l'interface admin
2. Changez `SMTP_HOST` de `smtp.gmail.com` à `smtp.hostinger.com`
3. Changez `SMTP_PORT` de `587` à `465` (ou gardez 587 si vous préférez TLS)
4. Mettez à jour `SMTP_USER` avec votre nouvelle adresse email
5. Mettez à jour `SMTP_PASS` avec le mot de passe de votre compte email Hostinger

## 📚 Ressources

- [Documentation Hostinger Email](https://www.hostinger.com/tutorials/how-to-set-up-email-account)
- [Guide SMTP Hostinger](https://www.hostinger.com/tutorials/how-to-configure-smtp)

