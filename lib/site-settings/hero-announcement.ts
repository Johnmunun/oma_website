/**
 * Logique partagée pour l'annonce défilante du hero (expiration côté serveur).
 */

export type HeroAnnouncementInput = {
  heroAnnouncementEnabled?: boolean | null
  heroAnnouncementText?: string | null
  heroAnnouncementLink?: string | null
  heroAnnouncementPublishedAt?: Date | string | null
  heroAnnouncementExpiryHours?: number | null
}

export type ActiveHeroAnnouncement = {
  text: string
  link: string | null
  expiresAt: string
}

const DEFAULT_EXPIRY_HOURS = 24

export function resolveActiveHeroAnnouncement(
  input: HeroAnnouncementInput | null | undefined,
  now: Date = new Date()
): ActiveHeroAnnouncement | null {
  if (!input?.heroAnnouncementEnabled) return null

  const text = input.heroAnnouncementText?.trim()
  if (!text) return null

  const publishedAt = input.heroAnnouncementPublishedAt
    ? new Date(input.heroAnnouncementPublishedAt)
    : null
  if (!publishedAt || Number.isNaN(publishedAt.getTime())) return null

  const expiryHours = input.heroAnnouncementExpiryHours ?? DEFAULT_EXPIRY_HOURS
  const expiresAt = new Date(publishedAt.getTime() + expiryHours * 3600_000)

  if (now.getTime() >= expiresAt.getTime()) return null

  const link = input.heroAnnouncementLink?.trim() || null

  return {
    text,
    link,
    expiresAt: expiresAt.toISOString(),
  }
}
