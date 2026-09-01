/**
 * @file app/api/admin/media/route.ts
 * @description API routes pour gérer les médias (admin)
 * GET: Récupère tous les médias
 * POST: Crée un nouveau média (lien YouTube, Facebook, etc.)
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { resolveMediaMeta } from '@/lib/media-thumbnails'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'

const emptyToNull = (val: unknown) =>
  val === '' || val === undefined ? null : val

// Schéma de validation pour créer un média
const createMediaSchema = z.object({
  url: z.string().url('URL invalide'),
  type: z.enum(['IMAGE', 'VIDEO', 'FILE']),
  title: z.preprocess(emptyToNull, z.string().max(200).nullable().optional()),
  description: z.preprocess(emptyToNull, z.string().max(1000).nullable().optional()),
  platform: z.preprocess(emptyToNull, z.string().max(50).nullable().optional()),
  thumbnailUrl: z.preprocess(emptyToNull, z.string().url('URL de miniature invalide').nullable().optional()),
  alt: z.preprocess(emptyToNull, z.string().max(200).nullable().optional()),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  folder: z.preprocess(emptyToNull, z.string().max(100).nullable().optional()),
  eventId: z.preprocess(emptyToNull, z.string().uuid().nullable().optional()),
  order: z.number().int().min(0).default(0).optional(),
  isPublished: z.boolean().default(true).optional(),
})

// GET /api/admin/media
// Récupère tous les médias
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await requirePermission('media.view')
    if (isPermissionDenied(session)) return session

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const platform = searchParams.get('platform')
    const eventId = searchParams.get('eventId')
    const search = searchParams.get('search')

    // Construire les filtres
    const where: any = {}
    if (type && type !== 'all') {
      where.type = type
    }
    if (platform && platform !== 'all') {
      where.platform = platform
    }
    if (eventId) {
      where.eventId = eventId
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Récupérer tous les médias
    const media = await prisma.media.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: media,
    })
  } catch (error) {
    console.error('[API] Erreur GET media:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des médias' },
      { status: 500 }
    )
  }
}

// POST /api/admin/media
// Crée un nouveau média
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await requirePermission('media.upload')
    if (isPermissionDenied(session)) return session

    const body = await request.json()

    // Valider les données
    const validatedData = createMediaSchema.parse(body)

    // Détecter plateforme + générer miniature (YouTube / TikTok / Instagram…)
    const meta = await resolveMediaMeta(validatedData.url)
    const platform = validatedData.platform || meta.platform
    const thumbnailUrl = validatedData.thumbnailUrl || meta.thumbnailUrl
    const title = validatedData.title || meta.title || null

    // Créer le média
    const media = await prisma.media.create({
      data: {
        ...validatedData,
        title,
        platform,
        thumbnailUrl,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'media.create',
        target: 'Media',
        payload: { id: media.id, url: media.url, platform: media.platform },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Média créé avec succès',
      data: media,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur POST media:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du média' },
      { status: 500 }
    )
  }
}







