/**
 * @file app/api/admin/media/[id]/route.ts
 * @description API routes pour gérer un média spécifique (admin)
 * GET: Récupère un média
 * PUT: Met à jour un média
 * DELETE: Supprime un média
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour la mise à jour
const updateMediaSchema = z.object({
  url: z.string().url('URL invalide').optional(),
  type: z.enum(['IMAGE', 'VIDEO', 'FILE']).optional(),
  title: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  platform: z.string().max(50).optional().nullable(),
  thumbnailUrl: z.string().url('URL de miniature invalide').optional().nullable(),
  alt: z.string().max(200).optional().nullable(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  folder: z.string().max(100).optional().nullable(),
  eventId: z.string().uuid().optional().nullable(),
  order: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
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

// GET /api/admin/media/[id]
// Récupère un média spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const media = await prisma.media.findUnique({
      where: { id: params.id },
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

    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Média non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: media,
    })
  } catch (error) {
    console.error('[API] Erreur GET media:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du média' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/media/[id]
// Met à jour un média
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = updateMediaSchema.parse(body)

    // Vérifier que le média existe
    const existingMedia = await prisma.media.findUnique({
      where: { id: params.id },
    })

    if (!existingMedia) {
      return NextResponse.json(
        { success: false, error: 'Média non trouvé' },
        { status: 404 }
      )
    }

    // Détecter automatiquement la plateforme si l'URL change
    let platform = validatedData.platform
    let thumbnailUrl = validatedData.thumbnailUrl

    if (validatedData.url && !platform) {
      const url = validatedData.url.toLowerCase()
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        platform = 'youtube'
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

    // Mettre à jour le média
    const media = await prisma.media.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        ...(platform && { platform }),
        ...(thumbnailUrl && { thumbnailUrl }),
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
        action: 'media.update',
        target: 'Media',
        payload: { id: params.id, ...validatedData },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Média mis à jour avec succès',
      data: media,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur PUT media:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du média' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/media/[id]
// Supprime un média
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (seuls ADMIN peuvent supprimer)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Seuls les administrateurs peuvent supprimer.' },
        { status: 403 }
      )
    }

    // Vérifier que le média existe
    const existingMedia = await prisma.media.findUnique({
      where: { id: params.id },
    })

    if (!existingMedia) {
      return NextResponse.json(
        { success: false, error: 'Média non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le média
    await prisma.media.delete({
      where: { id: params.id },
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'media.delete',
        target: 'Media',
        payload: { id: params.id },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Média supprimé avec succès',
    })
  } catch (error) {
    console.error('[API] Erreur DELETE media:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du média' },
      { status: 500 }
    )
  }
}






