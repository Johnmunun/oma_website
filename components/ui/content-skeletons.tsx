/**
 * @file components/ui/content-skeletons.tsx
 * @description Composants Skeleton réutilisables pour les sections de contenu public
 * Améliore le feedback visuel pendant le chargement des données
 */

import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

/**
 * Skeleton pour une carte d'événement
 */
export function EventCardSkeleton() {
  return (
    <Card className="rounded-2xl overflow-hidden shadow-md animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-56 bg-muted rounded-t-2xl" />
      
      {/* Contenu skeleton */}
      <div className="p-6 space-y-4">
        {/* Titre */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        
        {/* Informations */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        
        {/* Bouton skeleton */}
        <div className="pt-4 border-t border-border/50 mt-auto">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton pour une grille d'événements
 */
export function EventsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  )
}

/**
 * Skeleton pour une carte de membre d'équipe
 */
export function TeamCardSkeleton() {
  return (
    <div className="text-center animate-pulse">
      {/* Photo skeleton */}
      <div className="relative inline-block mb-6">
        <Skeleton className="w-64 h-64 rounded-lg mx-auto" />
        <Skeleton className="absolute -bottom-4 -right-4 w-24 h-24 rounded-lg -z-10" />
      </div>
      
      {/* Nom et rôle */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-6 w-32 mx-auto" />
      </div>
      
      {/* Bio */}
      <div className="space-y-2 max-w-md mx-auto">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </div>
      
      {/* Réseaux sociaux skeleton */}
      <div className="flex items-center justify-center gap-3 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-5 rounded" />
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton pour une grille d'équipe
 */
export function TeamGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={`grid gap-12 max-w-5xl mx-auto ${
      count === 1 
        ? 'grid-cols-1 md:grid-cols-1' 
        : count === 2 
        ? 'grid-cols-1 md:grid-cols-2' 
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }`}>
      {Array.from({ length: count }).map((_, index) => (
        <TeamCardSkeleton key={index} />
      ))}
    </div>
  )
}

/**
 * Skeleton pour une carte de témoignage
 */
export function TestimonialCardSkeleton() {
  return (
    <Card className="rounded-lg p-8 md:p-12 shadow-xl border border-border animate-pulse">
      {/* Étoiles skeleton */}
      <div className="flex justify-center gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-6 rounded" />
        ))}
      </div>
      
      {/* Citation skeleton */}
      <div className="space-y-3 mb-8">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6 mx-auto" />
        <Skeleton className="h-5 w-4/6 mx-auto" />
      </div>
      
      {/* Auteur skeleton */}
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton pour les dots de pagination
 */
export function TestimonialDotsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex justify-center gap-2 mt-8">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-3 w-3 rounded-full" />
      ))}
    </div>
  )
}

