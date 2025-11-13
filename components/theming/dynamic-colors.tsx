"use client"

import { useEffect } from 'react'
import {
  getCachedColors,
  setCachedColors,
  applyColorsToDocument,
  type ThemeColors,
} from '@/lib/cache/visual-settings-cache'

/**
 * Composant pour injecter les couleurs dynamiques depuis la DB
 * Applique les couleurs CSS variables au document
 * Utilise le cache local pour éviter le flash au chargement
 */
export function DynamicColors() {
  useEffect(() => {
    const loadColors = async () => {
      try {
        // 1. D'abord, vérifier le cache (déjà appliqué par le script d'init, mais on vérifie quand même)
        const cachedColors = getCachedColors()
        if (cachedColors) {
          // Les couleurs sont déjà appliquées par le script d'init, mais on les réapplique au cas où
          applyColorsToDocument(cachedColors)
        }

        // 2. Charger les couleurs depuis l'API pour mettre à jour si nécessaire
        const res = await fetch('/api/theming/colors', {
          cache: 'no-store', // Pas de cache HTTP, on utilise notre cache local
        })
        if (!res.ok) {
          console.warn('[DynamicColors] ⚠️ Erreur API, utilisation du cache')
          return
        }

        const data = await res.json()
        if (!data.success || !data.colors) {
          console.warn('[DynamicColors] ⚠️ Données invalides, utilisation du cache')
          return
        }

        const colors = data.colors as ThemeColors

        // 3. Vérifier si les couleurs ont changé
        const hasChanged =
          !cachedColors ||
          JSON.stringify(cachedColors) !== JSON.stringify(colors)

        if (hasChanged) {
          // Appliquer les nouvelles couleurs
          applyColorsToDocument(colors)

          // Mettre à jour le cache
          setCachedColors(colors)
          console.log('[DynamicColors] ✅ Couleurs chargées depuis l\'API et mises à jour')
        } else {
          console.log('[DynamicColors] ✅ Couleurs identiques, pas de mise à jour nécessaire')
        }
      } catch (error) {
        console.error('[DynamicColors] ❌ Erreur chargement couleurs:', error)
        // En cas d'erreur, utiliser le cache si disponible
        const cachedColors = getCachedColors()
        if (cachedColors) {
          applyColorsToDocument(cachedColors)
          console.log('[DynamicColors] ✅ Utilisation du cache en cas d\'erreur')
        }
      }
    }

    loadColors()

    // Écouter les événements de mise à jour des couleurs
    const handleColorsUpdate = () => {
      loadColors()
    }

    window.addEventListener('colors-updated', handleColorsUpdate)

    // Écouter aussi les événements de mise à jour des settings (au cas où)
    window.addEventListener('settings-updated', handleColorsUpdate)

    return () => {
      window.removeEventListener('colors-updated', handleColorsUpdate)
      window.removeEventListener('settings-updated', handleColorsUpdate)
    }
  }, [])

  return null
}
