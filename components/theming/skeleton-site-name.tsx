/**
 * @file components/theming/skeleton-site-name.tsx
 * @description Composant Skeleton pour le nom du site
 * Affiche un placeholder avec les mêmes dimensions que le nom réel pour éviter les sauts visuels
 */

interface SkeletonSiteNameProps {
  className?: string
  showSubtitle?: boolean
}

export function SkeletonSiteName({ className = '', showSubtitle = true }: SkeletonSiteNameProps) {
  return (
    <div className={`flex flex-col justify-center min-w-0 flex-1 sm:flex-initial ${className}`}>
      {/* Titre principal */}
      <div className="h-6 sm:h-7 md:h-8 lg:h-9 bg-gray-200 rounded animate-pulse mb-1 w-32 sm:w-40 md:w-48" />
      {/* Sous-titre (optionnel) */}
      {showSubtitle && (
        <div className="hidden sm:block h-3 md:h-4 bg-gray-200 rounded animate-pulse mt-0.5 w-24 md:w-32" />
      )}
    </div>
  )
}


