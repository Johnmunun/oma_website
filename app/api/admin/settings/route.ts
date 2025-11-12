/**
 * @file app/api/admin/settings/route.ts
 * @description API routes pour gérer les paramètres du site
 * GET: Récupère les settings
 * PUT: Met à jour les settings
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour les settings
// logoUrl peut être une URL complète ou un chemin relatif
const logoUrlSchema = z.preprocess(
  (val) => {
    // Convertir chaînes vides en null
    if (!val || val === '') return null
    return val
  },
  z.union([
    z.null(),
    z.undefined(),
    z.string().refine(
      (val) => {
        if (!val) return true
        // Accepter soit une URL complète, soit un chemin relatif
        try {
          new URL(val) // Si c'est une URL valide
          return true
        } catch {
          // Sinon, vérifier si c'est un chemin relatif
          return val.startsWith('/')
        }
      },
      { message: 'Doit être une URL complète (https://...) ou un chemin relatif (/path/to/image.png)' }
    ),
  ]).optional().nullable()
)

const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable()

const settingSchema = z.object({
  siteTitle: z.string().min(1).max(200),
  siteDescription: z.string().max(500).optional().nullable(),
  logoUrl: logoUrlSchema,
  coverImageUrl: logoUrlSchema, // Photo de couverture pour la bannière
  heroImageUrl: logoUrlSchema, // Image de fond pour la section hero
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  fontFamily: z.string().min(1).max(100),
  
  // Couleurs shadcn dynamiques
  colorBackground: colorSchema,
  colorForeground: colorSchema,
  colorCard: colorSchema,
  colorCardForeground: colorSchema,
  colorPrimary: colorSchema,
  colorPrimaryForeground: colorSchema,
  colorSecondary: colorSchema,
  colorSecondaryForeground: colorSchema,
  colorMuted: colorSchema,
  colorMutedForeground: colorSchema,
  colorAccent: colorSchema,
  colorAccentForeground: colorSchema,
  colorBorder: colorSchema,
  colorInput: colorSchema,
  colorRing: colorSchema,
  colorGold: colorSchema,
  colorGoldDark: colorSchema,
  colorGoldLight: colorSchema,
  
  // Paramètres SMTP (optionnels)
  smtpHost: z.string().max(200).optional().nullable(),
  smtpPort: z.string().max(10).optional().nullable(),
  smtpSecure: z.string().optional().nullable(),
  smtpUser: z.string().email().max(200).optional().nullable(),
  smtpPass: z.string().max(500).optional().nullable(), // Mot de passe, peut être vide si non modifié
  
  // Paramètres de sécurité
  idleTimeoutMinutes: z.number().int().min(5).max(120).optional().nullable(), // Temps d'inactivité en minutes (5-120)
  wakeUpPingIntervalMinutes: z.number().int().min(1).max(60).optional().nullable(), // Intervalle wake-up ping en minutes (1-60)
})

// GET /api/admin/settings
// Récupère les paramètres du site
export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Récupérer les settings
    let setting = await prisma.setting.findFirst({
      orderBy: { updatedAt: 'desc' },
    })

    // Récupérer les paramètres SMTP depuis SiteSetting
    const smtpSettings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user'],
        },
      },
    })

    const smtpMap: Record<string, string> = {}
    smtpSettings.forEach((s: { key: string; value: string }) => {
      smtpMap[s.key] = s.value
    })

    // Si aucun setting n'existe, créer avec les valeurs par défaut
    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          siteTitle: 'Réseau OMA & OMA TV',
          siteDescription:
            'Plateforme internationale de formation en communication et leadership',
          logoUrl: '/placeholder-logo.png',
          primaryColor: '#f97316',
          secondaryColor: '#1a1a1a',
          fontFamily: 'Playfair Display',
          // Couleurs shadcn dynamiques par défaut
          colorBackground: '#fefcfb',
          colorForeground: '#1a1a1a',
          colorCard: '#ffffff',
          colorCardForeground: '#1a1a1a',
          colorPrimary: '#0a0a0a',
          colorPrimaryForeground: '#fefcfb',
          colorSecondary: '#f97316',
          colorSecondaryForeground: '#1a1a1a',
          colorMuted: '#f7f5f3',
          colorMutedForeground: '#71717a',
          colorAccent: '#f97316',
          colorAccentForeground: '#1a1a1a',
          colorBorder: '#e4e4e7',
          colorInput: '#ffffff',
          colorRing: '#f97316',
          colorGold: '#f97316',
          colorGoldDark: '#ea580c',
          colorGoldLight: '#fb923c',
          idleTimeoutMinutes: 15, // Valeur par défaut: 15 minutes
          wakeUpPingIntervalMinutes: 5, // Valeur par défaut: 5 minutes
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...setting,
        smtpHost: smtpMap.smtp_host || '',
        smtpPort: smtpMap.smtp_port || '587',
        smtpSecure: smtpMap.smtp_secure || 'false',
        smtpUser: smtpMap.smtp_user || '',
        // Ne pas retourner le mot de passe pour des raisons de sécurité
      },
    })
  } catch (error) {
    console.error('[API] Erreur GET settings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/settings
// Met à jour les paramètres du site
export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (seuls ADMIN peuvent modifier)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Seuls les administrateurs peuvent modifier les paramètres.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Nettoyer logoUrl, coverImageUrl et heroImageUrl avant validation (accepter chemins relatifs)
    const cleanedBody = {
      ...body,
      logoUrl: body.logoUrl && body.logoUrl.trim() ? body.logoUrl.trim() : null,
      coverImageUrl: body.coverImageUrl && body.coverImageUrl.trim() ? body.coverImageUrl.trim() : null,
      heroImageUrl: body.heroImageUrl && body.heroImageUrl.trim() ? body.heroImageUrl.trim() : null,
    }

    // Valider les données
    const validatedData = settingSchema.parse(cleanedBody)

    // Séparer les settings généraux des paramètres SMTP
    const {
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPass,
      ...generalSettings
    } = validatedData

    // Mettre à jour ou créer les settings généraux
    let setting = await prisma.setting.findFirst({
      orderBy: { updatedAt: 'desc' },
    })

    if (setting) {
      setting = await prisma.setting.update({
        where: { id: setting.id },
        data: generalSettings,
      })
    } else {
      setting = await prisma.setting.create({
        data: generalSettings,
      })
    }

    // Mettre à jour les paramètres SMTP dans SiteSetting
    const smtpUpdates = []
    if (smtpHost !== undefined) {
      smtpUpdates.push(
        prisma.siteSetting.upsert({
          where: { key: 'smtp_host' },
          update: { value: smtpHost || 'smtp.gmail.com' },
          create: { key: 'smtp_host', value: smtpHost || 'smtp.gmail.com' },
        })
      )
    }
    if (smtpPort !== undefined) {
      smtpUpdates.push(
        prisma.siteSetting.upsert({
          where: { key: 'smtp_port' },
          update: { value: smtpPort || '587' },
          create: { key: 'smtp_port', value: smtpPort || '587' },
        })
      )
    }
    if (smtpSecure !== undefined) {
      smtpUpdates.push(
        prisma.siteSetting.upsert({
          where: { key: 'smtp_secure' },
          update: { value: smtpSecure || 'false' },
          create: { key: 'smtp_secure', value: smtpSecure || 'false' },
        })
      )
    }
    if (smtpUser !== undefined) {
      smtpUpdates.push(
        prisma.siteSetting.upsert({
          where: { key: 'smtp_user' },
          update: { value: smtpUser || '' },
          create: { key: 'smtp_user', value: smtpUser || '' },
        })
      )
    }
    // Ne mettre à jour le mot de passe que s'il est fourni (non vide)
    if (smtpPass !== undefined && smtpPass !== null && smtpPass !== '') {
      smtpUpdates.push(
        prisma.siteSetting.upsert({
          where: { key: 'smtp_pass' },
          update: { value: smtpPass },
          create: { key: 'smtp_pass', value: smtpPass },
        })
      )
    }

    if (smtpUpdates.length > 0) {
      await prisma.$transaction(smtpUpdates)
      
      // Invalider le cache SMTP
      const { invalidateSMTPCache } = await import('@/lib/nodemailer')
      invalidateSMTPCache()
    }

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'settings.update',
        target: 'Setting',
        payload: validatedData,
      },
    })

    // Dispatcher un événement pour mettre à jour les couleurs côté client
    // (sera géré par le composant DynamicColors)

    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      data: setting,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur PUT settings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

