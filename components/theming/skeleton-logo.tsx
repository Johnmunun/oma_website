/**
 * @file components/theming/skeleton-logo.tsx
 * @description Composant Skeleton pour le logo
 * Affiche un placeholder avec les mêmes dimensions que le logo réel pour éviter les sauts visuels
 */

interface SkeletonLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SkeletonLogo({ className = '', size = 'md' }: SkeletonLogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 sm:w-14 sm:h-14',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
  }

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      {/* Cercle blanc derrière (même structure que le logo réel) */}
      <div
        className={`absolute ${sizeClasses[size]} bg-white rounded-full shadow-md z-0 animate-pulse`}
      />
      {/* Placeholder du logo */}
      <div
        className={`relative z-10 ${sizeClasses[size]} bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center animate-pulse`}
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-400 rounded-full" />
      </div>
    </div>
  )
}


