# Guide de Configuration des Pixels de Tracking

## 🎯 Vue d'ensemble

Ce guide vous explique comment configurer et gérer les pixels de tracking (Facebook, Google Analytics, TikTok, etc.) depuis le panneau d'administration. Tous les pixels sont gérés dynamiquement sans modification de code.

## 📍 Accès à l'interface

1. Connectez-vous au panneau d'administration : `/admin`
2. Dans le menu de navigation, cliquez sur **"Pixels"** (icône Code)
3. Vous arrivez sur la page `/admin/pixels`

## 🚀 Configuration rapide

### 1. Facebook Pixel (Meta)

**Nom** : `Facebook Pixel Principal`

**Type** : `Facebook Pixel (Meta)`

**ID du pixel** : Votre ID Facebook Pixel (ex: `123456789012345`)
- Trouvez-le dans : Facebook Business Manager > Événements > Paramètres du pixel

**Position** : `Head` (recommandé)

**Activer** : ✅ Oui

**Description** : `Pixel Facebook pour suivre les conversions et créer des audiences`

---

### 2. Google Analytics (GA4)

**Nom** : `Google Analytics GA4`

**Type** : `Google Analytics (GA4)`

**ID du pixel** : Votre ID de mesure GA4 (ex: `G-XXXXXXXXXX`)
- Format : `G-XXXXXXXXXX`
- Trouvez-le dans : Google Analytics > Admin > Paramètres de flux de données > ID de mesure

**Position** : `Head` (recommandé)

**Activer** : ✅ Oui

**Description** : `Google Analytics 4 pour analyser le trafic et le comportement des utilisateurs`

---

### 3. Google Tag Manager

**Nom** : `Google Tag Manager`

**Type** : `Google Tag Manager`

**ID du pixel** : Votre ID de conteneur GTM (ex: `GTM-XXXXXXX`)
- Format : `GTM-XXXXXXX`
- Trouvez-le dans : Google Tag Manager > Onglet Conteneur > ID du conteneur

**Position** : `Head` (recommandé)

**Activer** : ✅ Oui

**Description** : `Google Tag Manager pour gérer tous les tags de tracking`

---

### 4. TikTok Pixel

**Nom** : `TikTok Pixel`

**Type** : `TikTok Pixel`

**ID du pixel** : Votre ID TikTok Pixel (ex: `C1234567890ABCDEF`)
- Trouvez-le dans : TikTok Ads Manager > Outils > Événements > Pixel

**Position** : `Head` (recommandé)

**Activer** : ✅ Oui

**Description** : `Pixel TikTok pour suivre les conversions et optimiser les campagnes`

---

### 5. LinkedIn Insight Tag

**Nom** : `LinkedIn Insight Tag`

**Type** : `LinkedIn Insight Tag`

**ID du pixel** : Votre ID LinkedIn (ex: `1234567`)
- Trouvez-le dans : LinkedIn Campaign Manager > Compte > Insight Tag

**Position** : `Head` (recommandé)

**Activer** : ✅ Oui

**Description** : `LinkedIn Insight Tag pour suivre les conversions et créer des audiences`

---

### 6. Twitter Pixel (X)

**Nom** : `Twitter Pixel`

**Type** : `Twitter Pixel (X)`

**ID du pixel** : Votre ID Twitter Pixel (ex: `o1abc`)
- Trouvez-le dans : Twitter Ads > Outils > Conversion tracking > Pixel

**Position** : `Head` (recommandé)

**Activer** : ✅ Oui

**Description** : `Pixel Twitter pour suivre les conversions et optimiser les campagnes`

---

### 7. Pinterest Pixel

**Nom** : `Pinterest Pixel`

**Type** : `Pinterest Pixel`

**ID du pixel** : Votre ID Pinterest Pixel (ex: `1234567890123456789`)
- Trouvez-le dans : Pinterest Ads Manager > Conversions > Pixel

**Position** : `Head` (recommandé)

**Activer** : ✅ Oui

**Description** : `Pixel Pinterest pour suivre les conversions et créer des audiences`

---

### 8. Snapchat Pixel

**Nom** : `Snapchat Pixel`

**Type** : `Snapchat Pixel`

**ID du pixel** : Votre ID Snapchat Pixel (ex: `12345678-1234-1234-1234-123456789012`)
- Trouvez-le dans : Snapchat Ads Manager > Outils > Pixel

**Position** : `Head` (recommandé)

**Activer** : ✅ Oui

**Description** : `Pixel Snapchat pour suivre les conversions et optimiser les campagnes`

---

### 9. Script personnalisé

**Nom** : `Script Personnalisé`

**Type** : `Script personnalisé`

**ID du pixel** : `custom-1` (peut être n'importe quel identifiant)

**Position** : `Head` ou `Body` (selon vos besoins)

**Script personnalisé** : Collez votre script complet ici
```html
<script>
  // Votre script de tracking personnalisé
  (function() {
    // Code ici
  })();
</script>
```

**Activer** : ✅ Oui

**Description** : `Script de tracking personnalisé`

---

## 📝 Guide pas à pas - Créer un pixel

### Étape 1 : Accéder à l'interface

1. Allez sur `/admin/pixels`
2. Cliquez sur le bouton **"Nouveau Pixel"** (en haut à droite)

### Étape 2 : Remplir les informations

#### Nom du pixel (obligatoire)
- Donnez un nom descriptif (ex: "Facebook Pixel Principal")
- Ce nom apparaît dans la liste des pixels

#### Type de pixel (obligatoire)
- Sélectionnez le type de pixel dans la liste déroulante
- Les types disponibles :
  - Facebook Pixel (Meta)
  - Google Analytics (GA4)
  - Google Tag Manager
  - TikTok Pixel
  - LinkedIn Insight Tag
  - Twitter Pixel (X)
  - Pinterest Pixel
  - Snapchat Pixel
  - Script personnalisé

#### ID du pixel (obligatoire)
- Entrez l'ID de votre pixel
- Le format dépend du type :
  - **Facebook** : `123456789012345` (15 chiffres)
  - **Google Analytics** : `G-XXXXXXXXXX`
  - **Google Tag Manager** : `GTM-XXXXXXX`
  - **TikTok** : `C1234567890ABCDEF`
  - **LinkedIn** : `1234567`
  - **Twitter** : `o1abc`
  - **Pinterest** : `1234567890123456789`
  - **Snapchat** : `12345678-1234-1234-1234-123456789012`

#### Position du script
- **Head** (recommandé) : Le script sera chargé dans le `<head>` de la page
- **Body** : Le script sera chargé dans le `<body>` de la page
- La plupart des pixels fonctionnent mieux dans le `head`

#### Activer le pixel
- ✅ **Activé** : Le pixel sera injecté sur le site
- ❌ **Désactivé** : Le pixel ne sera pas injecté (utile pour tester ou désactiver temporairement)

#### Description (optionnel)
- Ajoutez une description pour vous rappeler à quoi sert ce pixel
- Exemple : "Pixel Facebook pour suivre les conversions des campagnes publicitaires"

#### Site web (optionnel)
- URL du site web associé au pixel
- Exemple : `https://business.facebook.com/events_manager`

#### Script personnalisé (uniquement pour type "Script personnalisé")
- Collez votre script complet ici
- Incluez les balises `<script>` si nécessaire
- Le script sera injecté tel quel dans la page

### Étape 3 : Enregistrer

1. Cliquez sur le bouton **"Enregistrer"**
2. Un message de confirmation apparaît
3. Le pixel est maintenant actif sur le site

---

## ✅ Checklist de configuration

Pour chaque pixel, vérifiez que vous avez :

- [ ] Nom du pixel défini
- [ ] Type de pixel sélectionné
- [ ] ID du pixel correct (vérifiez le format)
- [ ] Position du script choisie (head recommandé)
- [ ] Pixel activé
- [ ] Description ajoutée (optionnel mais recommandé)

---

## 🔧 Gestion des pixels

### Activer/Désactiver un pixel

1. Dans la liste des pixels, cliquez sur l'icône de statut (✅ ou ❌)
2. Le pixel sera immédiatement activé ou désactivé
3. Les changements prennent effet immédiatement (rafraîchissez la page)

### Modifier un pixel

1. Cliquez sur l'icône **"Modifier"** (crayon) à côté du pixel
2. Modifiez les informations nécessaires
3. Cliquez sur **"Enregistrer"**

### Supprimer un pixel

1. Cliquez sur l'icône **"Supprimer"** (poubelle) à côté du pixel
2. Confirmez la suppression
3. Le pixel sera supprimé définitivement

---

## 🧪 Tester vos pixels

### Vérifier dans le code source

1. Ouvrez votre site dans le navigateur
2. Affichez le code source (Ctrl+U ou Cmd+U)
3. Recherchez les scripts de tracking dans le `<head>` ou `<body>`

### Utiliser les outils de débogage

#### Facebook Pixel Helper
1. Installez l'extension Chrome "Facebook Pixel Helper"
2. Visitez votre site
3. L'extension vous indiquera si le pixel fonctionne

#### Google Tag Assistant
1. Installez l'extension Chrome "Tag Assistant Legacy"
2. Visitez votre site
3. L'extension vérifiera tous les tags Google

#### TikTok Pixel Helper
1. Installez l'extension Chrome "TikTok Pixel Helper"
2. Visitez votre site
3. L'extension vérifiera le pixel TikTok

### Vérifier dans les dashboards

1. **Facebook Events Manager** : Vérifiez que les événements sont enregistrés
2. **Google Analytics** : Vérifiez le trafic en temps réel
3. **TikTok Ads Manager** : Vérifiez les événements dans le pixel

---

## 📊 Bonnes pratiques

### Performance
- ✅ Limitez le nombre de pixels actifs (3-5 maximum recommandé)
- ✅ Utilisez Google Tag Manager pour gérer plusieurs tags
- ✅ Placez les pixels dans le `head` pour un chargement plus rapide

### Confidentialité
- ✅ Informez les utilisateurs des pixels de tracking (RGPD)
- ✅ Utilisez le consentement des cookies si nécessaire
- ✅ Désactivez les pixels en développement/test

### Organisation
- ✅ Donnez des noms clairs aux pixels
- ✅ Ajoutez des descriptions pour vous rappeler leur usage
- ✅ Désactivez les pixels non utilisés au lieu de les supprimer

---

## 🔍 Dépannage

### Problème : Le pixel ne s'affiche pas
**Solutions** :
1. Vérifiez que le pixel est activé dans l'admin
2. Videz le cache du navigateur (Ctrl+Shift+R)
3. Vérifiez que l'ID du pixel est correct
4. Vérifiez les logs de la console pour des erreurs

### Problème : Le pixel ne track pas les événements
**Solutions** :
1. Vérifiez que le pixel est bien chargé (code source)
2. Utilisez les outils de débogage (extensions Chrome)
3. Vérifiez que les événements sont bien configurés dans le dashboard
4. Attendez quelques minutes (le tracking peut avoir un délai)

### Problème : Erreur dans la console
**Solutions** :
1. Vérifiez le format de l'ID du pixel
2. Vérifiez que le script personnalisé est valide (si utilisé)
3. Vérifiez que le pixel n'est pas en conflit avec d'autres scripts

---

## 📚 Ressources

### Documentation officielle
- [Facebook Pixel](https://developers.facebook.com/docs/meta-pixel)
- [Google Analytics](https://developers.google.com/analytics)
- [Google Tag Manager](https://developers.google.com/tag-manager)
- [TikTok Pixel](https://ads.tiktok.com/help/article?aid=10028)
- [LinkedIn Insight Tag](https://www.linkedin.com/help/lms/answer/a427660)

### Outils de débogage
- [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
- [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
- [TikTok Pixel Helper](https://chrome.google.com/webstore/detail/tiktok-pixel-helper/ckcdemofhjdjhefajjpdlojnkjgoefab)

---

**Dernière mise à jour** : 2024

Pour toute question, consultez la documentation technique dans le code source.

