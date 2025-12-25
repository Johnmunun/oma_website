"use client"

import { useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: ReactNode
  transitionType?: 'fade' | 'slide'
}

/**
 * Composant pour gérer les transitions entre les pages
 * Détecte les changements de route et applique une animation fluide
 * Désactivé sur la page d'accueil pour un chargement instantané
 */
export function PageTransition({ children, transitionType = 'fade' }: PageTransitionProps) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const [key, setKey] = useState(0)

  // Désactiver les transitions sur la page d'accueil
  const isHomePage = pathname === '/'

  useEffect(() => {
    // Pas de transition sur la page d'accueil
    if (isHomePage) {
      setDisplayChildren(children)
      setKey((prev) => prev + 1)
      return
    }

    // Démarrer la transition pour les autres pages
    setIsTransitioning(true)

    // Après un court délai, changer le contenu avec fade-in
    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setKey((prev) => prev + 1)
      setIsTransitioning(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [pathname, isHomePage, children])

  // Mettre à jour les enfants quand ils changent (sans transition si pas de changement de route)
  useEffect(() => {
    if (!isTransitioning || isHomePage) {
      setDisplayChildren(children)
    }
  }, [children, isTransitioning, isHomePage])

  // Pas de transition sur la page d'accueil
  if (isHomePage) {
    return <>{children}</>
  }

  const transitionClass = isTransitioning
    ? 'opacity-0 transition-opacity duration-300 ease-in-out'
    : 'opacity-100 transition-opacity duration-300 ease-in-out'

  return (
    <div key={key} className={transitionClass} style={{ minHeight: '100vh' }}>
      {displayChildren}
    </div>
  )
}

