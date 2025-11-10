/**
 * @file components/admin/page-skeleton.tsx
 * @description Composant skeleton réutilisable pour les pages admin
 * Affiche un écran de chargement animé pendant le chargement des données
 */

"use client"

import { Card } from "@/components/ui/card"

/**
 * Skeleton pour une carte de statistique
 */
export function StatCardSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 bg-muted rounded mb-2" />
          <div className="h-8 w-16 bg-muted rounded mt-2" />
          <div className="h-3 w-32 bg-muted rounded mt-2" />
        </div>
        <div className="ml-4 w-12 h-12 bg-muted rounded-lg" />
      </div>
    </Card>
  )
}

/**
 * Skeleton pour une ligne de tableau
 */
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-muted rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

/**
 * Skeleton pour une carte d'événement/élément de liste
 */
export function ListItemSkeleton() {
  return (
    <Card className="p-4 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4">
          <div className="h-5 w-3/4 bg-muted rounded mb-2" />
          <div className="h-4 w-full bg-muted rounded" />
        </div>
        <div className="md:col-span-2">
          <div className="h-4 w-24 bg-muted rounded mb-2" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
        <div className="md:col-span-3">
          <div className="h-4 w-20 bg-muted rounded mb-2" />
          <div className="h-6 w-16 bg-muted rounded" />
        </div>
        <div className="md:col-span-3 flex gap-2">
          <div className="h-8 w-20 bg-muted rounded" />
          <div className="h-8 w-20 bg-muted rounded" />
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton pour une grille de cartes (équipe, médias, partenaires)
 */
export function GridCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden animate-pulse">
          <div className="aspect-square bg-muted" />
          <div className="p-4">
            <div className="h-5 w-3/4 bg-muted rounded mb-2" />
            <div className="h-4 w-1/2 bg-muted rounded mb-4" />
            <div className="h-8 w-full bg-muted rounded" />
          </div>
        </Card>
      ))}
    </>
  )
}

/**
 * Skeleton pour un graphique
 */
export function ChartSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="h-6 w-48 bg-muted rounded mb-4" />
      <div className="h-64 bg-muted rounded" />
    </Card>
  )
}

/**
 * Skeleton complet pour une page admin standard
 * Utilisé pendant le chargement initial des données
 */
export function PageSkeleton({
  type = "default",
  showHeader = true,
  showFilters = false,
}: {
  type?: "default" | "dashboard" | "table" | "grid" | "analytics"
  showHeader?: boolean
  showFilters?: boolean
}) {
  return (
    <div className="space-y-6">
      {/* En-tête skeleton */}
      {showHeader && (
        <div className="flex items-center justify-between animate-pulse">
          <div>
            <div className="h-8 w-64 bg-muted rounded mb-2" />
            <div className="h-4 w-96 bg-muted rounded" />
          </div>
          <div className="h-10 w-32 bg-muted rounded" />
        </div>
      )}

      {/* Filtres skeleton */}
      {showFilters && (
        <Card className="p-4 animate-pulse">
          <div className="h-10 w-full bg-muted rounded" />
        </Card>
      )}

      {/* Contenu selon le type */}
      {type === "dashboard" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                <div className="h-4 w-full bg-muted rounded" />
              </Card>
            ))}
          </div>
        </>
      )}

      {type === "table" && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                {Array.from({ length: 5 }).map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={5} />
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {type === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <GridCardSkeleton count={6} />
        </div>
      )}

      {type === "analytics" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </>
      )}

      {type === "default" && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  )
}


