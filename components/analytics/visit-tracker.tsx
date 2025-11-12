"use client"

/**
 * @file components/analytics/visit-tracker.tsx
 * @description Composant pour tracker les visites des utilisateurs
 * S'exécute côté client et envoie les données à l'API
 */

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function VisitTracker() {
  const pathname = usePathname()
  const sessionIdRef = useRef<string | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const trackedRef = useRef<boolean>(false)

  useEffect(() => {
    // Ne tracker que les pages publiques (pas les pages admin)
    if (pathname?.startsWith('/admin')) {
      return
    }

    // Générer un ID de session si nécessaire
    if (!sessionIdRef.current) {
      sessionIdRef.current = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      // Stocker dans sessionStorage pour persister pendant la session
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('analytics_session_id')
        if (stored) {
          sessionIdRef.current = stored
        } else {
          sessionStorage.setItem('analytics_session_id', sessionIdRef.current)
        }
      }
    }

    // Réinitialiser le temps de départ pour cette page
    startTimeRef.current = Date.now()
    trackedRef.current = false

    // Fonction pour tracker la visite
    const trackVisit = async () => {
      if (trackedRef.current) return
      trackedRef.current = true

      try {
        const url = window.location.href
        const path = pathname || '/'
        const referer = document.referrer || null
        const screenWidth = window.screen.width
        const screenHeight = window.screen.height
        const language = navigator.language || null

        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            path,
            referer,
            screenWidth,
            screenHeight,
            language,
            sessionId: sessionIdRef.current,
          }),
        })
      } catch (error) {
        // Ignorer les erreurs silencieusement pour ne pas perturber l'expérience utilisateur
        console.error('[VisitTracker] Erreur tracking:', error)
      }
    }

    // Tracker immédiatement
    trackVisit()

    // Tracker la durée de visite quand l'utilisateur quitte la page
    const handleBeforeUnload = () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
      
      // Envoyer la durée de visite (navigator.sendBeacon pour fiabilité)
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          url: window.location.href,
          path: pathname || '/',
          referer: document.referrer || null,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          language: navigator.language || null,
          sessionId: sessionIdRef.current,
          duration,
        })
        
        navigator.sendBeacon('/api/analytics/track', data)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [pathname])

  // Ce composant ne rend rien
  return null
}







