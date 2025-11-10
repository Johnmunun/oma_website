# 🔧 Fix : Erreur "Invalid URL" NextAuth

## Problème
L'erreur `Invalid URL` dans NextAuth indique que `NEXTAUTH_URL` n'est pas correctement configuré.

## Solution

### 1. Vérifier le fichier `.env`

Assurez-vous d'avoir ces variables :

```env
NEXTAUTH_SECRET="votre-secret-ici-minimum-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
```

**Important** :
- En développement : `NEXTAUTH_URL="http://localhost:3000"`
- En production : `NEXTAUTH_URL="https://votre-domaine.com"`

### 2. Générer NEXTAUTH_SECRET

```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Unix/Mac
openssl rand -base64 32
```

### 3. Redémarrer le serveur

Après avoir modifié `.env`, **redémarrer complètement** le serveur :

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
pnpm dev
```

### 4. Vérifier dans les logs

Au démarrage, vous devriez voir :
- ✅ Pas d'avertissement sur `NEXTAUTH_SECRET`
- ✅ Pas d'avertissement sur `NEXTAUTH_URL`

Si vous voyez des avertissements, vérifiez votre `.env`.

## Si le problème persiste

1. Vérifier que le fichier `.env` est à la racine du projet
2. Vérifier qu'il n'y a pas d'espaces autour des valeurs : `NEXTAUTH_URL="http://localhost:3000"` (pas d'espaces)
3. Vérifier que le port correspond à celui utilisé par Next.js (par défaut 3000)
4. Nettoyer le cache : `rm -rf .next` puis `pnpm dev`

