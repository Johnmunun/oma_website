/**
 * Cache client partagé pour /api/site-settings — 1 fetch pour toute la page.
 */

export type PublicSiteSettings = {
  siteTitle?: string
  siteDescription?: string
  logoUrl?: string | null
  coverImageUrl?: string | null
  heroImageUrl?: string | null
  aboutHeroImageUrl?: string | null
  primaryColor?: string
  secondaryColor?: string
  fontFamily?: string
  email?: string | null
  telephones?: string[]
  facebook?: string | null
  instagram?: string | null
  youtube?: string | null
  twitter?: string | null
  linkedin?: string | null
  tiktok?: string | null
  heroAnnouncement?: {
    text: string
    link: string | null
    expiresAt: string
  } | null
  [key: string]: unknown
}

type CacheEntry = {
  data: PublicSiteSettings | null
  promise: Promise<PublicSiteSettings | null> | null
  fetchedAt: number
}

const TTL_MS = 60_000
const cache: CacheEntry = { data: null, promise: null, fetchedAt: 0 }

export async function getPublicSiteSettings(
  force = false
): Promise<PublicSiteSettings | null> {
  const now = Date.now()
  if (!force && cache.data && now - cache.fetchedAt < TTL_MS) {
    return cache.data
  }
  if (!force && cache.promise) {
    return cache.promise
  }

  cache.promise = (async () => {
    try {
      const res = await fetch('/api/site-settings')
      if (!res.ok) return cache.data
      const json = await res.json()
      if (json.success && json.data) {
        cache.data = json.data as PublicSiteSettings
        cache.fetchedAt = Date.now()
        return cache.data
      }
      return cache.data
    } catch {
      return cache.data
    } finally {
      cache.promise = null
    }
  })()

  return cache.promise
}

export function invalidatePublicSiteSettingsCache() {
  cache.data = null
  cache.promise = null
  cache.fetchedAt = 0
}
