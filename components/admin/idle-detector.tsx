/**
 * @file components/admin/idle-detector.tsx
 * @description Composant pour détecter l'inactivité de l'utilisateur et déclencher le verrouillage
 */

"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface IdleDetectorProps {
  idleTimeoutMinutes: number // Temps d'inactivité en minutes
  onIdle: () => void // Callback appelé quand l'inactivité est détectée
}

/**
 * Composant qui détecte l'inactivité de l'utilisateur
 * Surveille les interactions (clics, touches, mouvements de souris, scroll)
 */
export function IdleDetector({ idleTimeoutMinutes, onIdle }: IdleDetectorProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const [isLocked, setIsLocked] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  // Temps maximum avant redirection vers login (1 heure)
  const MAX_IDLE_TIME = 60 * 60 * 1000 // 1 heure en millisecondes

  const resetTimer = () => {
    if (isLocked) return // Ne pas réinitialiser si déjà verrouillé

    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityRef.current

    // Si l'inactivité dépasse 1 heure, rediriger vers login
    if (timeSinceLastActivity >= MAX_IDLE_TIME) {
      router.push("/login?reason=inactivity")
      return
    }

    // Réinitialiser le timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    lastActivityRef.current = now

    // Définir un nouveau timer pour le verrouillage
    const timeoutMs = idleTimeoutMinutes * 60 * 1000
    timeoutRef.current = setTimeout(() => {
      setIsLocked(true)
      onIdle()
    }, timeoutMs)
  }

  useEffect(() => {
    if (!session?.user) return // Ne pas surveiller si non connecté

    // Événements à surveiller pour détecter l'activité
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "keydown",
    ]

    // Ajouter les listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true })
    })

    // Initialiser le timer
    resetTimer()

    // Nettoyer les listeners au démontage
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [idleTimeoutMinutes, session, isLocked])

  // Vérifier périodiquement si l'inactivité dépasse 1 heure
  useEffect(() => {
    if (!session?.user) return

    const checkMaxIdle = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivityRef.current

      if (timeSinceLastActivity >= MAX_IDLE_TIME && !isLocked) {
        router.push("/login?reason=inactivity")
      }
    }, 60000) // Vérifier toutes les minutes

    return () => clearInterval(checkMaxIdle)
  }, [session, isLocked, router])

  // Ce composant ne rend rien (invisible)
  return null
}







