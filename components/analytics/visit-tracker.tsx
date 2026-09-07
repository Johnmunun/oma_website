"use client"

/**
 * @file components/analytics/visit-tracker.tsx
 * @description Composant pour tracker les visites des utilisateurs
 * S'exécute côté client et envoie les données à l'API
 */

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

function sendDurationBeacon(payload: {
  url: string
  path: string
  referer: string | null
  screenWidth: number
  screenHeight: number
  language: string | null
  sessionId: string | null
  duration: number
}) {
  try {
    if (navigator.sendBeacon) {
      const data = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/track', data)
      return
    }
    void fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    // ignore
  }
}

export function VisitTracker() {
  const pathname = usePathname()
  const sessionIdRef = useRef<string | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const trackedRef = useRef<boolean>(false)
  const pathRef = useRef<string>(pathname || '/')

  useEffect(() => {
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
      return
    }

    if (!sessionIdRef.current) {
      sessionIdRef.current = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('analytics_session_id')
        if (stored) {
          sessionIdRef.current = stored
        } else {
          sessionStorage.setItem('analytics_session_id', sessionIdRef.current)
        }
      }
    }

    pathRef.current = pathname || '/'
    startTimeRef.current = Date.now()
    trackedRef.current = false

    const trackVisit = async () => {
      if (trackedRef.current) return
      trackedRef.current = true

      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: window.location.href,
            path: pathname || '/',
            referer: document.referrer || null,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            language: navigator.language || null,
            sessionId: sessionIdRef.current,
          }),
          keepalive: true,
        })
      } catch (error) {
        console.error('[VisitTracker] Erreur tracking:', error)
      }
    }

    void trackVisit()

    const buildDurationPayload = () => ({
      url: window.location.href,
      path: pathRef.current,
      referer: document.referrer || null,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language || null,
      sessionId: sessionIdRef.current,
      duration: Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000)),
    })

    const handleBeforeUnload = () => {
      sendDurationBeacon(buildDurationPayload())
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Durée aussi au changement de page (SPA)
      sendDurationBeacon(buildDurationPayload())
    }
  }, [pathname])

  return null
}
