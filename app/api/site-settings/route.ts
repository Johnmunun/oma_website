/**
 * @file app/api/site-settings/route.ts
 * @description API publique pour récupérer les paramètres du site
 * Utilisé par le frontend (Footer, ContactSection, etc.)
 * PAS PROTÉGÉ : Accessible publiquement
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isDatabaseConnectionError } from '@/lib/db-error-handler'
import { resolveActiveHeroAnnouncement } from '@/lib/site-settings/hero-announcement'

// GET /api/site-settings
// Récupère les paramètres du site (publique)
// Cache: 60 secondes (revalidation)
export const revalidate = 60

export async function GET() {
  try {
    // Récupérer les settings et contacts en parallèle
    let setting, contact
    
    try {
      [setting, contact] = await Promise.all([
        prisma.setting.findFirst({
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
            updatedAt: true,
          },
        }),
        prisma.contact.findFirst({
          orderBy: { updatedAt: 'desc' },
          select: {
            email: true,
            telephones: true,
            facebook: true,
            instagram: true,
            youtube: true,
            twitter: true,
            linkedin: true,
            tiktok: true,
          },
        }),
      ])
    } catch (dbError: any) {
      // Si erreur de connexion, utiliser les valeurs par défaut
      if (isDatabaseConnectionError(dbError)) {
        // Logger uniquement en développement pour éviter le spam en production
        if (process.env.NODE_ENV === 'development') {
          console.warn('[API] Erreur de connexion DB (utilisation des valeurs par défaut):', dbError.code || dbError.message)
        }
        setting = null
        contact = null
      } else {
        // Pour les autres erreurs, propager
        throw dbError
      }
    }

    // Valeurs par défaut si aucun paramètre n'existe
    const defaultSettings = {
      siteTitle: 'Réseau OMA & OMA TV',
      siteDescription:
        'Plateforme internationale de formation en communication et leadership',
      logoUrl: '/placeholder-logo.png',
      coverImageUrl: null,
      heroImageUrl: null,
      aboutHeroImageUrl: null,
      primaryColor: '#D4AF37',
      secondaryColor: '#1a1a1a',
      fontFamily: 'Playfair Display',
    }

    const defaultContact = {
      email: null,
      telephones: [],
      facebook: null,
      instagram: null,
      youtube: null,
      twitter: null,
      linkedin: null,
      tiktok: 'https://www.tiktok.com/@oratoiremonarttv',
    }

    // Fusionner avec les données de la DB
    const settings = {
      ...defaultSettings,
      ...(setting || {}),
    }

    const contacts = {
      ...defaultContact,
      ...(contact || {}),
      // S'assurer que telephones est toujours un tableau
      telephones: contact?.telephones
        ? Array.isArray(contact.telephones)
          ? contact.telephones
          : []
        : [],
      // TikTok OMA TV (fallback chaîne officielle)
      tiktok:
        (contact as { tiktok?: string | null } | null)?.tiktok ||
        defaultContact.tiktok,
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

    return NextResponse.json({
      success: true,
      data: {
        ...publicSettings,
        ...contacts,
        heroAnnouncement,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    // Si c'est une erreur de connexion DB, retourner les valeurs par défaut au lieu d'une erreur 500
    if (isDatabaseConnectionError(error)) {
      const defaultSettings = {
        siteTitle: 'Réseau OMA & OMA TV',
        siteDescription: 'Plateforme internationale de formation en communication et leadership',
        logoUrl: '/placeholder-logo.png',
        coverImageUrl: null,
        heroImageUrl: null,
      aboutHeroImageUrl: null,
        primaryColor: '#D4AF37',
        secondaryColor: '#1a1a1a',
        fontFamily: 'Playfair Display',
        email: null,
        telephones: [],
        facebook: null,
        instagram: null,
        youtube: null,
        twitter: null,
        linkedin: null,
        tiktok: 'https://www.tiktok.com/@oratoiremonarttv',
        heroAnnouncement: null,
      }
      
      return NextResponse.json({
        success: true,
        data: defaultSettings,
        warning: 'Base de données temporairement indisponible, valeurs par défaut utilisées',
      })
    }
    
    console.error('[API] Erreur GET site-settings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}
