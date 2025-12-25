/**
 * @file components/animations/smooth-navigation.tsx
 * @description Composant pour gérer les animations fluides de navigation
 * Gère le smooth scroll pour les ancres et les transitions entre pages
 */

"use client"

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Gère le smooth scroll pour les ancres internes et les transitions de page
 */
export function SmoothNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Gérer le scroll vers l'ancre au chargement de la page
    const handleHashScroll = () => {
      if (window.location.hash) {
        const hash = window.location.hash.substring(1)
        const element = document.getElementById(hash)

        if (element) {
          // Attendre que le DOM soit prêt
          setTimeout(() => {
            const navHeight = 80 // Hauteur approximative de la navigation
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
            const offsetPosition = elementPosition - navHeight

            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: 'smooth',
            })
          }, 300) // Délai pour laisser le temps à la page de se charger
        }
      }
    }

    // Exécuter au chargement et après un changement de route
    const timer = setTimeout(handleHashScroll, 100)

    // Gérer les clics sur les liens avec ancres
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href^="#"]') as HTMLAnchorElement | null

      if (!link) return

      const href = link.getAttribute('href')
      if (!href || href === '#') return

      // Vérifier si c'est un lien interne (même page)
      const isInternalAnchor = href.startsWith('#') && href.length > 1

      if (isInternalAnchor) {
        e.preventDefault()
        e.stopPropagation()

        const targetId = href.substring(1)
        const targetElement = document.getElementById(targetId)

        if (targetElement) {
          // Calculer la position avec offset pour la navigation fixe
          const navHeight = 80
          const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - navHeight

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth',
          })

          // Mettre à jour l'URL sans recharger la page
          if (window.history.pushState) {
            window.history.pushState(null, '', href)
          }
        } else {
          // Si l'élément n'existe pas, essayer de naviguer vers la page d'accueil avec l'ancre
          if (pathname !== '/') {
            router.push(`/${href}`)
          }
        }
      }
    }

    // Écouter les clics sur tous les liens
    document.addEventListener('click', handleAnchorClick, true)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleAnchorClick, true)
    }
  }, [pathname, router])

  return null
}

