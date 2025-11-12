"use client"

import { useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: ReactNode
  transitionType?: 'fade' | 'slide'
}

/**
 * Composant pour gérer les transitions entre les pages
 * Détecte les changements de route et applique une animation
 */
export function PageTransition({ children, transitionType = 'fade' }: PageTransitionProps) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const [key, setKey] = useState(0)

  useEffect(() => {
    // Démarrer la transition
    setIsTransitioning(true)

    // Après un court délai, changer le contenu
    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setKey((prev) => prev + 1)
      setIsTransitioning(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [pathname])

  // Mettre à jour les enfants quand ils changent (sans transition)
  useEffect(() => {
    if (!isTransitioning) {
      setDisplayChildren(children)
    }
  }, [children, isTransitioning])

  const transitionClass =
    transitionType === 'slide' ? 'page-transition-slide' : 'page-transition-enter'

  return (
    <div key={key} className={isTransitioning ? transitionClass : ''} style={{ minHeight: '100vh' }}>
      {displayChildren}
    </div>
  )
}

