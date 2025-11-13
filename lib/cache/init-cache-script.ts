/**
 * @file lib/cache/init-cache-script.ts
 * @description Script d'initialisation du cache pour éviter le flash au chargement
 * Ce script est injecté dans le <head> avant le rendu React pour charger immédiatement les valeurs du cache
 */

/**
 * Génère le script inline pour initialiser le cache avant le rendu React
 */
export function generateCacheInitScript(): string {
  return `
(function() {
  'use strict';
  
  // Clés de stockage
  const CACHE_KEYS = {
    COLORS: 'oma_theme_colors',
    COLORS_TIMESTAMP: 'oma_theme_colors_timestamp',
    LOGO: 'oma_site_logo',
    LOGO_TIMESTAMP: 'oma_site_logo_timestamp',
    SITE_TITLE: 'oma_site_title',
    SITE_TITLE_TIMESTAMP: 'oma_site_title_timestamp',
  };
  
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures
  
  // Fonction pour appliquer les couleurs
  function applyColors(colors) {
    if (!colors) return;
    
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
  
  // Fonction pour récupérer une valeur du cache
  function getCachedValue(key, timestampKey) {
    try {
      const cached = localStorage.getItem(key);
      const timestamp = localStorage.getItem(timestampKey);
      
      if (!cached || !timestamp) {
        return null;
      }
      
      const parsedTimestamp = parseInt(timestamp, 10);
      const now = Date.now();
      
      // Vérifier si le cache est encore valide
      if (now - parsedTimestamp > CACHE_DURATION) {
        return null;
      }
      
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }
  
  // Charger et appliquer les couleurs depuis le cache
  const cachedColors = getCachedValue(CACHE_KEYS.COLORS, CACHE_KEYS.COLORS_TIMESTAMP);
  if (cachedColors) {
    applyColors(cachedColors);
    console.log('[CacheInit] ✅ Couleurs chargées depuis le cache');
  } else {
    // Appliquer des couleurs neutres par défaut pour éviter le flash orange
    const neutralColors = {
      colorBackground: '#fefcfb',
      colorForeground: '#1a1a1a',
      colorCard: '#ffffff',
      colorCardForeground: '#1a1a1a',
      colorPrimary: '#0a0a0a',
      colorPrimaryForeground: '#fefcfb',
      colorSecondary: '#e5e5e5',
      colorSecondaryForeground: '#1a1a1a',
      colorMuted: '#f7f5f3',
      colorMutedForeground: '#71717a',
      colorAccent: '#e5e5e5',
      colorAccentForeground: '#1a1a1a',
      colorBorder: '#e4e4e7',
      colorInput: '#ffffff',
      colorRing: '#e5e5e5',
      colorGold: '#e5e5e5',
      colorGoldDark: '#d4d4d4',
      colorGoldLight: '#f5f5f5',
    };
    applyColors(neutralColors);
    console.log('[CacheInit] ⚠️ Aucun cache trouvé, utilisation de couleurs neutres');
  }
  
  // Stocker les valeurs du cache dans window pour un accès rapide côté React
  window.__OMA_CACHE__ = {
    logo: getCachedValue(CACHE_KEYS.LOGO, CACHE_KEYS.LOGO_TIMESTAMP),
    siteTitle: getCachedValue(CACHE_KEYS.SITE_TITLE, CACHE_KEYS.SITE_TITLE_TIMESTAMP),
    colors: cachedColors,
  };
})();
`.trim()
}

/**
 * Composant serveur qui injecte le script d'initialisation du cache
 * Le script s'exécute immédiatement avant le rendu React
 * Utilise un script inline dans le body pour garantir l'exécution immédiate
 */
export function CacheInitScript() {
  const script = generateCacheInitScript()

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  )
}

