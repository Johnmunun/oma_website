/**
 * @file app/api/site-settings/route.ts
 * @description API publique pour récupérer les paramètres du site
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isDatabaseConnectionError } from '@/lib/db-error-handler'
import { isAuthzRecoverableError } from '@/lib/authz/schema'
import { resolveActiveHeroAnnouncement } from '@/lib/site-settings/hero-announcement'

export const revalidate = 60

const DEFAULT_SETTINGS = {
  siteTitle: 'Réseau OMA & OMA TV',
  siteDescription:
    'Plateforme internationale de formation en communication et leadership',
  logoUrl: '/placeholder-logo.png',
  coverImageUrl: null as string | null,
  heroImageUrl: null as string | null,
  aboutHeroImageUrl: null as string | null,
  primaryColor: '#D4AF37',
  secondaryColor: '#1a1a1a',
  fontFamily: 'Playfair Display',
}

const DEFAULT_CONTACT = {
  email: null as string | null,
  telephones: [] as string[],
  facebook: null as string | null,
  instagram: null as string | null,
  youtube: null as string | null,
  twitter: null as string | null,
  linkedin: null as string | null,
  tiktok: 'https://www.tiktok.com/@oratoiremonarttv',
}

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
}

function isRecoverableDbError(error: unknown): boolean {
  return isDatabaseConnectionError(error) || isAuthzRecoverableError(error)
}

function jsonOk(data: Record<string, unknown>, warning?: string) {
  return NextResponse.json(
    { success: true, data, ...(warning ? { warning } : {}) },
    { headers: CACHE_HEADERS }
  )
}

export async function GET() {
  try {
    let setting: Record<string, unknown> | null = null
    let contact: {
      email?: string | null
      telephones?: unknown
      facebook?: string | null
      instagram?: string | null
      youtube?: string | null
      twitter?: string | null
      linkedin?: string | null
    } | null = null

    try {
      setting = (await prisma.setting.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: {
          siteTitle: true,
          siteDescription: true,
          logoUrl: true,
          coverImageUrl: true,
          heroImageUrl: true,
          aboutHeroImageUrl: true,
          primaryColor: true,
          secondaryColor: true,
          fontFamily: true,
          heroAnnouncementEnabled: true,
          heroAnnouncementText: true,
          heroAnnouncementLink: true,
          heroAnnouncementPublishedAt: true,
          heroAnnouncementExpiryHours: true,
        },
      })) as Record<string, unknown> | null
    } catch (error) {
      if (!isRecoverableDbError(error)) {
        console.error('[API] site-settings Setting:', error)
      }
      try {
        setting = (await prisma.setting.findFirst({
          orderBy: { updatedAt: 'desc' },
        })) as Record<string, unknown> | null
      } catch (fallbackError) {
        if (!isRecoverableDbError(fallbackError)) {
          console.error('[API] site-settings Setting fallback:', fallbackError)
        }
        setting = null
      }
    }

    try {
      contact = await prisma.contact.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: {
          email: true,
          telephones: true,
          facebook: true,
          instagram: true,
          youtube: true,
          twitter: true,
          linkedin: true,
        },
      })
    } catch (error) {
      if (!isRecoverableDbError(error)) {
        console.error('[API] site-settings Contact:', error)
      }
      contact = null
    }

    const settings = {
      ...DEFAULT_SETTINGS,
      ...(setting || {}),
    }

    const contacts = {
      ...DEFAULT_CONTACT,
      ...(contact || {}),
      telephones: Array.isArray(contact?.telephones) ? contact.telephones : [],
      tiktok: DEFAULT_CONTACT.tiktok,
    }

    const heroAnnouncement = resolveActiveHeroAnnouncement(setting)

    const {
      heroAnnouncementEnabled: _enabled,
      heroAnnouncementText: _text,
      heroAnnouncementLink: _link,
      heroAnnouncementPublishedAt: _publishedAt,
      heroAnnouncementExpiryHours: _expiryHours,
      ...publicSettings
    } = settings as Record<string, unknown>

    return jsonOk({
      ...publicSettings,
      ...contacts,
      heroAnnouncement,
    })
  } catch (error) {
    console.error('[API] Erreur GET site-settings:', error)
    return jsonOk(
      { ...DEFAULT_SETTINGS, ...DEFAULT_CONTACT, heroAnnouncement: null },
      'Paramètres temporairement indisponibles'
    )
  }
}
