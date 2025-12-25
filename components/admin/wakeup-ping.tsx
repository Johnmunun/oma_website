/**
 * @file components/admin/wakeup-ping.tsx
 * @description Composant pour envoyer des requêtes périodiques à la DB pour la maintenir active
 */

"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"

interface WakeUpPingProps {
  intervalMinutes: number // Intervalle en minutes
}

/**
 * Composant qui envoie périodiquement une requête à la base de données
 * pour maintenir la connexion active et éviter que la DB ne s'endorme
 */
export function WakeUpPing({ intervalMinutes }: WakeUpPingProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    // Ne pas envoyer de ping si l'utilisateur n'est pas connecté
    if (!session?.user) {
      return
    }

    // Convertir les minutes en millisecondes
    const intervalMs = intervalMinutes * 60 * 1000

    // Fonction pour envoyer le ping
    const sendPing = async () => {
      try {
        const res = await fetch("/api/admin/wakeup-ping", {
          method: "GET",
          cache: "no-store",
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            // Ping réussi - log silencieux en développement seulement
            if (process.env.NODE_ENV === "development") {
              console.log(
                `[WakeUpPing] Ping réussi à ${new Date().toLocaleTimeString()}`
              )
            }
          }
        }
      } catch (err) {
        // Erreur silencieuse - on ne veut pas perturber l'utilisateur
        // L'erreur sera loggée côté serveur
        if (process.env.NODE_ENV === "development") {
          console.error("[WakeUpPing] Erreur ping:", err)
        }
      }
    }

    // Envoyer le premier ping immédiatement (après un court délai)
    const initialTimeout = setTimeout(() => {
      sendPing()
    }, 5000) // Attendre 5 secondes après le montage

    // Configurer l'intervalle pour les pings suivants
    intervalRef.current = setInterval(() => {
      sendPing()
    }, intervalMs)

    // Nettoyer les timers au démontage
    return () => {
      clearTimeout(initialTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [intervalMinutes, session])

  // Ce composant ne rend rien (invisible)
  return null
}







