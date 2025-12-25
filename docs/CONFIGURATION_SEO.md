# Guide de Configuration SEO - Réseau OMA

## 🎯 Vue d'ensemble

Ce guide vous explique comment configurer le SEO de votre site depuis le panneau d'administration. Toutes les métadonnées SEO sont gérées via l'interface admin, sans avoir besoin de modifier le code.

## 📍 Accès à l'interface SEO

1. Connectez-vous au panneau d'administration : `/admin`
2. Dans le menu de navigation, cliquez sur **"SEO"** (icône Globe)
3. Vous arrivez sur la page `/admin/seo`

## 🚀 Configuration rapide - Pages essentielles

### 1. Page d'accueil (Home)

**Slug** : `home`

**Titre SEO** (max 60 caractères) :
```
Réseau OMA - Oratoire Mon Art | Formation Communication
```

**Description SEO** (max 160 caractères) :
```
Plateforme internationale dédiée à l'art oratoire, la communication et le leadership. Formations, événements et contenus pour dompter la parole.
```

**Mots-clés** :
```
art oratoire, communication, formation, leadership, prise de parole, réseau OMA, OMA TV, éloquence
```

**URL canonique** :
```
https://votre-domaine.com
```

**Image Open Graph** :
```
https://votre-domaine.com/og-home.jpg
```
*(Format recommandé : 1200x630px, JPEG ou PNG, < 1MB)*

**Type OG** : `website`

**Contrôle d'indexation** :
- ✅ No Index : **Désactivé** (la page doit être indexée)
- ✅ No Follow : **Désactivé**

**Schema.org JSON-LD** :
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Réseau OMA",
  "alternateName": "Oratoire Mon Art",
  "description": "Plateforme internationale dédiée à l'art oratoire, la communication et le leadership",
  "url": "https://votre-domaine.com",
  "logo": "https://votre-domaine.com/logo.png",
  "sameAs": [
    "https://www.facebook.com/votre-page",
    "https://www.instagram.com/votre-compte",
    "https://www.youtube.com/votre-chaine",
    "https://www.linkedin.com/company/votre-entreprise"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "contact@votre-domaine.com",
    "contactType": "Service client"
  }
}
```

---

### 2. Page Événements

**Slug** : `events`

**Titre SEO** :
```
Événements Réseau OMA | Formations et Conférences
```

**Description SEO** :
```
Découvrez nos événements : formations en art oratoire, conférences sur la communication et le leadership. Inscrivez-vous dès maintenant.
```

**Mots-clés** :
```
événements OMA, formations communication, conférences art oratoire, événements leadership
```

**URL canonique** :
```
https://votre-domaine.com/events
```

**Image Open Graph** :
```
https://votre-domaine.com/og-events.jpg
```

**Type OG** : `website`

**Schema.org JSON-LD** :
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Événements Réseau OMA",
  "description": "Liste de tous nos événements et formations",
  "url": "https://votre-domaine.com/events"
}
```

---

### 3. Page Formations

**Slug** : `formations`

**Titre SEO** :
```
Formations Art Oratoire | Réseau OMA
```

**Description SEO** :
```
Formations professionnelles en art oratoire, communication et leadership. Développez vos compétences avec nos experts certifiés.
```

**Mots-clés** :
```
formations art oratoire, formation communication, formation leadership, cours prise de parole
```

**URL canonique** :
```
https://votre-domaine.com/formations
```

**Image Open Graph** :
```
https://votre-domaine.com/og-formations.jpg
```

---

### 4. Page Contact

**Slug** : `contact`

**Titre SEO** :
```
Contactez-nous | Réseau OMA
```

**Description SEO** :
```
Contactez l'équipe Réseau OMA pour vos questions sur nos formations, événements ou partenariats. Nous répondons rapidement.
```

**Mots-clés** :
```
contact OMA, nous contacter, support client, assistance
```

**URL canonique** :
```
https://votre-domaine.com/contact
```

**Schema.org JSON-LD** :
```json
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Réseau OMA",
  "description": "Page de contact pour joindre l'équipe Réseau OMA",
  "url": "https://votre-domaine.com/contact"
}
```

---

## 📝 Guide pas à pas - Créer une métadonnée SEO

### Étape 1 : Accéder à l'interface

1. Allez sur `/admin/seo`
2. Cliquez sur le bouton **"Nouveau SEO"** (en haut à droite)

### Étape 2 : Remplir les informations de base

#### Slug (obligatoire)
- **Format** : Le chemin de la page sans le slash initial
- **Exemples** :
  - `home` pour la page d'accueil (`/`)
  - `events` pour `/events`
  - `formations` pour `/formations`
  - `contact` pour `/contact`

#### Page ID (optionnel)
- Laissez vide si vous utilisez un slug
- Utilisez uniquement si vous liez à une page CMS spécifique

### Étape 3 : Meta tags de base

#### Titre SEO
- **Maximum** : 60 caractères
- **Conseil** : Inclure le mot-clé principal au début
- **Format recommandé** : `Mot-clé principal | Nom du site`

#### Description SEO
- **Maximum** : 160 caractères
- **Conseil** : Accrocheur, informatif, avec un appel à l'action
- **Format recommandé** : Phrase courte + bénéfice + action

#### Mots-clés
- **Format** : Séparés par des virgules
- **Maximum** : 10-15 mots-clés pertinents
- **Exemple** : `art oratoire, communication, formation, leadership, prise de parole`

#### URL canonique
- **Format** : URL complète avec https://
- **Exemple** : `https://votre-domaine.com/events`
- **Important** : Utilisez l'URL finale (sans paramètres)

### Étape 4 : Open Graph (Réseaux sociaux)

#### Titre OG
- **Maximum** : 60 caractères
- **Conseil** : Peut être différent du titre SEO pour optimiser le partage social
- **Exemple** : `🎤 Formations Art Oratoire - Réseau OMA`

#### Description OG
- **Maximum** : 160 caractères
- **Conseil** : Plus accrocheur que la description SEO classique
- **Exemple** : `Transformez votre façon de communiquer avec nos formations certifiées. Inscrivez-vous maintenant !`

#### Image OG
- **Format** : URL complète (https://)
- **Dimensions recommandées** : 1200x630px
- **Format de fichier** : JPEG ou PNG
- **Taille** : < 1MB pour un chargement rapide
- **Exemple** : `https://votre-domaine.com/images/og-events.jpg`

#### Type OG
- **Options** :
  - `website` : Pour les pages générales (par défaut)
  - `article` : Pour les articles de blog
  - `video` : Pour les pages vidéo

### Étape 5 : Twitter Card

#### Type de carte
- **Options** :
  - `summary` : Carte simple avec image carrée
  - `summary_large_image` : Carte avec grande image (recommandé)

#### Titre Twitter
- **Maximum** : 60 caractères
- **Conseil** : Peut être identique au titre OG

#### Description Twitter
- **Maximum** : 160 caractères
- **Conseil** : Peut être identique à la description OG

#### Image Twitter
- **Format** : URL complète (https://)
- **Dimensions recommandées** : 1200x675px
- **Format de fichier** : JPEG ou PNG
- **Taille** : < 1MB

### Étape 6 : Contrôle d'indexation

#### No Index
- **Activer** : Empêche les moteurs de recherche d'indexer la page
- **Quand l'utiliser** :
  - Pages de test
  - Pages privées
  - Pages en construction
- **Par défaut** : Désactivé (la page sera indexée)

#### No Follow
- **Activer** : Empêche les moteurs de recherche de suivre les liens de la page
- **Quand l'utiliser** :
  - Pages avec liens externes non vérifiés
  - Pages de redirection
- **Par défaut** : Désactivé (les liens seront suivis)

### Étape 7 : Schema.org JSON-LD (Données structurées)

#### Format
- **Type** : JSON valide
- **Utilité** : Aide les moteurs de recherche à comprendre le contenu
- **Exemples** : Voir les exemples ci-dessous

#### Exemple pour une Organisation
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Réseau OMA",
  "alternateName": "Oratoire Mon Art",
  "description": "Plateforme internationale dédiée à l'art oratoire",
  "url": "https://votre-domaine.com",
  "logo": "https://votre-domaine.com/logo.png",
  "sameAs": [
    "https://www.facebook.com/votre-page",
    "https://www.instagram.com/votre-compte"
  ]
}
```

#### Exemple pour un Événement
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Formation Art Oratoire - Session 2024",
  "description": "Formation intensive en art oratoire et communication",
  "startDate": "2024-06-15T09:00:00+01:00",
  "endDate": "2024-06-16T18:00:00+01:00",
  "location": {
    "@type": "Place",
    "name": "Centre de Formation OMA",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Rue Example",
      "addressLocality": "Paris",
      "postalCode": "75001",
      "addressCountry": "FR"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "Réseau OMA",
    "url": "https://votre-domaine.com"
  }
}
```

#### Exemple pour une Page de Contact
```json
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Réseau OMA",
  "description": "Contactez-nous pour vos questions",
  "url": "https://votre-domaine.com/contact"
}
```

### Étape 8 : Enregistrer

1. Cliquez sur le bouton **"Enregistrer"**
2. Un message de confirmation apparaît
3. La métadonnée SEO est maintenant active

---

## ✅ Checklist de configuration SEO

Pour chaque page importante, vérifiez que vous avez :

- [ ] Slug configuré correctement
- [ ] Titre SEO (max 60 caractères)
- [ ] Description SEO (max 160 caractères)
- [ ] Mots-clés pertinents
- [ ] URL canonique définie
- [ ] Image Open Graph (1200x630px)
- [ ] Titre et description OG
- [ ] Image Twitter (1200x675px)
- [ ] Type OG approprié
- [ ] No Index/No Follow configurés correctement
- [ ] Schema.org JSON-LD (optionnel mais recommandé)

---

## 🎨 Bonnes pratiques

### Titres SEO
✅ **Bien** :
- `Formation Art Oratoire | Réseau OMA` (35 caractères)
- `Événements Communication 2024 - Réseau OMA` (42 caractères)

❌ **À éviter** :
- `Formation` (trop court, pas de contexte)
- `Formation Art Oratoire Communication Leadership Prise de Parole Réseau OMA` (trop long, > 60 caractères)

### Descriptions SEO
✅ **Bien** :
- `Découvrez nos formations en art oratoire et communication. Développez vos compétences avec nos experts certifiés. Inscrivez-vous maintenant.` (145 caractères)

❌ **À éviter** :
- `Formations` (trop court)
- `Découvrez nos formations en art oratoire et communication pour développer vos compétences professionnelles avec nos experts certifiés et obtenir une certification reconnue dans le domaine de la prise de parole en public et du leadership.` (trop long, > 160 caractères)

### Mots-clés
✅ **Bien** :
- `art oratoire, communication, formation, leadership, prise de parole, réseau OMA`

❌ **À éviter** :
- `art, oratoire, communication, formation, leadership, prise, de, parole, réseau, OMA, cours, stage, séminaire, conférence, workshop, training, coaching, développement, personnel, professionnel` (trop de mots-clés, pas assez ciblés)

---

## 🧪 Tester vos métadonnées SEO

### 1. Vérifier dans le code source
1. Ouvrez votre page dans le navigateur
2. Affichez le code source (Ctrl+U ou Cmd+U)
3. Recherchez les balises `<meta>` dans le `<head>`

### 2. Tester avec Google Rich Results
1. Allez sur : https://search.google.com/test/rich-results
2. Entrez l'URL de votre page
3. Vérifiez que les données structurées sont détectées

### 3. Tester Open Graph (Facebook)
1. Allez sur : https://developers.facebook.com/tools/debug/
2. Entrez l'URL de votre page
3. Vérifiez l'aperçu du partage

### 4. Tester Twitter Card
1. Allez sur : https://cards-dev.twitter.com/validator
2. Entrez l'URL de votre page
3. Vérifiez l'aperçu de la carte Twitter

---

## 📊 Exemples complets par type de page

### Page d'accueil
```
Slug: home
Titre: Réseau OMA - Oratoire Mon Art | Formation Communication
Description: Plateforme internationale dédiée à l'art oratoire, la communication et le leadership. Formations, événements et contenus pour dompter la parole.
Mots-clés: art oratoire, communication, formation, leadership, réseau OMA
URL canonique: https://votre-domaine.com
Image OG: https://votre-domaine.com/og-home.jpg
Type OG: website
No Index: ❌
No Follow: ❌
```

### Page d'événement spécifique
```
Slug: events/formation-art-oratoire-2024
Titre: Formation Art Oratoire 2024 | Réseau OMA
Description: Formation intensive de 2 jours en art oratoire et communication. Développez votre éloquence avec nos experts. Inscription ouverte.
Mots-clés: formation art oratoire, éloquence, communication, prise de parole
URL canonique: https://votre-domaine.com/events/formation-art-oratoire-2024
Image OG: https://votre-domaine.com/og-formation-2024.jpg
Type OG: article
No Index: ❌
No Follow: ❌
```

### Page blog/article
```
Slug: blog/10-conseils-art-oratoire
Titre: 10 Conseils pour Maîtriser l'Art Oratoire | Réseau OMA
Description: Découvrez 10 conseils pratiques pour améliorer votre prise de parole en public et devenir un orateur confiant.
Mots-clés: conseils art oratoire, prise de parole, éloquence, communication
URL canonique: https://votre-domaine.com/blog/10-conseils-art-oratoire
Image OG: https://votre-domaine.com/og-blog-10-conseils.jpg
Type OG: article
No Index: ❌
No Follow: ❌
```

---

## 🔧 Dépannage

### Problème : Les métadonnées ne s'affichent pas
**Solution** :
1. Vérifiez que le slug correspond exactement au chemin de la page
2. Vérifiez que la métadonnée est bien enregistrée dans l'admin
3. Videz le cache du navigateur (Ctrl+Shift+R)
4. Vérifiez les logs de la console pour des erreurs

### Problème : L'image Open Graph ne s'affiche pas
**Solution** :
1. Vérifiez que l'URL de l'image est accessible (ouvrez-la dans le navigateur)
2. Vérifiez que l'image est au format JPEG ou PNG
3. Vérifiez que la taille de l'image est < 1MB
4. Utilisez l'outil Facebook Debugger pour forcer le rafraîchissement

### Problème : Le JSON-LD génère une erreur
**Solution** :
1. Vérifiez que le JSON est valide (utilisez jsonlint.com)
2. Vérifiez que tous les champs obligatoires sont présents
3. Testez avec Google Rich Results Test

---

## 📚 Ressources supplémentaires

- [Documentation Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

---

## 💡 Conseils avancés

### Optimisation pour les recherches locales
Si vous avez des événements physiques, ajoutez des données structurées avec l'adresse :

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "location": {
    "@type": "Place",
    "name": "Centre de Formation OMA",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Rue Example",
      "addressLocality": "Paris",
      "postalCode": "75001",
      "addressCountry": "FR"
    }
  }
}
```

### Optimisation pour les vidéos (OMA TV)
Pour les pages de vidéos, utilisez le type `VideoObject` :

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Titre de la vidéo",
  "description": "Description de la vidéo",
  "thumbnailUrl": "https://votre-domaine.com/thumbnail.jpg",
  "uploadDate": "2024-01-15",
  "duration": "PT10M30S"
}
```

---

**Dernière mise à jour** : 2024

Pour toute question, consultez la documentation complète dans `docs/SEO_SYSTEM.md`.

