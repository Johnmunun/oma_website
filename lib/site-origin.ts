/**
 * Origine canonique du site (liens publics, SEO, emails).
 * En prod, ignore les hôtes éphémères (*.vercel.app) si NEXT_PUBLIC_SITE_DOMAIN est défini.
 */

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, '')
}

function normalizeDomain(raw: string | undefined | null): string | null {
  const d = raw?.trim()
  if (!d) return null
  return d.replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase()
}

export function isEphemeralPublicHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.vercel.app') ||
    host.endsWith('.netlify.app') ||
    host.endsWith('.pages.dev')
  )
}

/**
 * URL absolue de base du site (sans slash final).
 * Ex. https://oratoiremonart.org
 */
export function getMainSiteOrigin(): string {
  const domain = normalizeDomain(process.env.NEXT_PUBLIC_SITE_DOMAIN)
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const url = configuredUrl ? stripTrailingSlash(configuredUrl) : null

  if (url) {
    try {
      const host = new URL(url).hostname
      // Prod / preview Vercel : ne pas exposer *.vercel.app si le vrai domaine est configuré
      if (domain && isEphemeralPublicHost(host)) {
        return `https://${domain}`
      }
      return url
    } catch {
      // ignore invalid URL
    }
  }

  if (domain) return `https://${domain}`

  return 'http://localhost:3000'
}

export function getMainSiteDomain(): string | null {
  return normalizeDomain(process.env.NEXT_PUBLIC_SITE_DOMAIN)
}
