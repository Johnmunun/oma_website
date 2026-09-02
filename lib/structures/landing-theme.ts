import type { CSSProperties } from 'react'

const DEFAULT_THEME = '#f97316'

/** Valide et normalise une couleur hex (#RGB ou #RRGGBB) */
export function normalizeHexColor(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  let hex = value.trim()
  if (!hex.startsWith('#')) hex = `#${hex}`
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    const r = hex[1]
    const g = hex[2]
    const b = hex[3]
    hex = `#${r}${r}${g}${g}${b}${b}`
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null
  return hex.toLowerCase()
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = hex.replace('#', '')
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('')}`
}

function mix(hex: string, target: 'white' | 'black', amount: number): string {
  const { r, g, b } = hexToRgb(hex)
  const t = target === 'white' ? 255 : 0
  return rgbToHex(r + (t - r) * amount, g + (t - g) * amount, b + (t - b) * amount)
}

export function getStructureThemeVars(color: string | null | undefined): CSSProperties {
  const primary = normalizeHexColor(color) ?? DEFAULT_THEME
  const dark = mix(primary, 'black', 0.15)
  const light = mix(primary, 'white', 0.25)
  const soft = mix(primary, 'white', 0.85)
  const { r, g, b } = hexToRgb(primary)

  return {
    '--st-primary': primary,
    '--st-primary-dark': dark,
    '--st-primary-light': light,
    '--st-primary-soft': soft,
    '--st-primary-rgb': `${r}, ${g}, ${b}`,
  } as CSSProperties
}

export function resolveStructureHero(structure: {
  name: string
  description: string | null
  landingHeroTitle?: string | null
  landingHeroHighlight?: string | null
  landingHeroSubtitle?: string | null
}): { title: string; highlight: string; subtitle: string } {
  const title = structure.landingHeroTitle?.trim() || 'Vous avez des talents,'
  const highlight = structure.landingHeroHighlight?.trim() || 'nous les valorisons.'
  let subtitle = structure.landingHeroSubtitle?.trim()
  if (!subtitle && structure.description) {
    const first = structure.description.split(/[.!?]/)[0]?.trim()
    if (first && first.length < 160) subtitle = first
  }
  if (!subtitle) {
    subtitle = `Découvrez ${structure.name} — talents, projets et formations.`
  }
  return { title, highlight, subtitle }
}
