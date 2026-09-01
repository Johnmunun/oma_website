/**
 * @file app/api/site-settings/route.ts
 * @description API publique pour récupérer les paramètres du site
 * Utilisé par le frontend (Footer, ContactSection, etc.)
 * PAS PROTÉGÉ : Accessible publiquement
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleDatabaseError, isDatabaseConnectionError } from '@/lib/db-error-handler'

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
        }),
        prisma.contact.findFirst({
          orderBy: { updatedAt: 'desc' },
        })
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

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        ...contacts,
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
