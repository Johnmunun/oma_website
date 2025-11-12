# 🔍 Diagnostic Email - Problème d'envoi

## ✅ Modifications apportées

### 1. **Logging amélioré**
- Logs détaillés dans `lib/nodemailer.ts` pour voir exactement ce qui se passe
- Logs dans `app/api/contact/route.ts` pour voir les erreurs
- Détails d'erreur complets (code, command, response)

### 2. **Endpoint de test SMTP**
- **GET `/api/admin/test-smtp`** : Affiche la configuration SMTP et teste la connexion
- **POST `/api/admin/test-smtp`** : Envoie un email de test

### 3. **Gestion d'erreur améliorée**
- L'API retourne maintenant si l'email a été envoyé ou non
- Message d'erreur détaillé dans la réponse

## 🔧 Comment diagnostiquer

### Étape 1 : Vérifier les logs
Quand vous envoyez un message de contact, regardez les logs dans la console :

```
[Nodemailer] Début envoi email...
[Nodemailer] Email de contact: contact@oma.com
[Nodemailer] Config SMTP: { host: '...', port: ..., secure: ..., user: '...', pass: '***' }
[Nodemailer] Transporteur créé
[Nodemailer] Envoi email...
```

Si vous voyez une erreur, elle sera loggée avec tous les détails.

### Étape 2 : Tester la configuration SMTP

1. **Aller sur** `/admin/settings`
2. **Vérifier que les paramètres SMTP sont bien remplis** :
   - Serveur SMTP (Host) : `smtp.gmail.com`
   - Port SMTP : `587`
   - Connexion sécurisée : `Non (TLS - Port 587)`
   - Email SMTP (User) : votre email Gmail
   - Mot de passe SMTP : votre App Password Gmail

3. **Tester la connexion** :
   - Ouvrir la console du navigateur (F12)
   - Aller dans l'onglet Network
   - Faire une requête GET vers `/api/admin/test-smtp`
   - Voir la réponse pour vérifier la configuration

### Étape 3 : Vérifier l'email de contact

1. **Aller sur** `/admin/settings`
2. **Vérifier que l'email de contact est rempli** dans la section "Informations de contact"
3. C'est cet email qui recevra les messages

### Étape 4 : Tester l'envoi

1. **Aller sur** `/admin/settings`
2. **Utiliser l'endpoint de test** :
   - Ouvrir la console du navigateur (F12)
   - Exécuter :
   ```javascript
   fetch('/api/admin/test-smtp', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email: 'votre-email@test.com' })
   }).then(r => r.json()).then(console.log)
   ```

## 🐛 Problèmes courants

### 1. **Configuration SMTP incomplète**
**Symptôme** : Erreur "Configuration SMTP incomplète"
**Solution** : Remplir tous les champs SMTP dans `/admin/settings`

### 2. **App Password Gmail non configuré**
**Symptôme** : Erreur "Invalid login" ou "Authentication failed"
**Solution** : 
- Aller sur https://myaccount.google.com/apppasswords
- Créer un App Password
- Utiliser ce mot de passe (pas votre mot de passe Gmail normal)

### 3. **Email de contact non configuré**
**Symptôme** : Erreur "Email de contact non configuré"
**Solution** : Remplir l'email dans la section "Informations de contact" de `/admin/settings`

### 4. **Port ou Secure incorrect**
**Symptôme** : Erreur de connexion
**Solution** :
- Port 587 avec Secure = false (TLS)
- Port 465 avec Secure = true (SSL)

### 5. **Firewall ou réseau bloqué**
**Symptôme** : Timeout ou erreur de connexion
**Solution** : Vérifier que le port 587 ou 465 n'est pas bloqué

## 📋 Checklist de vérification

- [ ] Paramètres SMTP remplis dans `/admin/settings`
- [ ] Email de contact rempli dans `/admin/settings`
- [ ] App Password Gmail créé et utilisé (pas le mot de passe normal)
- [ ] Port 587 avec Secure = false (ou 465 avec Secure = true)
- [ ] Vérifier les logs dans la console pour voir l'erreur exacte
- [ ] Tester avec `/api/admin/test-smtp`

## 🔍 Vérifier les logs

Après avoir envoyé un message, regardez les logs dans la console du serveur (terminal où `npm run dev` tourne). Vous devriez voir :

```
[Nodemailer] Début envoi email...
[Nodemailer] Email de contact: ...
[Nodemailer] Config SMTP: ...
```

Si une erreur se produit, elle sera loggée avec tous les détails.


