# 🎨 Guide du Thème CRM pour les Pages Admin

Ce guide explique comment utiliser le thème CRM violet/blanc pour toutes les pages admin.

## 📋 Composants Réutilisables

### 1. `AdminPageHeader`
En-tête standardisé pour toutes les pages admin.

```tsx
import { AdminPageHeader } from "@/components/admin/admin-page-header"

<AdminPageHeader
  title="Titre de la page"
  description="Description optionnelle"
  action={{
    label: "Action",
    onClick: handleAction,
    icon: <Icon className="w-4 h-4" />,
  }}
/>
```

### 2. `AdminStatCard`
Carte de statistique avec gradient violet.

```tsx
import { AdminStatCard } from "@/components/admin/admin-stat-card"

<AdminStatCard
  label="Label"
  value={123}
  subtitle="Sous-titre optionnel"
  icon={Icon}
  href="/admin/page"
  trend={{ value: "+10", isPositive: true }}
/>
```

## 🎨 Classes CSS Utilitaires

### Gradients
- `gradient-purple` - Gradient violet moyen
- `gradient-purple-dark` - Gradient violet foncé
- `gradient-purple-light` - Gradient violet clair

### Ombres
- `shadow-soft` - Ombre douce standard
- `shadow-soft-lg` - Ombre douce grande

### Exemple d'utilisation
```tsx
<Card className="border-0 shadow-soft bg-white">
  {/* Contenu */}
</Card>

<Button className="gradient-purple text-white border-0">
  Bouton
</Button>
```

## 📝 Structure Standard d'une Page Admin

```tsx
"use client"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* En-tête */}
      <AdminPageHeader
        title="Titre de la page"
        description="Description"
        action={{
          label: "Action",
          onClick: handleAction,
          icon: <Icon className="w-4 h-4" />,
        }}
      />

      {/* Contenu principal */}
      <Card className="border-0 shadow-soft bg-white">
        <CardHeader>
          <CardTitle className="text-foreground">Titre de section</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Contenu */}
        </CardContent>
      </Card>
    </div>
  )
}
```

## 🎯 Règles de Design

1. **Cartes** : Toujours utiliser `border-0 shadow-soft bg-white`
2. **Boutons principaux** : Utiliser `gradient-purple text-white border-0`
3. **Boutons secondaires** : Utiliser `variant="outline"`
4. **Badges actifs** : Utiliser `gradient-purple text-white`
5. **Icônes dans badges** : Utiliser `gradient-purple-light` avec icône blanche

## 🔄 Migration d'une Page Existante

1. Importer `AdminPageHeader`
2. Remplacer l'en-tête par `<AdminPageHeader />`
3. Ajouter `border-0 shadow-soft bg-white` aux `Card`
4. Remplacer les boutons principaux par `gradient-purple`
5. Utiliser `AdminStatCard` pour les statistiques

## ✅ Checklist

- [ ] En-tête avec `AdminPageHeader`
- [ ] Cartes avec `border-0 shadow-soft bg-white`
- [ ] Boutons principaux avec `gradient-purple`
- [ ] Badges actifs avec `gradient-purple`
- [ ] Statistiques avec `AdminStatCard`
- [ ] Ombres douces (`shadow-soft` ou `shadow-soft-lg`)
- [ ] Coins arrondis (`rounded-xl`)





