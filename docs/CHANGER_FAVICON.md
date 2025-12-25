# Comment Changer le Favicon (Icône du Site)

Le favicon est l'icône qui apparaît dans l'onglet du navigateur à côté du titre de la page.

## 📋 Méthodes pour Changer le Favicon

### Méthode 1 : Fichier dans le dossier `app/` (Recommandé pour Next.js 13+)

Next.js détecte automatiquement les fichiers d'icône dans le dossier `app/`. Placez simplement votre fichier d'icône dans `app/` avec l'un de ces noms :

- `icon.ico` - Format ICO (recommandé pour compatibilité maximale)
- `icon.png` - Format PNG
- `icon.svg` - Format SVG (meilleure qualité, moderne)
- `favicon.ico` - Format ICO classique

**Étapes :**

1. Préparez votre fichier d'icône :
   - Taille recommandée : 32x32px ou 16x16px pour `.ico`
   - Taille recommandée : 512x512px pour `.png` (Next.js générera les tailles nécessaires)
   - Format SVG pour une qualité optimale

2. Renommez votre fichier en `icon.ico`, `icon.png`, ou `icon.svg`

3. Placez-le dans le dossier `app/` :
   ```
   app/
     icon.ico  (ou icon.png, icon.svg)
   ```

4. Redémarrez le serveur de développement ou refaites un build

### Méthode 2 : Configuration dans `app/layout.tsx`

Vous pouvez également configurer le favicon via les metadata dans `app/layout.tsx` :

```typescript
export const metadata: Metadata = {
  title: "Réseau OMA & OMA TV",
  description: "...",
  icons: {
    icon: '/favicon.ico',        // Fichier dans public/
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',    // Pour iOS
  },
}
```

Puis placez vos fichiers dans le dossier `public/` :
```
public/
  favicon.ico
  apple-icon.png
```

### Méthode 3 : Fichier dans `public/` avec référence HTML

Ajoutez manuellement dans `app/layout.tsx` :

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

## 🎨 Formats Recommandés

### Format ICO (`.ico`)
- **Avantages** : Compatibilité maximale, supporte plusieurs tailles
- **Taille** : 16x16px, 32x32px, ou 48x48px
- **Outils** : [Favicon Generator](https://favicon.io/), [RealFaviconGenerator](https://realfavicongenerator.net/)

### Format PNG (`.png`)
- **Avantages** : Qualité élevée, facile à créer
- **Taille** : 512x512px (Next.js générera les tailles nécessaires)
- **Outils** : Photoshop, GIMP, Canva

### Format SVG (`.svg`)
- **Avantages** : Qualité parfaite à toutes les tailles, léger
- **Taille** : Vectoriel (s'adapte automatiquement)
- **Outils** : Illustrator, Inkscape, Figma

## 📝 Exemple Pratique

### Créer un favicon depuis votre logo

1. **Si vous avez un logo PNG/SVG** :
   - Ouvrez-le dans un éditeur d'image
   - Redimensionnez à 512x512px (ou gardez les proportions)
   - Exportez en PNG ou SVG
   - Renommez en `icon.png` ou `icon.svg`
   - Placez dans `app/`

2. **Si vous voulez créer un favicon ICO** :
   - Utilisez [Favicon.io](https://favicon.io/) ou [RealFaviconGenerator](https://realfavicongenerator.net/)
   - Uploadez votre logo
   - Téléchargez le fichier `.ico` généré
   - Renommez en `icon.ico`
   - Placez dans `app/`

## ✅ Vérification

Après avoir ajouté votre favicon :

1. Redémarrez le serveur de développement (`npm run dev`)
2. Ouvrez votre site dans le navigateur
3. Vérifiez que l'icône apparaît dans l'onglet
4. Si ce n'est pas le cas, videz le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)

## 🔄 Mise à Jour du Favicon

Pour changer le favicon existant :

1. Remplacez le fichier `app/icon.*` par votre nouveau fichier
2. Gardez le même nom de fichier (`icon.ico`, `icon.png`, ou `icon.svg`)
3. Redémarrez le serveur
4. Videz le cache du navigateur si nécessaire

## 📱 Support Multi-Plateforme

Pour un support optimal sur tous les appareils, créez plusieurs tailles :

- `icon.ico` - 16x16, 32x32, 48x48 (Windows, navigateurs)
- `apple-icon.png` - 180x180 (iOS)
- `android-icon.png` - 192x192, 512x512 (Android)

Next.js génère automatiquement les tailles nécessaires si vous utilisez `icon.png` dans `app/`.

