/**
 * @file types/cache.d.ts
 * @description Déclarations TypeScript pour le cache local des paramètres visuels
 */

interface Window {
  __OMA_CACHE__?: {
    logo?: string | null
    siteTitle?: string | null
    colors?: {
      colorBackground: string
      colorForeground: string
      colorCard: string
      colorCardForeground: string
      colorPrimary: string
      colorPrimaryForeground: string
      colorSecondary: string
      colorSecondaryForeground: string
      colorMuted: string
      colorMutedForeground: string
      colorAccent: string
      colorAccentForeground: string
      colorBorder: string
      colorInput: string
      colorRing: string
      colorGold: string
      colorGoldDark: string
      colorGoldLight: string
    }
  }
}

