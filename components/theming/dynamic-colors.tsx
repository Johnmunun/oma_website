"use client"

import { useEffect } from 'react'

/**
 * Composant pour injecter les couleurs dynamiques depuis la DB
 * Applique les couleurs CSS variables au document
 */
export function DynamicColors() {
  useEffect(() => {
    const loadColors = async () => {
      try {
        const res = await fetch('/api/theming/colors', { 
          next: { revalidate: 60 } // Cache 60 secondes
        })
        if (!res.ok) return

        const data = await res.json()
        if (!data.success || !data.colors) return

        const colors = data.colors
        const root = document.documentElement

        // Convertir les couleurs hex en variables CSS
        const setColor = (cssVar: string, hexColor: string) => {
          root.style.setProperty(cssVar, hexColor)
        }

        // Appliquer les couleurs principales
        setColor('--background', colors.colorBackground)
        setColor('--foreground', colors.colorForeground)
        setColor('--card', colors.colorCard)
        setColor('--card-foreground', colors.colorCardForeground)

        // Couleurs primaires et secondaires
        setColor('--primary', colors.colorPrimary)
        setColor('--primary-foreground', colors.colorPrimaryForeground)
        setColor('--secondary', colors.colorSecondary)
        setColor('--secondary-foreground', colors.colorSecondaryForeground)

        // Accents et neutres
        setColor('--muted', colors.colorMuted)
        setColor('--muted-foreground', colors.colorMutedForeground)
        setColor('--accent', colors.colorAccent)
        setColor('--accent-foreground', colors.colorAccentForeground)

        // Bordures et inputs
        setColor('--border', colors.colorBorder)
        setColor('--input', colors.colorInput)
        setColor('--ring', colors.colorRing)

        // Couleurs orange/or (gold)
        setColor('--gold', colors.colorGold)
        setColor('--gold-dark', colors.colorGoldDark)
        setColor('--gold-light', colors.colorGoldLight)

        // Mettre à jour aussi les classes Tailwind via les variables de thème (@theme inline)
        setColor('--color-background', colors.colorBackground)
        setColor('--color-foreground', colors.colorForeground)
        setColor('--color-card', colors.colorCard)
        setColor('--color-card-foreground', colors.colorCardForeground)
        setColor('--color-primary', colors.colorPrimary)
        setColor('--color-primary-foreground', colors.colorPrimaryForeground)
        setColor('--color-secondary', colors.colorSecondary)
        setColor('--color-secondary-foreground', colors.colorSecondaryForeground)
        setColor('--color-muted', colors.colorMuted)
        setColor('--color-muted-foreground', colors.colorMutedForeground)
        setColor('--color-accent', colors.colorAccent)
        setColor('--color-accent-foreground', colors.colorAccentForeground)
        setColor('--color-border', colors.colorBorder)
        setColor('--color-input', colors.colorInput)
        setColor('--color-ring', colors.colorRing)
        setColor('--color-gold', colors.colorGold)
        setColor('--color-gold-dark', colors.colorGoldDark)
        setColor('--color-gold-light', colors.colorGoldLight)
      } catch (error) {
        console.error('[DynamicColors] Erreur chargement couleurs:', error)
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
