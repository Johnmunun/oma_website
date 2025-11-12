# Guide de Configuration GitHub

## 📋 Étapes pour uploader votre projet sur GitHub

### 1. Créer un nouveau dépôt sur GitHub

1. Allez sur [GitHub.com](https://github.com) et connectez-vous
2. Cliquez sur le bouton **"+"** en haut à droite, puis sélectionnez **"New repository"**
3. Remplissez les informations :
   - **Repository name** : `reseau-oma` (ou le nom de votre choix)
   - **Description** : "Site web professionnel pour le Réseau OMA"
   - **Visibility** : Choisissez **Private** (recommandé) ou **Public**
   - ⚠️ **NE COCHEZ PAS** "Initialize this repository with a README" (on a déjà un README)
   - ⚠️ **NE COCHEZ PAS** "Add .gitignore" (on en a déjà un)
4. Cliquez sur **"Create repository"**

### 2. Connecter votre dépôt local à GitHub

Après avoir créé le dépôt, GitHub vous affichera des instructions. Utilisez la commande suivante (remplacez `VOTRE_USERNAME` par votre nom d'utilisateur GitHub) :

```bash
git remote add origin https://github.com/VOTRE_USERNAME/reseau-oma.git
```

### 3. Renommer la branche principale (optionnel mais recommandé)

GitHub utilise maintenant `main` comme nom de branche par défaut :

```bash
git branch -M main
```

### 4. Pousser le code vers GitHub

```bash
git push -u origin main
```

Vous serez peut-être invité à vous authentifier. Utilisez un **Personal Access Token** (PAT) au lieu de votre mot de passe.

### 5. Créer un Personal Access Token (si nécessaire)

Si GitHub vous demande une authentification :

1. Allez sur GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Cliquez sur **"Generate new token (classic)"**
3. Donnez un nom au token (ex: "Réseau OMA Local")
4. Sélectionnez les scopes : **repo** (toutes les permissions)
5. Cliquez sur **"Generate token"**
6. **Copiez le token** (vous ne pourrez plus le voir après)
7. Utilisez ce token comme mot de passe lors du `git push`

---

## 🔐 Sécurité - Fichiers à ne JAMAIS commiter

✅ **Déjà protégés par `.gitignore`** :
- `.env*` (tous les fichiers d'environnement)
- `node_modules/`
- `.next/`
- `/prisma/migrations` (les migrations sont déjà dans le dépôt, mais les fichiers générés ne le sont pas)

⚠️ **Vérifiez que ces fichiers ne sont PAS dans votre commit** :
```bash
git log --all --full-history -- .env
```

Si cette commande ne retourne rien, c'est bon ! ✅

---

## 📝 Commandes Git utiles

```bash
# Voir l'état du dépôt
git status

# Voir l'historique des commits
git log --oneline

# Ajouter des fichiers modifiés
git add .

# Créer un commit
git commit -m "Description des changements"

# Pousser vers GitHub
git push

# Récupérer les changements depuis GitHub
git pull
```

---

## 🚀 Prochaines étapes après l'upload

1. **Configurer les secrets sur GitHub** (si vous déployez avec GitHub Actions) :
   - Allez dans votre dépôt → **Settings** → **Secrets and variables** → **Actions**
   - Ajoutez toutes vos variables d'environnement

2. **Créer un fichier `.env.example`** pour documenter les variables nécessaires :
   ```env
   DATABASE_URL=
   NEXTAUTH_URL=
   NEXTAUTH_SECRET=
   IMAGEKIT_PUBLIC_KEY=
   IMAGEKIT_PRIVATE_KEY=
   IMAGEKIT_URL_ENDPOINT=
   SMTP_HOST=
   SMTP_PORT=
   SMTP_USER=
   SMTP_PASS=
   ```

3. **Ajouter une branche de développement** (optionnel) :
   ```bash
   git checkout -b develop
   git push -u origin develop
   ```

---

## ✅ Vérification finale

Après avoir poussé votre code, vérifiez sur GitHub que :
- ✅ Tous les fichiers sont présents
- ✅ Le README.md s'affiche correctement
- ✅ Aucun fichier `.env` n'est visible
- ✅ Le `.gitignore` est présent

---

**Besoin d'aide ?** Consultez la [documentation GitHub](https://docs.github.com/en/get-started)

