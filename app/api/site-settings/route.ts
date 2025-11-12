/**
 * @file app/api/site-settings/route.ts
 * @description API publique pour récupérer les paramètres du site
 * Utilisé par le frontend (Footer, ContactSection, etc.)
 * PAS PROTÉGÉ : Accessible publiquement
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/site-settings
// Récupère les paramètres du site (publique)
// Cache: 60 secondes (revalidation)
export const revalidate = 60

export async function GET() {
  try {
    // Récupérer les settings et contacts en parallèle
    const [setting, contact] = await Promise.all([
      prisma.setting.findFirst({
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.contact.findFirst({
        orderBy: { updatedAt: 'desc' },
      })
    ])

    // Valeurs par défaut si aucun paramètre n'existe
    const defaultSettings = {
      siteTitle: 'Réseau OMA & OMA TV',
      siteDescription:
        'Plateforme internationale de formation en communication et leadership',
      logoUrl: '/placeholder-logo.png',
      coverImageUrl: null,
      heroImageUrl: null,
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
    }

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        ...contacts,
      },
    })
  } catch (error) {
    console.error('[API] Erreur GET site-settings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}
