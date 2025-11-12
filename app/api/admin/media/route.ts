/**
 * @file app/api/admin/media/route.ts
 * @description API routes pour gérer les médias (admin)
 * GET: Récupère tous les médias
 * POST: Crée un nouveau média (lien YouTube, Facebook, etc.)
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour créer un média
const createMediaSchema = z.object({
  url: z.string().url('URL invalide'),
  type: z.enum(['IMAGE', 'VIDEO', 'FILE']),
  title: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  platform: z.string().max(50).optional().nullable(), // youtube, facebook, instagram, etc.
  thumbnailUrl: z.string().url('URL de miniature invalide').optional().nullable(),
  alt: z.string().max(200).optional().nullable(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  folder: z.string().max(100).optional().nullable(),
  eventId: z.string().uuid().optional().nullable(),
  order: z.number().int().min(0).default(0).optional(),
  isPublished: z.boolean().default(true).optional(),
})

// Fonction pour extraire l'ID d'une vidéo YouTube
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

// Fonction pour générer une miniature YouTube
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

// GET /api/admin/media
// Récupère tous les médias
export async function GET(request: NextRequest) {
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

    const body = await request.json()

    // Valider les données
    const validatedData = createMediaSchema.parse(body)

    // Détecter automatiquement la plateforme si non fournie
    let platform = validatedData.platform
    let thumbnailUrl = validatedData.thumbnailUrl

    if (!platform && validatedData.url) {
      const url = validatedData.url.toLowerCase()
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        platform = 'youtube'
        // Générer automatiquement la miniature YouTube
        const videoId = extractYouTubeId(validatedData.url)
        if (videoId && !thumbnailUrl) {
          thumbnailUrl = getYouTubeThumbnail(videoId)
        }
      } else if (url.includes('facebook.com')) {
        platform = 'facebook'
      } else if (url.includes('instagram.com')) {
        platform = 'instagram'
      } else if (url.includes('twitter.com') || url.includes('x.com')) {
        platform = 'twitter'
      } else if (url.includes('linkedin.com')) {
        platform = 'linkedin'
      }
    }

    // Créer le média
    const media = await prisma.media.create({
      data: {
        ...validatedData,
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







