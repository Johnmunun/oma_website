/**
 * @file components/theming/color-injector.tsx
 * @description Composant serveur pour injecter les couleurs dans le HTML initial (SSR)
 * Élimine le flash de couleur en chargeant les couleurs avant le rendu
 */

import { prisma } from '@/lib/prisma'

/**
 * Valeurs par défaut des couleurs (même que dans l'API)
 */
const defaultColors = {
  colorBackground: '#fefcfb',
  colorForeground: '#1a1a1a',
  colorCard: '#ffffff',
  colorCardForeground: '#1a1a1a',
  colorPrimary: '#0a0a0a',
  colorPrimaryForeground: '#fefcfb',
  colorSecondary: '#f97316',
  colorSecondaryForeground: '#1a1a1a',
  colorMuted: '#f7f5f3',
  colorMutedForeground: '#71717a',
  colorAccent: '#f97316',
  colorAccentForeground: '#1a1a1a',
  colorBorder: '#e4e4e7',
  colorInput: '#ffffff',
  colorRing: '#f97316',
  colorGold: '#f97316',
  colorGoldDark: '#ea580c',
  colorGoldLight: '#fb923c',
}

/**
 * Charge les couleurs depuis la base de données (côté serveur)
 */
export async function getThemeColors() {
  try {
    const setting = await prisma.setting.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: {
        colorBackground: true,
        colorForeground: true,
        colorCard: true,
        colorCardForeground: true,
        colorPrimary: true,
        colorPrimaryForeground: true,
        colorSecondary: true,
        colorSecondaryForeground: true,
        colorMuted: true,
        colorMutedForeground: true,
        colorAccent: true,
        colorAccentForeground: true,
        colorBorder: true,
        colorInput: true,
        colorRing: true,
        colorGold: true,
        colorGoldDark: true,
        colorGoldLight: true,
        updatedAt: true,
      },
    })

    // Fusionner avec les valeurs par défaut
    const colors = {
      ...defaultColors,
      ...(setting ? {
        colorBackground: setting.colorBackground || defaultColors.colorBackground,
        colorForeground: setting.colorForeground || defaultColors.colorForeground,
        colorCard: setting.colorCard || defaultColors.colorCard,
        colorCardForeground: setting.colorCardForeground || defaultColors.colorCardForeground,
        colorPrimary: setting.colorPrimary || defaultColors.colorPrimary,
        colorPrimaryForeground: setting.colorPrimaryForeground || defaultColors.colorPrimaryForeground,
        colorSecondary: setting.colorSecondary || defaultColors.colorSecondary,
        colorSecondaryForeground: setting.colorSecondaryForeground || defaultColors.colorSecondaryForeground,
        colorMuted: setting.colorMuted || defaultColors.colorMuted,
        colorMutedForeground: setting.colorMutedForeground || defaultColors.colorMutedForeground,
        colorAccent: setting.colorAccent || defaultColors.colorAccent,
        colorAccentForeground: setting.colorAccentForeground || defaultColors.colorAccentForeground,
        colorBorder: setting.colorBorder || defaultColors.colorBorder,
        colorInput: setting.colorInput || defaultColors.colorInput,
        colorRing: setting.colorRing || defaultColors.colorRing,
        colorGold: setting.colorGold || defaultColors.colorGold,
        colorGoldDark: setting.colorGoldDark || defaultColors.colorGoldDark,
        colorGoldLight: setting.colorGoldLight || defaultColors.colorGoldLight,
      } : {}),
    }

    // Timestamp pour la validation du cache
    const timestamp = setting?.updatedAt ? new Date(setting.updatedAt).getTime() : Date.now()

    return {
      colors,
      timestamp,
    }
  } catch (error) {
    console.error('[ColorInjector] Erreur chargement couleurs:', error)
    return {
      colors: defaultColors,
      timestamp: Date.now(),
    }
  }
}

/**
 * Génère le script inline pour charger les couleurs depuis localStorage ou utiliser les couleurs SSR
 */
export function generateColorLoaderScript(colors: typeof defaultColors, timestamp: number): string {
  const colorsJson = JSON.stringify(colors)
  
  return `
(function() {
  'use strict';
  
  const STORAGE_KEY = 'oma_theme_colors';
  const STORAGE_TIMESTAMP_KEY = 'oma_theme_timestamp';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures
  
  // Couleurs injectées par SSR
  const ssrColors = ${colorsJson};
  const ssrTimestamp = ${timestamp};
  
  // Fonction pour appliquer les couleurs
  function applyColors(colors) {
    const root = document.documentElement;
    
    // Variables CSS principales
    root.style.setProperty('--background', colors.colorBackground);
    root.style.setProperty('--foreground', colors.colorForeground);
    root.style.setProperty('--card', colors.colorCard);
    root.style.setProperty('--card-foreground', colors.colorCardForeground);
    root.style.setProperty('--primary', colors.colorPrimary);
    root.style.setProperty('--primary-foreground', colors.colorPrimaryForeground);
    root.style.setProperty('--secondary', colors.colorSecondary);
    root.style.setProperty('--secondary-foreground', colors.colorSecondaryForeground);
    root.style.setProperty('--muted', colors.colorMuted);
    root.style.setProperty('--muted-foreground', colors.colorMutedForeground);
    root.style.setProperty('--accent', colors.colorAccent);
    root.style.setProperty('--accent-foreground', colors.colorAccentForeground);
    root.style.setProperty('--border', colors.colorBorder);
    root.style.setProperty('--input', colors.colorInput);
    root.style.setProperty('--ring', colors.colorRing);
    root.style.setProperty('--gold', colors.colorGold);
    root.style.setProperty('--gold-dark', colors.colorGoldDark);
    root.style.setProperty('--gold-light', colors.colorGoldLight);
    
    // Variables Tailwind
    root.style.setProperty('--color-background', colors.colorBackground);
    root.style.setProperty('--color-foreground', colors.colorForeground);
    root.style.setProperty('--color-card', colors.colorCard);
    root.style.setProperty('--color-card-foreground', colors.colorCardForeground);
    root.style.setProperty('--color-primary', colors.colorPrimary);
    root.style.setProperty('--color-primary-foreground', colors.colorPrimaryForeground);
    root.style.setProperty('--color-secondary', colors.colorSecondary);
    root.style.setProperty('--color-secondary-foreground', colors.colorSecondaryForeground);
    root.style.setProperty('--color-muted', colors.colorMuted);
    root.style.setProperty('--color-muted-foreground', colors.colorMutedForeground);
    root.style.setProperty('--color-accent', colors.colorAccent);
    root.style.setProperty('--color-accent-foreground', colors.colorAccentForeground);
    root.style.setProperty('--color-border', colors.colorBorder);
    root.style.setProperty('--color-input', colors.colorInput);
    root.style.setProperty('--color-ring', colors.colorRing);
    root.style.setProperty('--color-gold', colors.colorGold);
    root.style.setProperty('--color-gold-dark', colors.colorGoldDark);
    root.style.setProperty('--color-gold-light', colors.colorGoldLight);
  }
  
  // Vérifier localStorage
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const storedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    
    if (storedData && storedTimestamp) {
      const parsedTimestamp = parseInt(storedTimestamp, 10);
      const now = Date.now();
      
      // Si le cache est valide (moins de 24h) et plus récent que les couleurs SSR
      if (parsedTimestamp > ssrTimestamp && (now - parsedTimestamp) < CACHE_DURATION) {
        try {
          const storedColors = JSON.parse(storedData);
          applyColors(storedColors);
          return; // Utiliser les couleurs du cache
        } catch (e) {
          console.warn('[ColorLoader] Erreur parsing localStorage, utilisation SSR');
        }
      }
    }
  } catch (e) {
    // localStorage non disponible (mode privé, etc.)
    console.warn('[ColorLoader] localStorage non disponible, utilisation SSR');
  }
  
  // Utiliser les couleurs SSR (première visite ou cache expiré)
  applyColors(ssrColors);
  
  // Stocker dans localStorage pour la prochaine visite
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ssrColors));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, String(ssrTimestamp));
  } catch (e) {
    // Ignorer les erreurs de localStorage
  }
})();
`.trim()
}

/**
 * Composant serveur qui injecte les couleurs dans le head
 */
export async function ColorInjector() {
  const { colors, timestamp } = await getThemeColors()
  const script = generateColorLoaderScript(colors, timestamp)

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  )
}

