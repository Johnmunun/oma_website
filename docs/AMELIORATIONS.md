# 🔧 Points d'Amélioration - Projet OMA Website

## 📋 Table des matières
1. [Sécurité](#sécurité) 🔴 Critique
2. [Performance](#performance) 🟠 Important
3. [Qualité du Code](#qualité-du-code) 🟡 Moyen
4. [Tests & Documentation](#tests--documentation) 🟢 Souhaitable
5. [Configuration & DevOps](#configuration--devops) 🟡 Moyen

---

## 🔴 Sécurité

### 1. **Rate Limiting Insuffisant** ✅ RÉSOLU
**Problème** : Le rate limiting était en mémoire (Map) et ne fonctionnait pas en production multi-instances.

**Solution implémentée** :
- ✅ Rate limiting basé sur la base de données PostgreSQL (fonctionne sur toutes les instances Vercel)
- ✅ Utilitaire réutilisable dans `lib/rate-limit.ts`
- ✅ Rate limiting ajouté sur toutes les routes publiques (contact, newsletter, event registration)
- ✅ Nettoyage automatique des anciennes entrées

**Fichiers modifiés** :
- `lib/rate-limit.ts` (nouveau)
- `app/api/events/[id]/register/route.ts`
- `app/api/contact/route.ts`
- `app/api/newsletter/route.ts`
- `prisma/schema.prisma` (nouveau modèle `RateLimit`)

**Migration** : Voir `docs/MIGRATION_RATE_LIMIT.md`

**Priorité** : 🔴 Critique → ✅ Résolu

---

### 2. **Validation de Token Faible** ✅ RÉSOLU
**Problème** : La fonction `verifyEventToken` ne faisait qu'une vérification de longueur.

**Solution implémentée** :
- ✅ Validation HMAC complète avec `crypto.createHmac`
- ✅ Tokens avec timestamp encodé pour vérification d'expiration
- ✅ Validation de l'âge du token (1 heure par défaut)
- ✅ Vérification du format et de l'intégrité

**Fichiers modifiés** :
- `lib/token-utils.ts` (nouveau)
- `app/api/events/[id]/register/route.ts`

**Priorité** : 🔴 Critique → ✅ Résolu

---

### 3. **Secrets en Dur dans le Code** ✅ RÉSOLU
**Problème** : Secret par défaut `'change-me-in-production'` dans le code.

**Solution implémentée** :
- ✅ Validation stricte de `EVENT_REGISTRATION_SECRET` dans `lib/token-utils.ts`
- ✅ Erreur si le secret n'est pas défini ou utilise la valeur par défaut
- ✅ Vérification de la longueur minimale (32 caractères)
- ✅ Message d'erreur clair pour guider la configuration

**Fichiers modifiés** :
- `lib/token-utils.ts` (nouveau)
- `app/api/events/[id]/register/route.ts`

**Configuration requise** :
```env
EVENT_REGISTRATION_SECRET="votre-secret-super-securise-minimum-32-caracteres"
```

**Priorité** : 🔴 Critique → ✅ Résolu

---

### 4. **Protection XSS dans les Emails**
**Problème** : Les emails HTML ne sont pas échappés (ligne 215 dans `lib/nodemailer.ts`).

**Fichiers concernés** :
- `lib/nodemailer.ts` (ligne 214-215)

**Solution** :
- Utiliser une bibliothèque d'échappement HTML (DOMPurify, sanitize-html)
- Échapper tous les contenus utilisateur dans les emails

**Priorité** : 🟠 Important

---

### 5. **Pas de Rate Limiting sur les Routes Publiques** ✅ RÉSOLU
**Problème** : Routes `/api/contact`, `/api/newsletter`, `/api/testimonials/submit` sans protection.

**Solution implémentée** :
- ✅ Rate limiting ajouté sur `/api/contact` (3 req/15min par IP)
- ✅ Rate limiting ajouté sur `/api/newsletter` (2 req/heure par IP + par email)
- ✅ Rate limiting déjà présent sur `/api/events/[id]/register` (5 req/15min par IP)
- ⚠️ `/api/testimonials/submit` reste à protéger (priorité moindre)

**Fichiers modifiés** :
- `app/api/contact/route.ts`
- `app/api/newsletter/route.ts`

**Priorité** : 🟠 Important → ✅ Résolu (sauf testimonials)

---

### 6. **Logs Contenant des Informations Sensibles**
**Problème** : Beaucoup de `console.log` avec des données potentiellement sensibles.

**Fichiers concernés** :
- 129 occurrences de `console.log/error/warn` dans `app/api/`

**Solution** :
- Utiliser un système de logging structuré (Winston, Pino)
- Filtrer les données sensibles avant logging
- Niveau de log configurable par environnement

**Priorité** : 🟡 Moyen

---

## 🟠 Performance

### 7. **Images Non Optimisées**
**Problème** : `images.unoptimized: true` dans `next.config.mjs` (ligne 7).

**Fichiers concernés** :
- `next.config.mjs`

**Solution** :
- Activer l'optimisation d'images Next.js
- Utiliser `next/image` partout
- Configurer un domaine ImageKit pour les images externes

**Priorité** : 🟠 Important

---

### 8. **TypeScript Build Errors Ignorés**
**Problème** : `ignoreBuildErrors: true` masque les erreurs TypeScript.

**Fichiers concernés** :
- `next.config.mjs` (ligne 4)

**Solution** :
- Corriger toutes les erreurs TypeScript
- Désactiver `ignoreBuildErrors`
- Utiliser `@ts-expect-error` uniquement si nécessaire avec commentaire

**Priorité** : 🟠 Important

---

### 9. **Pas de Mise en Cache des Requêtes API**
**Problème** : Beaucoup de routes API sans cache ou revalidation.

**Solution** :
- Ajouter `revalidate` sur les routes GET publiques
- Utiliser `unstable_cache` de Next.js pour les données statiques
- Implémenter un système de cache Redis pour les données dynamiques

**Priorité** : 🟠 Important

---

### 10. **Requêtes N+1 Potentielles**
**Problème** : Pas de vérification systématique des requêtes N+1.

**Fichiers concernés** :
- Routes API avec relations Prisma

**Solution** :
- Utiliser `include` ou `select` avec relations
- Activer Prisma query logging en développement
- Utiliser Prisma Data Proxy pour le connection pooling

**Priorité** : 🟡 Moyen

---

### 11. **Pas de Pagination sur Certaines Routes**
**Problème** : Certaines routes retournent toutes les données sans pagination.

**Solution** :
- Ajouter pagination sur toutes les routes list
- Limiter par défaut à 50-100 items
- Implémenter cursor-based pagination pour les grandes listes

**Priorité** : 🟡 Moyen

---

## 🟡 Qualité du Code

### 12. **Trop de Console.log en Production**
**Problème** : 129 occurrences de console.log dans le code API.

**Solution** :
- Remplacer par un logger structuré
- Niveau de log configurable (DEBUG, INFO, WARN, ERROR)
- Logger uniquement les erreurs en production

**Priorité** : 🟡 Moyen

---

### 13. **Gestion d'Erreurs Incohérente**
**Problème** : Différentes façons de gérer les erreurs selon les routes.

**Solution** :
- Créer un middleware d'erreur global
- Standardiser les réponses d'erreur
- Utiliser des classes d'erreur personnalisées

**Priorité** : 🟡 Moyen

---

### 14. **Validation Zod Répétitive**
**Problème** : Schémas de validation dupliqués ou similaires.

**Solution** :
- Centraliser les schémas dans `lib/validations/`
- Réutiliser les schémas de base
- Créer des schémas composables

**Priorité** : 🟢 Souhaitable

---

### 15. **Code Commenté "TODO"**
**Problème** : 75 occurrences de TODO/FIXME dans le code.

**Fichiers concernés** :
- Plusieurs fichiers avec des TODO non résolus

**Solution** :
- Créer des issues GitHub pour chaque TODO
- Résoudre ou supprimer les TODO obsolètes
- Utiliser des issues plutôt que des commentaires TODO

**Priorité** : 🟢 Souhaitable

---

### 16. **Gestion d'Erreurs Prisma Générique**
**Problème** : Extension Prisma qui log toutes les erreurs sans distinction.

**Fichiers concernés** :
- `lib/prisma.ts` (ligne 28-35)

**Solution** :
- Gérer différemment les erreurs de validation vs erreurs système
- Ne pas logger les erreurs de validation attendues
- Ajouter des métriques pour les erreurs critiques

**Priorité** : 🟡 Moyen

---

## 🟢 Tests & Documentation

### 17. **Aucun Test**
**Problème** : Aucun fichier de test dans le projet.

**Solution** :
- Ajouter Jest/Vitest pour les tests unitaires
- Ajouter Playwright/Cypress pour les tests E2E
- Tests pour les routes API critiques
- Tests pour les composants critiques

**Priorité** : 🟠 Important

---

### 18. **Documentation API Manquante**
**Problème** : Pas de documentation OpenAPI/Swagger pour les routes API.

**Solution** :
- Générer la documentation avec tRPC ou OpenAPI
- Documenter tous les endpoints
- Ajouter des exemples de requêtes/réponses

**Priorité** : 🟢 Souhaitable

---

### 19. **Types TypeScript Manquants**
**Problème** : Utilisation de `any` dans plusieurs endroits.

**Solution** :
- Créer des types pour toutes les réponses API
- Éviter `any` au maximum
- Utiliser `unknown` si nécessaire

**Priorité** : 🟡 Moyen

---

## 🟡 Configuration & DevOps

### 20. **Variables d'Environnement Non Validées**
**Problème** : Pas de validation des variables d'environnement au démarrage.

**Solution** :
- Utiliser `zod` pour valider les variables d'environnement
- Créer un fichier `lib/env.ts` avec validation
- Faire échouer le démarrage si variables manquantes

**Priorité** : 🟠 Important

---

### 21. **Pas de Monitoring/Alerting**
**Problème** : Pas de système de monitoring des erreurs.

**Solution** :
- Intégrer Sentry pour le tracking d'erreurs
- Ajouter des métriques avec Vercel Analytics
- Alertes pour les erreurs critiques

**Priorité** : 🟠 Important

---

### 22. **Pas de CI/CD**
**Problème** : Pas de pipeline CI/CD visible.

**Solution** :
- Ajouter GitHub Actions pour :
  - Tests automatiques
  - Linting
  - Build
  - Déploiement automatique

**Priorité** : 🟡 Moyen

---

### 23. **Pas de Health Check Endpoint**
**Problème** : Pas d'endpoint pour vérifier la santé de l'application.

**Solution** :
- Créer `/api/health` avec vérification DB
- Utilisé par Vercel/load balancer
- Retourner le statut de la DB et des services externes

**Priorité** : 🟢 Souhaitable

---

## 📊 Résumé par Priorité

### 🔴 Critique (À faire immédiatement)
1. Rate limiting avec Redis
2. Validation de token sécurisée
3. Secrets en variables d'environnement

### 🟠 Important (À faire bientôt)
4. Protection XSS emails
5. Rate limiting routes publiques
6. Optimisation images
7. Corriger erreurs TypeScript
8. Cache des requêtes API
9. Tests unitaires/E2E
10. Validation variables d'environnement
11. Monitoring/Alerting

### 🟡 Moyen (À planifier)
12. Logger structuré
13. Gestion d'erreurs standardisée
14. Requêtes N+1
15. Pagination complète
16. Types TypeScript complets
17. CI/CD pipeline

### 🟢 Souhaitable (Nice to have)
18. Documentation API
19. Centralisation schémas validation
20. Nettoyage TODO
21. Health check endpoint

---

## 🎯 Plan d'Action Recommandé

### Phase 1 - Sécurité (Semaine 1-2)
1. Implémenter Redis pour rate limiting
2. Corriger validation tokens
3. Ajouter rate limiting sur routes publiques
4. Protection XSS emails

### Phase 2 - Performance (Semaine 3-4)
5. Optimiser images Next.js
6. Corriger erreurs TypeScript
7. Ajouter cache sur routes API
8. Vérifier requêtes N+1

### Phase 3 - Qualité (Semaine 5-6)
9. Logger structuré
10. Gestion d'erreurs standardisée
11. Tests critiques
12. Validation variables d'environnement

### Phase 4 - Amélioration Continue
13. Monitoring
14. CI/CD
15. Documentation
16. Nettoyage code

---

## 📝 Notes

- Les priorités sont indicatives et peuvent varier selon les besoins métier
- Certaines améliorations peuvent être faites en parallèle
- Tester chaque amélioration avant de passer à la suivante
- Documenter les changements dans le CHANGELOG

