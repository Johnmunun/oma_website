# Guide d'utilisation d'Embla Carousel

## Installation

Le package `embla-carousel-react` est déjà installé dans le projet. Aucune installation supplémentaire n'est nécessaire.

## Composant EmblaCarousel

Le composant `EmblaCarousel` est un composant réutilisable situé dans `components/ui/embla-carousel.tsx`.

### Caractéristiques

- ✅ **SSR-safe** : Compatible avec Next.js App Router, évite les erreurs d'hydratation
- ✅ **Responsive** : Carousel sur mobile, grille/liste sur desktop
- ✅ **Accessible** : Navigation au clavier, rôles ARIA, pagination accessible
- ✅ **Performance** : Lazy-loading des images, petit bundle
- ✅ **TypeScript** : Typé avec TypeScript
- ✅ **Tailwind CSS** : Entièrement stylable avec Tailwind

### Utilisation de base

```tsx
import { EmblaCarousel } from "@/components/ui/embla-carousel"

function MyComponent() {
  const slides = [
    <div key="1">Slide 1</div>,
    <div key="2">Slide 2</div>,
    <div key="3">Slide 3</div>,
  ]

  return (
    <EmblaCarousel breakpoint="md">
      {slides}
    </EmblaCarousel>
  )
}
```

### Utilisation avec vue desktop personnalisée

```tsx
import { EmblaCarousel } from "@/components/ui/embla-carousel"

function MyComponent() {
  const slides = [
    <div key="1">Slide 1</div>,
    <div key="2">Slide 2</div>,
  ]

  // Vue desktop (grille)
  const desktopView = (
    <div className="grid md:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.id}>{item.content}</div>
      ))}
    </div>
  )

  return (
    <EmblaCarousel
      breakpoint="md"
      desktopView={desktopView}
      slideClassName="w-[85%]"
    >
      {slides}
    </EmblaCarousel>
  )
}
```

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `children` | `ReactNode[]` | **requis** | Tableau d'éléments React à afficher dans le carousel |
| `options` | `EmblaOptionsType` | `{}` | Options Embla Carousel (align, loop, etc.) |
| `className` | `string` | `undefined` | Classes CSS supplémentaires pour le container |
| `slideClassName` | `string` | `undefined` | Classes CSS pour chaque slide |
| `showDots` | `boolean` | `true` | Afficher les dots de pagination |
| `showArrows` | `boolean` | `true` | Afficher les flèches de navigation |
| `breakpoint` | `"sm" \| "md" \| "lg"` | `"md"` | Breakpoint pour passer en grille sur desktop |
| `desktopView` | `ReactNode` | `undefined` | Contenu à afficher sur desktop (grille/liste) |

### Options Embla disponibles

```tsx
<EmblaCarousel
  options={{
    align: "start" | "center" | "end",
    loop: boolean,
    skipSnaps: boolean,
    dragFree: boolean,
    // ... autres options Embla
  }}
>
  {slides}
</EmblaCarousel>
```

### Breakpoints

- `sm`: 640px
- `md`: 768px (défaut)
- `lg`: 1024px

### Accessibilité

Le composant inclut :
- Rôles ARIA appropriés (`region`, `group`, `tablist`, `tab`)
- Labels ARIA pour la navigation
- Navigation au clavier (flèches)
- Support des lecteurs d'écran

### Exemples d'utilisation dans le projet

#### 1. Section Partenaires
```tsx
// components/partners-section.tsx
<EmblaCarousel
  breakpoint="md"
  desktopView={desktopView}
  slideClassName="w-[85%] sm:w-[70%]"
>
  {slides}
</EmblaCarousel>
```

#### 2. Section Équipe
```tsx
// components/team-section.tsx
<EmblaCarousel
  breakpoint="md"
  desktopView={desktopView}
  slideClassName="w-[90%] sm:w-[80%]"
  options={{ align: "center" }}
>
  {slides}
</EmblaCarousel>
```

#### 3. Section OMA TV
```tsx
// components/oma-tv-section.tsx
<EmblaCarousel
  breakpoint="md"
  desktopView={desktopView}
  slideClassName="w-[85%] sm:w-[70%]"
>
  {slides}
</EmblaCarousel>
```

#### 4. Section About
```tsx
// components/about-section.tsx
<EmblaCarousel
  breakpoint="md"
  desktopView={desktopView}
  slideClassName="w-[80%] sm:w-[60%]"
  options={{ align: "center" }}
>
  {slides}
</EmblaCarousel>
```

### Bonnes pratiques

1. **Lazy-loading des images** : Utilisez `loading="lazy"` sur les images
2. **Largeur des slides** : Ajustez `slideClassName` selon vos besoins (ex: `w-[85%]`)
3. **Breakpoint** : Choisissez le bon breakpoint selon votre design
4. **Desktop view** : Fournissez toujours une `desktopView` pour une meilleure UX

### Personnalisation avec Tailwind

Le composant utilise Tailwind CSS et peut être personnalisé via les props `className` et `slideClassName` :

```tsx
<EmblaCarousel
  className="my-custom-container"
  slideClassName="my-custom-slide"
>
  {slides}
</EmblaCarousel>
```

### Dépannage

**Erreur d'hydratation** : Le composant gère automatiquement l'hydratation avec un état `isMounted`.

**Carousel ne s'affiche pas** : Vérifiez que vous passez un tableau d'éléments React dans `children`.

**Desktop view ne s'affiche pas** : Assurez-vous que la largeur de l'écran dépasse le breakpoint configuré.




