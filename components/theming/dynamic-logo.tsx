"use client"

import { useEffect, useState } from 'react'
import {
  getCachedLogo,
  setCachedLogo,
  getCachedSiteTitle,
  setCachedSiteTitle,
} from '@/lib/cache/visual-settings-cache'

/**
 * Composant pour injecter le logo dynamique depuis la DB
 * Met à jour le logo dans la navigation
 * Utilise le cache local pour éviter le flash au chargement
 */
export function DynamicLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    // 1. Charger depuis le cache immédiatement (si disponible via window.__OMA_CACHE__)
    const cachedLogo =
      (typeof window !== 'undefined' && (window as any).__OMA_CACHE__?.logo) ||
      getCachedLogo()

    if (cachedLogo) {
      setLogoUrl(cachedLogo)
    }

    // 2. Charger depuis l'API pour mettre à jour si nécessaire
    const loadLogo = async () => {
      try {
        const res = await fetch('/api/site-settings', {
          cache: 'no-store', // Pas de cache HTTP, on utilise notre cache local
        })
        if (!res.ok) {
          console.warn('[DynamicLogo] ⚠️ Erreur API, utilisation du cache')
          return
        }

        const data = await res.json()
        if (!data.success || !data.data) {
          console.warn('[DynamicLogo] ⚠️ Données invalides, utilisation du cache')
          return
        }

        const newLogoUrl = data.data.logoUrl || null

        // 3. Vérifier si le logo a changé
        if (newLogoUrl !== cachedLogo) {
          setLogoUrl(newLogoUrl)
          setCachedLogo(newLogoUrl)
          console.log('[DynamicLogo] ✅ Logo chargé depuis l\'API et mis à jour')
        } else {
          console.log('[DynamicLogo] ✅ Logo identique, pas de mise à jour nécessaire')
        }
      } catch (error) {
        console.error('[DynamicLogo] ❌ Erreur chargement logo:', error)
        // En cas d'erreur, utiliser le cache si disponible
        if (cachedLogo) {
          setLogoUrl(cachedLogo)
          console.log('[DynamicLogo] ✅ Utilisation du cache en cas d\'erreur')
        }
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
  return null
}

/**
 * Hook pour récupérer le logo dynamique
 * Utilise le cache local pour éviter le flash au chargement
 */
export function useDynamicLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    // Initialiser avec le cache si disponible (via window.__OMA_CACHE__ ou localStorage)
    if (typeof window !== 'undefined') {
      return (
        (window as any).__OMA_CACHE__?.logo || getCachedLogo() || null
      )
    }
    return null
  })

  useEffect(() => {
    const loadLogo = async () => {
      try {
        // Charger depuis l'API
        const res = await fetch('/api/site-settings', {
          cache: 'no-store',
        })
        if (!res.ok) {
          console.warn('[useDynamicLogo] ⚠️ Erreur API, utilisation du cache')
          return
        }

        const data = await res.json()
        if (!data.success || !data.data) {
          console.warn('[useDynamicLogo] ⚠️ Données invalides, utilisation du cache')
          return
        }

        const newLogoUrl = data.data.logoUrl || null

        // Vérifier si le logo a changé
        if (newLogoUrl !== logoUrl) {
          setLogoUrl(newLogoUrl)
          setCachedLogo(newLogoUrl)
          console.log('[useDynamicLogo] ✅ Logo chargé depuis l\'API et mis à jour')
        } else {
          console.log('[useDynamicLogo] ✅ Logo identique, pas de mise à jour nécessaire')
        }
      } catch (error) {
        console.error('[useDynamicLogo] ❌ Erreur chargement logo:', error)
        // En cas d'erreur, utiliser le cache si disponible
        const cachedLogo = getCachedLogo()
        if (cachedLogo && cachedLogo !== logoUrl) {
          setLogoUrl(cachedLogo)
          console.log('[useDynamicLogo] ✅ Utilisation du cache en cas d\'erreur')
        }
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
  }, [logoUrl])

  return logoUrl
}




