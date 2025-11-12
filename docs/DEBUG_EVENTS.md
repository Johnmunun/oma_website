# 🔍 Debug - Événements ne s'affichent pas

## Problèmes possibles

### 1. Aucun événement dans la base de données
Vérifiez avec Prisma Studio :
```bash
pnpm prisma:studio
```
Allez dans la table `Event` et vérifiez :
- ✅ Des événements existent
- ✅ Le statut est `PUBLISHED` (pas `DRAFT`)
- ✅ La date `startsAt` est dans le futur (pour les événements à venir)
- ✅ Le champ `showOnBanner` est `true` (pour la bannière)

### 2. Le champ `showOnBanner` n'existe pas dans la DB
Si vous voyez une erreur dans la console concernant `showOnBanner`, exécutez :
```bash
npx prisma migrate dev --name add_show_on_banner_to_event
npx prisma generate
```

### 3. Cache Next.js
Le cache peut masquer les nouveaux événements. Pour tester :
1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet Network
3. Cochez "Disable cache"
4. Rechargez la page

Ou videz le cache Next.js :
```bash
rm -rf .next
pnpm dev
```

### 4. Vérifier les logs
Ouvrez la console du navigateur (F12) et regardez les logs :
- `[EventsSection]` - pour la section événements
- `[ScrollingEventsBanner]` - pour la bannière
- `[API Events]` - pour les requêtes API (côté serveur)

### 5. Vérifier les requêtes API
Testez directement les endpoints :
- `http://localhost:3000/api/events?upcoming=true&limit=20`
- `http://localhost:3000/api/events?upcoming=true&limit=10&bannerOnly=true`

Vous devriez voir une réponse JSON avec `success: true` et un tableau `data`.

## Solutions

### Créer un événement de test
1. Allez dans `/admin/events`
2. Cliquez sur "Nouvel événement"
3. Remplissez :
   - **Titre** : "Test Événement"
   - **Date de début** : Une date future
   - **Statut** : `PUBLISHED` (important !)
   - **Afficher dans la bannière** : Cochez si vous voulez qu'il apparaisse dans la bannière
4. Sauvegardez

### Vérifier le statut des événements
Dans Prisma Studio, vérifiez que vos événements ont :
```sql
status = 'PUBLISHED'
startsAt > NOW() -- pour les événements à venir
showOnBanner = true -- pour la bannière
```

### Forcer le rechargement
Si les événements existent mais ne s'affichent pas :
1. Vérifiez que le cache est désactivé dans les DevTools
2. Rechargez la page avec Ctrl+Shift+R (hard refresh)
3. Vérifiez les logs dans la console

