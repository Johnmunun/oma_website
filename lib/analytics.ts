/**
 * @file lib/analytics.ts
 * @description Utilitaires pour l'analyse des données de visiteurs
 */

type GeoResult = { country: string | null; city: string | null }

const geoCache = new Map<string, GeoResult>()
const GEO_CACHE_MAX = 800

function isPrivateIP(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "localhost" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("127.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  )
}

function cacheGeo(ip: string, result: GeoResult): GeoResult {
  if (geoCache.size >= GEO_CACHE_MAX) {
    const first = geoCache.keys().next().value
    if (first) geoCache.delete(first)
  }
  geoCache.set(ip, result)
  return result
}

/**
 * Géolocalise le visiteur via headers Vercel/Cloudflare, sinon lookup IP public.
 */
export async function resolveVisitorGeo(
  request: { headers: Headers | { get: (key: string) => string | null } },
  ip: string | null
): Promise<GeoResult> {
  try {
    const headers = request.headers
    const vercelCountry = headers.get("x-vercel-ip-country")
    const vercelCity = headers.get("x-vercel-ip-city")
    const cfCountry = headers.get("cf-ipcountry")

    if (vercelCountry && vercelCountry !== "XX" && vercelCountry !== "T1") {
      let city: string | null = null
      if (vercelCity) {
        try {
          city = decodeURIComponent(vercelCity)
        } catch {
          city = vercelCity
        }
      }
      return { country: vercelCountry.toUpperCase(), city }
    }

    if (cfCountry && cfCountry !== "XX" && cfCountry !== "T1") {
      return { country: cfCountry.toUpperCase(), city: null }
    }

    if (!ip || isPrivateIP(ip)) return { country: null, city: null }

    const cached = geoCache.get(ip)
    if (cached) return cached

    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    })
    if (!res.ok) return cacheGeo(ip, { country: null, city: null })

    const data = await res.json()
    if (!data?.success) return cacheGeo(ip, { country: null, city: null })

    const country =
      typeof data.country_code === "string" && data.country_code.length === 2
        ? data.country_code.toUpperCase()
        : null
    const city = typeof data.city === "string" && data.city.trim() ? data.city.trim() : null

    return cacheGeo(ip, { country, city })
  } catch (err) {
    console.warn("[Analytics] Géolocalisation échouée:", err)
    return { country: null, city: null }
  }
}

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








