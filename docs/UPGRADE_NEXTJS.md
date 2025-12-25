# 🚀 Mise à jour de Next.js

## ✅ Changements appliqués

### Versions mises à jour

- **Next.js** : `15.5.4` → `^15.5.9` (dernière version stable de Next.js 15)
- **@types/react** : `^18` → `^19` (aligné avec React 19)
- **@types/react-dom** : `^18` → `^19` (aligné avec React 19)

**Note** : Si vous souhaitez passer à Next.js 16 (version majeure), voir la section [Upgrade vers Next.js 16](#upgrade-vers-nextjs-16) ci-dessous.

## 📋 Commandes à exécuter

### 1. Installer les nouvelles versions

```bash
# Avec npm
npm install

# Ou avec pnpm (recommandé)
pnpm install
```

### 2. Vérifier que tout fonctionne

```bash
# Lancer le serveur de développement
npm run dev

# Tester le build
npm run build
```

## ⚠️ Points d'attention

### Next.js 15 - Changements majeurs

Next.js 15 apporte plusieurs améliorations et changements :

1. **React 19 Support** : Next.js 15 supporte officiellement React 19
2. **Turbopack** : Meilleure performance en développement
3. **Caching amélioré** : Nouveau système de cache plus performant
4. **Server Actions** : Amélioration des Server Actions

### Vérifications à faire

1. **Vérifier les imports** : Certains imports peuvent avoir changé
2. **Tester les routes API** : Vérifier que toutes les routes API fonctionnent
3. **Vérifier les Server Components** : S'assurer que les composants serveur fonctionnent correctement
4. **Tester l'authentification** : Vérifier que NextAuth fonctionne toujours

### Problèmes potentiels

Si vous rencontrez des erreurs après la mise à jour :

1. **Erreurs TypeScript** : Les types React 19 peuvent être plus stricts
   - Solution : Vérifier les types dans les composants

2. **Erreurs de build** : Certaines fonctionnalités peuvent avoir changé
   - Solution : Consulter le [changelog Next.js 15](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)

3. **Problèmes de cache** : Le système de cache a changé
   - Solution : Nettoyer le cache : `rm -rf .next`

## 🔍 Vérifications post-mise à jour

### Checklist

- [ ] Le serveur de développement démarre sans erreur
- [ ] Le build de production fonctionne (`npm run build`)
- [ ] Toutes les pages se chargent correctement
- [ ] Les routes API fonctionnent
- [ ] L'authentification fonctionne
- [ ] Les images s'affichent correctement
- [ ] Les formulaires fonctionnent
- [ ] Le panneau admin est accessible

## 📚 Ressources

- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
- [Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [React 19 Documentation](https://react.dev/blog/2024/04/25/react-19)

## 🐛 Dépannage

### Erreur : "Module not found"

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Erreur : "Type errors"

```bash
# Vérifier les types
npm run build
# Corriger les erreurs TypeScript affichées
```

### Erreur : "Cache issues"

```bash
# Nettoyer le cache Next.js
rm -rf .next
npm run dev
```

## 🚀 Upgrade vers Next.js 16 (Optionnel)

Si vous souhaitez passer à Next.js 16 (version majeure avec breaking changes) :

### ⚠️ Attention

Next.js 16 est une version majeure qui peut contenir des breaking changes. Il est recommandé de :
1. Tester en local d'abord
2. Lire le [changelog Next.js 16](https://nextjs.org/blog/next-16)
3. Vérifier la compatibilité de toutes les dépendances

### Mise à jour vers Next.js 16

```bash
npm install next@latest react@latest react-dom@latest
```

### Breaking Changes à vérifier

- [ ] Vérifier les Server Actions
- [ ] Vérifier les Server Components
- [ ] Vérifier les routes API
- [ ] Vérifier NextAuth (peut nécessiter une mise à jour)
- [ ] Vérifier les middlewares

## ✅ Après la mise à jour

Une fois la mise à jour réussie :

1. Tester toutes les fonctionnalités principales
2. Vérifier les performances
3. Mettre à jour la documentation si nécessaire
4. Commit les changements

```bash
git add package.json package-lock.json
git commit -m "chore: upgrade Next.js to 15.5.9 and React types to 19"
```

