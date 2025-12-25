/**
 * @file lib/cache/visual-settings-cache.ts
 * @description Utilitaire de cache local pour les paramètres visuels du site
 * Stocke les couleurs, logo et nom du site dans localStorage pour éviter le flash au rechargement
 */

// Clés de stockage
const CACHE_KEYS = {
  COLORS: 'oma_theme_colors',
  COLORS_TIMESTAMP: 'oma_theme_colors_timestamp',
  LOGO: 'oma_site_logo',
  LOGO_TIMESTAMP: 'oma_site_logo_timestamp',
  SITE_TITLE: 'oma_site_title',
  SITE_TITLE_TIMESTAMP: 'oma_site_title_timestamp',
  SITE_SETTINGS: 'oma_site_settings', // Cache complet des settings
  SITE_SETTINGS_TIMESTAMP: 'oma_site_settings_timestamp',
} as const

// Durée de validité du cache (24 heures)
const CACHE_DURATION = 24 * 60 * 60 * 1000

/**
 * Interface pour les couleurs du thème
 */
export interface ThemeColors {
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

/**
 * Interface pour les paramètres visuels complets
 */
export interface VisualSettings {
  logoUrl: string | null
  siteTitle: string
  colors: ThemeColors
}

/**
 * Vérifie si localStorage est disponible
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Récupère une valeur du cache avec vérification de validité
 */
function getCachedValue<T>(key: string, timestampKey: string): { value: T | null; isValid: boolean } {
  if (!isLocalStorageAvailable()) {
    return { value: null, isValid: false }
  }

  try {
    const cached = localStorage.getItem(key)
    const timestamp = localStorage.getItem(timestampKey)

    if (!cached || !timestamp) {
      return { value: null, isValid: false }
    }

    const parsedTimestamp = parseInt(timestamp, 10)
    const now = Date.now()

    // Vérifier si le cache est encore valide
    if (now - parsedTimestamp > CACHE_DURATION) {
      return { value: null, isValid: false }
    }

    const value = JSON.parse(cached) as T
    return { value, isValid: true }
  } catch (error) {
    console.warn(`[VisualSettingsCache] Erreur lecture cache ${key}:`, error)
    return { value: null, isValid: false }
  }
}

/**
 * Stocke une valeur dans le cache avec timestamp
 */
function setCachedValue<T>(key: string, timestampKey: string, value: T): void {
  if (!isLocalStorageAvailable()) return

  try {
    const timestamp = Date.now()
    localStorage.setItem(key, JSON.stringify(value))
    localStorage.setItem(timestampKey, String(timestamp))
  } catch (error) {
    console.warn(`[VisualSettingsCache] Erreur écriture cache ${key}:`, error)
  }
}

/**
 * Récupère les couleurs depuis le cache
 */
export function getCachedColors(): ThemeColors | null {
  const { value, isValid } = getCachedValue<ThemeColors>(
    CACHE_KEYS.COLORS,
    CACHE_KEYS.COLORS_TIMESTAMP
  )

  if (isValid && value) {
    console.log('[VisualSettingsCache] ✅ Couleurs chargées depuis le cache')
    return value
  }

  return null
}

/**
 * Stocke les couleurs dans le cache
 */
export function setCachedColors(colors: ThemeColors): void {
  setCachedValue(CACHE_KEYS.COLORS, CACHE_KEYS.COLORS_TIMESTAMP, colors)
  console.log('[VisualSettingsCache] 💾 Couleurs sauvegardées dans le cache')
}

/**
 * Récupère le logo depuis le cache
 */
export function getCachedLogo(): string | null {
  const { value, isValid } = getCachedValue<string>(
    CACHE_KEYS.LOGO,
    CACHE_KEYS.LOGO_TIMESTAMP
  )

  if (isValid && value) {
    console.log('[VisualSettingsCache] ✅ Logo chargé depuis le cache')
    return value
  }

  return null
}

/**
 * Stocke le logo dans le cache
 */
export function setCachedLogo(logoUrl: string | null): void {
  setCachedValue(CACHE_KEYS.LOGO, CACHE_KEYS.LOGO_TIMESTAMP, logoUrl)
  console.log('[VisualSettingsCache] 💾 Logo sauvegardé dans le cache')
}

/**
 * Récupère le nom du site depuis le cache
 */
export function getCachedSiteTitle(): string | null {
  const { value, isValid } = getCachedValue<string>(
    CACHE_KEYS.SITE_TITLE,
    CACHE_KEYS.SITE_TITLE_TIMESTAMP
  )

  if (isValid && value) {
    console.log('[VisualSettingsCache] ✅ Nom du site chargé depuis le cache')
    return value
  }

  return null
}

/**
 * Stocke le nom du site dans le cache
 */
export function setCachedSiteTitle(siteTitle: string): void {
  setCachedValue(CACHE_KEYS.SITE_TITLE, CACHE_KEYS.SITE_TITLE_TIMESTAMP, siteTitle)
  console.log('[VisualSettingsCache] 💾 Nom du site sauvegardé dans le cache')
}

/**
 * Récupère tous les paramètres visuels depuis le cache
 */
export function getCachedVisualSettings(): VisualSettings | null {
  const { value, isValid } = getCachedValue<VisualSettings>(
    CACHE_KEYS.SITE_SETTINGS,
    CACHE_KEYS.SITE_SETTINGS_TIMESTAMP
  )

  if (isValid && value) {
    console.log('[VisualSettingsCache] ✅ Paramètres visuels chargés depuis le cache')
    return value
  }

  return null
}

/**
 * Stocke tous les paramètres visuels dans le cache
 */
export function setCachedVisualSettings(settings: VisualSettings): void {
  setCachedValue(CACHE_KEYS.SITE_SETTINGS, CACHE_KEYS.SITE_SETTINGS_TIMESTAMP, settings)
  console.log('[VisualSettingsCache] 💾 Paramètres visuels sauvegardés dans le cache')
}

/**
 * Applique les couleurs au document (injection CSS)
 */
export function applyColorsToDocument(colors: ThemeColors): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // Variables CSS principales
  root.style.setProperty('--background', colors.colorBackground)
  root.style.setProperty('--foreground', colors.colorForeground)
  root.style.setProperty('--card', colors.colorCard)
  root.style.setProperty('--card-foreground', colors.colorCardForeground)
  root.style.setProperty('--primary', colors.colorPrimary)
  root.style.setProperty('--primary-foreground', colors.colorPrimaryForeground)
  root.style.setProperty('--secondary', colors.colorSecondary)
  root.style.setProperty('--secondary-foreground', colors.colorSecondaryForeground)
  root.style.setProperty('--muted', colors.colorMuted)
  root.style.setProperty('--muted-foreground', colors.colorMutedForeground)
  root.style.setProperty('--accent', colors.colorAccent)
  root.style.setProperty('--accent-foreground', colors.colorAccentForeground)
  root.style.setProperty('--border', colors.colorBorder)
  root.style.setProperty('--input', colors.colorInput)
  root.style.setProperty('--ring', colors.colorRing)
  root.style.setProperty('--gold', colors.colorGold)
  root.style.setProperty('--gold-dark', colors.colorGoldDark)
  root.style.setProperty('--gold-light', colors.colorGoldLight)

  // Variables Tailwind
  root.style.setProperty('--color-background', colors.colorBackground)
  root.style.setProperty('--color-foreground', colors.colorForeground)
  root.style.setProperty('--color-card', colors.colorCard)
  root.style.setProperty('--color-card-foreground', colors.colorCardForeground)
  root.style.setProperty('--color-primary', colors.colorPrimary)
  root.style.setProperty('--color-primary-foreground', colors.colorPrimaryForeground)
  root.style.setProperty('--color-secondary', colors.colorSecondary)
  root.style.setProperty('--color-secondary-foreground', colors.colorSecondaryForeground)
  root.style.setProperty('--color-muted', colors.colorMuted)
  root.style.setProperty('--color-muted-foreground', colors.colorMutedForeground)
  root.style.setProperty('--color-accent', colors.colorAccent)
  root.style.setProperty('--color-accent-foreground', colors.colorAccentForeground)
  root.style.setProperty('--color-border', colors.colorBorder)
  root.style.setProperty('--color-input', colors.colorInput)
  root.style.setProperty('--color-ring', colors.colorRing)
  root.style.setProperty('--color-gold', colors.colorGold)
  root.style.setProperty('--color-gold-dark', colors.colorGoldDark)
  root.style.setProperty('--color-gold-light', colors.colorGoldLight)
}

/**
 * Nettoie le cache (utile pour les tests ou la réinitialisation)
 */
export function clearVisualSettingsCache(): void {
  if (!isLocalStorageAvailable()) return

  try {
    Object.values(CACHE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
    console.log('[VisualSettingsCache] 🗑️ Cache nettoyé')
  } catch (error) {
    console.warn('[VisualSettingsCache] Erreur nettoyage cache:', error)
  }
}


