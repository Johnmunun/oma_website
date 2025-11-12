# Système d'animations

Ce document décrit le système d'animations implémenté pour le site Réseau OMA, incluant les animations d'entrée, les animations on-scroll et les transitions entre pages.

## 📋 Table des matières

- [Composants disponibles](#composants-disponibles)
- [Animations d'entrée (Entrance Animations)](#animations-dentrée-entrance-animations)
- [Animations on-scroll](#animations-on-scroll)
- [Transitions de page](#transitions-de-page)
- [Styles CSS personnalisés](#styles-css-personnalisés)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Performance et accessibilité](#performance-et-accessibilité)

## Composants disponibles

### 1. `EntranceAnimation`

Composant pour les animations d'entrée immédiate (sans scroll). L'animation se déclenche dès le montage du composant.

**Props :**
- `children`: ReactNode - Le contenu à animer
- `animation`: `'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'rotate'` (défaut: `'fade-up'`)
- `delay`: `number` - Délai en millisecondes avant l'animation (défaut: `0`)
- `className`: `string` - Classes CSS supplémentaires

**Exemple :**
```tsx
import { EntranceAnimation } from "@/components/animations/entrance-animation"

<EntranceAnimation animation="fade-down" delay={200}>
  <h1>Mon titre</h1>
</EntranceAnimation>
```

### 2. `AnimateOnScroll`

Composant pour animer les éléments lorsqu'ils entrent dans le viewport. Utilise Intersection Observer pour détecter la visibilité.

**Props :**
- `children`: ReactNode - Le contenu à animer
- `animation`: `'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'fade'` (défaut: `'fade-up'`)
- `delay`: `number` - Délai en millisecondes avant l'animation (défaut: `0`)
- `threshold`: `number` - Seuil de visibilité (0-1, défaut: `0.1`)
- `className`: `string` - Classes CSS supplémentaires
- `once`: `boolean` - Si true, l'animation ne se déclenche qu'une fois (défaut: `true`)

**Exemple :**
```tsx
import { AnimateOnScroll } from "@/components/animations/animate-on-scroll"

<AnimateOnScroll animation="fade-up" delay={100}>
  <div>Contenu qui apparaît au scroll</div>
</AnimateOnScroll>
```

### 3. `PageTransition`

Composant pour gérer les transitions entre les pages. Détecte automatiquement les changements de route.

**Props :**
- `children`: ReactNode - Le contenu de la page
- `transitionType`: `'fade' | 'slide'` (défaut: `'fade'`)

**Exemple :**
```tsx
import { PageTransition } from "@/components/animations/page-transition"

// Dans app/layout.tsx
<PageTransition transitionType="fade">
  {children}
</PageTransition>
```

## Animations d'entrée (Entrance Animations)

Les animations d'entrée sont utilisées pour les éléments qui doivent apparaître immédiatement au chargement de la page, comme le hero section.

### Types d'animations disponibles :

1. **fade-up** : Fade in + translation vers le haut
2. **fade-down** : Fade in + translation vers le bas
3. **fade-left** : Fade in + translation vers la gauche
4. **fade-right** : Fade in + translation vers la droite
5. **scale** : Zoom in (scale)
6. **rotate** : Rotation + scale

### Utilisation dans HeroSection :

```tsx
<EntranceAnimation animation="fade-down" delay={200}>
  <h1>Titre principal</h1>
</EntranceAnimation>

<EntranceAnimation animation="fade-up" delay={400}>
  <p>Sous-titre</p>
</EntranceAnimation>

<EntranceAnimation animation="scale" delay={600}>
  <Button>Action</Button>
</EntranceAnimation>
```

## Animations on-scroll

Les animations on-scroll sont utilisées pour les sections qui apparaissent progressivement lors du défilement.

### Utilisation dans les sections :

```tsx
// Section About
<AnimateOnScroll animation="fade-up" delay={100}>
  <div className="text-center">
    <h2>Titre de section</h2>
  </div>
</AnimateOnScroll>

// Grille avec délais progressifs
<div className="grid md:grid-cols-3 gap-8">
  {items.map((item, index) => (
    <AnimateOnScroll key={index} animation="fade-up" delay={index * 100}>
      <Card>{item.content}</Card>
    </AnimateOnScroll>
  ))}
</div>
```

## Transitions de page

Les transitions de page sont gérées automatiquement dans `app/layout.tsx`. Elles se déclenchent lors des changements de route.

### Configuration actuelle :

```tsx
// app/layout.tsx
<PageTransition transitionType="fade">
  {children}
</PageTransition>
```

### Types de transitions :

- **fade** : Fondu (fade in/out)
- **slide** : Glissement latéral

## Styles CSS personnalisés

Toutes les animations sont définies dans `app/globals.css` avec les classes suivantes :

### Classes d'animation d'entrée :
- `.animate-entrance-fade-up`
- `.animate-entrance-fade-down`
- `.animate-entrance-fade-left`
- `.animate-entrance-fade-right`
- `.animate-entrance-scale`
- `.animate-entrance-rotate`

### Classes d'animation on-scroll :
- `.animate-on-scroll-fade-up`
- `.animate-on-scroll-fade-down`
- `.animate-on-scroll-fade-left`
- `.animate-on-scroll-fade-right`
- `.animate-on-scroll-scale`

### Classes de transition de page :
- `.page-transition-enter`
- `.page-transition-slide`

## Exemples d'utilisation

### Exemple 1 : Section avec titre et contenu animés

```tsx
<section className="py-24">
  <AnimateOnScroll animation="fade-up" delay={100}>
    <div className="text-center mb-16">
      <h2>Titre de section</h2>
      <p>Description</p>
    </div>
  </AnimateOnScroll>

  <AnimateOnScroll animation="fade-up" delay={200}>
    <div className="grid md:grid-cols-3 gap-8">
      {items.map((item, index) => (
        <AnimateOnScroll key={index} animation="scale" delay={300 + index * 100}>
          <Card>{item.content}</Card>
        </AnimateOnScroll>
      ))}
    </div>
  </AnimateOnScroll>
</section>
```

### Exemple 2 : Hero section avec animations séquentielles

```tsx
<section className="hero">
  <EntranceAnimation animation="fade-down" delay={200}>
    <h1>Titre principal</h1>
  </EntranceAnimation>
  
  <EntranceAnimation animation="fade-up" delay={400}>
    <p>Sous-titre</p>
  </EntranceAnimation>
  
  <EntranceAnimation animation="scale" delay={600}>
    <Button>Action</Button>
  </EntranceAnimation>
</section>
```

## Performance et accessibilité

### Optimisations :

1. **Intersection Observer** : Utilisé pour les animations on-scroll (performant, natif)
2. **CSS Animations** : Utilisation d'animations CSS pures (GPU-accelerated)
3. **Lazy loading** : Les animations ne se déclenchent que lorsque nécessaire
4. **Reduced motion** : Respect de `prefers-reduced-motion` pour les utilisateurs sensibles aux animations

### Accessibilité :

Le système respecte automatiquement la préférence `prefers-reduced-motion` :

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Bonnes pratiques :

1. **Utiliser `EntranceAnimation`** pour les éléments critiques (hero, navigation)
2. **Utiliser `AnimateOnScroll`** pour les sections de contenu
3. **Éviter les délais trop longs** (max 600ms pour les entrance, 300ms pour on-scroll)
4. **Tester sur mobile** pour s'assurer que les animations ne ralentissent pas l'expérience
5. **Respecter `prefers-reduced-motion`** pour l'accessibilité

## Sections animées actuellement

Les sections suivantes utilisent déjà les animations :

- ✅ **HeroSection** : Animations d'entrée (fade-down, fade-up, scale)
- ✅ **AboutSection** : Animations on-scroll (fade-up)
- ✅ **DomainsSection** : Animations on-scroll avec délais progressifs
- ✅ **EventsSection** : Animations on-scroll pour les cartes d'événements
- ✅ **PageTransition** : Transitions entre pages (fade)

## Ajouter des animations à une nouvelle section

1. Importer le composant :
```tsx
import { AnimateOnScroll } from "@/components/animations/animate-on-scroll"
```

2. Envelopper le contenu :
```tsx
<AnimateOnScroll animation="fade-up" delay={100}>
  <div>Votre contenu</div>
</AnimateOnScroll>
```

3. Pour les grilles/listes, utiliser des délais progressifs :
```tsx
{items.map((item, index) => (
  <AnimateOnScroll key={index} animation="fade-up" delay={index * 100}>
    <Card>{item}</Card>
  </AnimateOnScroll>
))}
```

## Notes techniques

- Les animations utilisent `transform` et `opacity` pour de meilleures performances
- Intersection Observer est utilisé avec un `threshold` de 0.1 par défaut
- Les animations sont désactivées automatiquement si `prefers-reduced-motion` est activé
- Toutes les animations sont définies en CSS pour de meilleures performances


