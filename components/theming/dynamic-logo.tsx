"use client"

import { useEffect, useState } from 'react'

/**
 * Composant pour injecter le logo dynamique depuis la DB
 * Met à jour le logo dans la navigation
 */
export function DynamicLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const res = await fetch('/api/site-settings', { 
          next: { revalidate: 60 } // Cache 60 secondes
        })
        if (!res.ok) return

        const data = await res.json()
        if (!data.success || !data.data) return

        if (data.data.logoUrl) {
          setLogoUrl(data.data.logoUrl)
        }
      } catch (error) {
        console.error('[DynamicLogo] Erreur chargement logo:', error)
      }
    }

    loadLogo()

    // Écouter les événements de mise à jour des settings
    const handleSettingsUpdate = () => {
      loadLogo()
    }

    window.addEventListener('settings-updated', handleSettingsUpdate)

    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate)
    }
  }, [])

  // Ce composant ne rend rien directement
  // Il stocke le logo dans le state pour être utilisé par d'autres composants
  // Pour l'instant, on peut simplement retourner null
  return null
}

/**
 * Hook pour récupérer le logo dynamique
 */
export function useDynamicLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const res = await fetch('/api/site-settings', { 
          next: { revalidate: 60 } // Cache 60 secondes
        })
        if (!res.ok) return

        const data = await res.json()
        if (!data.success || !data.data) return

        if (data.data.logoUrl) {
          setLogoUrl(data.data.logoUrl)
        }
      } catch (error) {
        console.error('[useDynamicLogo] Erreur chargement logo:', error)
      }
    }

    loadLogo()

    const handleSettingsUpdate = () => {
      loadLogo()
    }

    window.addEventListener('settings-updated', handleSettingsUpdate)

    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate)
    }
  }, [])

  return logoUrl
}




