# Système de Gestion SEO

## Vue d'ensemble

Le système SEO permet de gérer les métadonnées de référencement pour toutes les pages du site. Il est entièrement intégré dans le panneau d'administration et optimisé pour les moteurs de recherche.

## Fonctionnalités

### 1. Modèle SeoMeta optimisé

Le modèle `SeoMeta` dans Prisma inclut tous les champs nécessaires pour un SEO complet :

- **Meta tags de base** : title, description, keywords
- **Open Graph** : ogTitle, ogDescription, ogImageUrl, ogType
- **Twitter Card** : twitterCard, twitterTitle, twitterDescription, twitterImageUrl
- **Contrôle d'indexation** : noIndex, noFollow
- **URL canonique** : canonicalUrl
- **Schema.org JSON-LD** : schemaJson (données structurées)

### 2. Interface Admin

Accédez à `/admin/seo` pour gérer toutes les métadonnées SEO :

- Créer de nouvelles métadonnées SEO
- Modifier les métadonnées existantes
- Supprimer les métadonnées
- Rechercher par slug, titre ou description

### 3. API Routes

#### Admin (protégée)
- `GET /api/admin/seo` - Liste toutes les métadonnées SEO
- `POST /api/admin/seo` - Crée une nouvelle métadonnée
- `PUT /api/admin/seo` - Met à jour une métadonnée
- `DELETE /api/admin/seo?id=...` - Supprime une métadonnée

#### Publique
- `GET /api/seo/[slug]` - Récupère les métadonnées pour un slug donné

### 4. Fichiers SEO

#### robots.txt
Le fichier `public/robots.txt` est configuré pour :
- Autoriser l'indexation des pages publiques
- Interdire l'indexation des pages admin et API
- Référencer le sitemap

#### sitemap.xml
Le fichier `app/sitemap.ts` génère automatiquement un sitemap dynamique incluant :
- Pages statiques (accueil, événements, formations, contact)
- Pages dynamiques (événements publiés, pages CMS)

## Utilisation

### 1. Créer des métadonnées SEO

1. Accédez à `/admin/seo`
2. Cliquez sur "Nouveau SEO"
3. Remplissez les champs :
   - **Slug** : Le chemin de la page (ex: "home" pour `/`, "events" pour `/events`)
   - **Titre SEO** : Maximum 60 caractères
   - **Description SEO** : Maximum 160 caractères
   - **Mots-clés** : Séparés par des virgules
   - **Open Graph** : Titre, description et image pour les réseaux sociaux
   - **Twitter Card** : Configuration pour Twitter
   - **Contrôle d'indexation** : Activer/désactiver noIndex et noFollow
   - **URL canonique** : URL canonique de la page
   - **Schema.org JSON-LD** : Données structurées (format JSON)

### 2. Utiliser dans les pages Next.js

Pour utiliser les métadonnées SEO dans une page, utilisez la fonction `generateSeoMetadata` :

```typescript
// app/page.tsx
import { generateSeoMetadata } from "@/lib/seo"

export async function generateMetadata() {
  return await generateSeoMetadata("home")
}

export default function HomePage() {
  return <div>...</div>
}
```

### 3. Exemple de Schema.org JSON-LD

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Réseau OMA",
  "description": "Plateforme internationale dédiée à l'art oratoire",
  "url": "https://votre-domaine.com",
  "logo": "https://votre-domaine.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "contact@oma.com"
  }
}
```

## Bonnes pratiques

### Titres SEO
- Maximum 60 caractères
- Inclure le mot-clé principal
- Unique pour chaque page

### Descriptions SEO
- Maximum 160 caractères
- Accrocheur et informatif
- Inclure un appel à l'action

### Images Open Graph
- Format recommandé : 1200x630px
- Format JPEG ou PNG
- Taille optimisée (< 1MB)

### Images Twitter
- Format recommandé : 1200x675px
- Format JPEG ou PNG
- Taille optimisée (< 1MB)

### Mots-clés
- Maximum 10-15 mots-clés
- Séparés par des virgules
- Pertinents et spécifiques

## Migration Prisma

Pour appliquer les changements au modèle SeoMeta, exécutez :

```bash
npx prisma migrate dev --name optimize_seo_meta
```

⚠️ **Note** : Si vous avez des données existantes dans `SeoMeta`, la migration peut échouer à cause de la contrainte unique sur `slug`. Dans ce cas :

1. Vérifiez les doublons : `SELECT slug, COUNT(*) FROM "SeoMeta" GROUP BY slug HAVING COUNT(*) > 1;`
2. Supprimez ou modifiez les doublons
3. Relancez la migration

## Configuration

### Variables d'environnement

Assurez-vous d'avoir configuré :

```env
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
```

Cette variable est utilisée pour :
- Générer les URLs canoniques
- Générer le sitemap
- Générer les meta tags Open Graph

## Vérification

### Tester les meta tags

1. Ouvrez votre page dans le navigateur
2. Affichez le code source (Ctrl+U)
3. Vérifiez la présence des meta tags dans le `<head>`

### Tester avec Google Search Console

1. Soumettez votre sitemap : `https://votre-domaine.com/sitemap.xml`
2. Vérifiez l'indexation des pages
3. Testez les rich snippets avec l'outil de test de Google

### Outils de test

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## Support

Pour toute question ou problème, consultez la documentation Next.js sur les [Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata).

