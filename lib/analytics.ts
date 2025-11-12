/**
 * @file lib/analytics.ts
 * @description Utilitaires pour l'analyse des données de visiteurs
 */

/**
 * Détecte le type d'appareil à partir du User-Agent
 */
export function detectDevice(userAgent: string | null): string | null {
  if (!userAgent) return null
  
  const ua = userAgent.toLowerCase()
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

/**
 * Détecte le navigateur à partir du User-Agent
 */
export function detectBrowser(userAgent: string | null): string | null {
  if (!userAgent) return null
  
  const ua = userAgent.toLowerCase()
  if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome'
  if (ua.includes('firefox')) return 'Firefox'
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari'
  if (ua.includes('edg')) return 'Edge'
  if (ua.includes('opera') || ua.includes('opr')) return 'Opera'
  if (ua.includes('msie') || ua.includes('trident')) return 'IE'
  return 'Unknown'
}

/**
 * Détecte le système d'exploitation à partir du User-Agent
 */
export function detectOS(userAgent: string | null): string | null {
  if (!userAgent) return null
  
  const ua = userAgent.toLowerCase()
  if (ua.includes('windows')) return 'Windows'
  if (ua.includes('mac os') || ua.includes('macos')) return 'macOS'
  if (ua.includes('linux') && !ua.includes('android')) return 'Linux'
  if (ua.includes('android')) return 'Android'
  if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS'
  return 'Unknown'
}

/**
 * Extrait l'adresse IP réelle du client (gère les proxies et load balancers)
 */
export function getClientIP(request: Request | { headers: Headers | { get: (key: string) => string | null } }): string | null {
  const headers = 'headers' in request ? request.headers : new Headers()
  
  // Vérifier les headers de proxy courants
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Prendre la première IP (l'IP originale du client)
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  const cfConnectingIP = headers.get('cf-connecting-ip') // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // En développement local, on peut utiliser une valeur par défaut
  if (process.env.NODE_ENV === 'development') {
    return '127.0.0.1'
  }
  
  return null
}

/**
 * Génère un ID de session unique
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}







