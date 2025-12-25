# 🔧 Fix : Erreur NEXTAUTH_URL

## Problème

L'erreur `"NEXTAUTH_URL n'est pas correctement configuré"` survient lorsque NextAuth ne peut pas déterminer l'URL de base de l'application.

## ✅ Solution Automatique Implémentée

Le code a été amélioré pour **détecter automatiquement** l'URL depuis :
1. Les headers de la requête (`host`, `x-forwarded-proto`)
2. La variable d'environnement `NEXTAUTH_URL`
3. La variable d'environnement `AUTH_URL` (alias)
4. La variable `VERCEL_URL` (si déployé sur Vercel)
5. Fallback vers `http://localhost:3000` en développement

## 📝 Configuration Recommandée

### Option 1 : Ajouter dans `.env` (Recommandé)

Créez ou modifiez votre fichier `.env` à la racine du projet :

```env
# En développement
NEXTAUTH_URL="http://localhost:3000"

# En production (remplacer par votre domaine)
NEXTAUTH_URL="https://votre-domaine.com"
```

### Option 2 : Laisser la détection automatique

Le système détecte maintenant automatiquement l'URL depuis les headers HTTP. Si vous êtes sur Vercel, il utilisera automatiquement `VERCEL_URL`.

## 🔍 Vérification

### 1. Vérifier que la variable est définie

```bash
# Windows PowerShell
echo $env:NEXTAUTH_URL

# Unix/Mac
echo $NEXTAUTH_URL
```

### 2. Vérifier dans les logs

Au démarrage du serveur, vous devriez voir dans les logs :

```
[NextAuth] Configuration: {
  hasSecret: true,
  url: 'http://localhost:3000',  // ou votre URL
  trustHost: true,
  nodeEnv: 'development'
}
```

### 3. Si vous voyez un avertissement

Si vous voyez :
```
[NextAuth] NEXTAUTH_URL non défini, utilisation de http://localhost:3000 par défaut
```

C'est normal en développement. Le système utilise automatiquement `http://localhost:3000`.

## 🚀 Sur Vercel

Sur Vercel, vous devez ajouter la variable d'environnement :

1. Allez dans votre projet Vercel
2. Settings → Environment Variables
3. Ajoutez :
   - **Name** : `NEXTAUTH_URL`
   - **Value** : `https://votre-domaine.vercel.app` (ou votre domaine personnalisé)
   - **Environments** : Production, Preview, Development

**Note** : Vercel définit automatiquement `VERCEL_URL`, donc la détection automatique devrait fonctionner même sans `NEXTAUTH_URL`.

## 🐛 Dépannage

### Erreur persiste après ajout de NEXTAUTH_URL

1. **Redémarrer le serveur** :
   ```bash
   # Arrêter (Ctrl+C)
   # Puis redémarrer
   npm run dev
   ```

2. **Vérifier le format** :
   ```env
   # ✅ Correct
   NEXTAUTH_URL="http://localhost:3000"
   
   # ❌ Incorrect (pas d'espaces, pas de guillemets manquants)
   NEXTAUTH_URL = http://localhost:3000
   NEXTAUTH_URL=http://localhost:3000  # OK aussi
   ```

3. **Nettoyer le cache** :
   ```bash
   rm -rf .next
   npm run dev
   ```

### L'URL détectée est incorrecte

Le système affiche maintenant l'URL détectée dans le message d'erreur. Utilisez cette URL dans votre `.env` :

```env
NEXTAUTH_URL="<l'url-détectée-dans-le-message-d'erreur>"
```

## 📚 Variables d'Environnement Disponibles

Le système accepte plusieurs variables (par ordre de priorité) :

1. `NEXTAUTH_URL` (priorité la plus haute)
2. `AUTH_URL` (alias)
3. `VERCEL_URL` (automatique sur Vercel)
4. Détection depuis headers HTTP
5. `http://localhost:3000` (fallback développement)

## ✅ Après Correction

Une fois corrigé, vous devriez voir :
- ✅ Pas d'erreur dans les logs
- ✅ L'authentification fonctionne
- ✅ Les sessions sont créées correctement

## 📝 Fichier .env.example

Un fichier `.env.example` a été créé avec toutes les variables nécessaires. Copiez-le vers `.env` et remplissez les valeurs :

```bash
# Windows
copy .env.example .env

# Unix/Mac
cp .env.example .env
```
