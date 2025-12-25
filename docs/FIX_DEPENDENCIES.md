# 🔧 Résolution des Conflits de Dépendances

## Problème : ERESOLVE unable to resolve dependency tree

L'erreur survient car `vaul@0.9.9` déclare une dépendance peer sur React 16.8, 17.0 ou 18.0, alors que le projet utilise React 19.1.0.

## ✅ Solution Appliquée

### Option 1 : Utiliser `--legacy-peer-deps` (Recommandé)

Cette option indique à npm d'ignorer les conflits de peer dependencies. C'est la solution la plus simple et la plus sûre :

```bash
npm install --legacy-peer-deps
```

**Note** : `vaul` fonctionne généralement bien avec React 19 même si les peer dependencies ne le déclarent pas officiellement.

### Option 2 : Utiliser les overrides dans package.json

Le fichier `package.json` a été mis à jour avec une section `overrides` pour forcer React 19 pour vaul :

```json
"overrides": {
  "vaul": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  }
}
```

Avec cette configuration, vous pouvez installer normalement :

```bash
npm install
```

### Option 3 : Utiliser pnpm (Recommandé pour ce projet)

Le projet utilise déjà `pnpm-lock.yaml`, ce qui indique qu'il était prévu d'utiliser pnpm. pnpm gère mieux les peer dependencies :

```bash
# Installer pnpm si ce n'est pas déjà fait
npm install -g pnpm

# Installer les dépendances
pnpm install
```

## 📝 Notes

- Le composant `Drawer` (qui utilise `vaul`) n'est actuellement pas utilisé dans le projet
- Si vous n'utilisez pas le Drawer, vous pouvez supprimer `vaul` du `package.json`
- Les overrides dans `package.json` fonctionnent avec npm 8.3+ et pnpm

## 🔍 Vérification

Après l'installation, vérifiez que tout fonctionne :

```bash
# Vérifier que les dépendances sont installées
npm list vaul

# Lancer le serveur de développement
npm run dev
```

## ⚠️ Si le problème persiste

1. Supprimez `node_modules` et `package-lock.json` :
```bash
rm -rf node_modules package-lock.json
```

2. Nettoyez le cache npm :
```bash
npm cache clean --force
```

3. Réinstallez avec `--legacy-peer-deps` :
```bash
npm install --legacy-peer-deps
```


