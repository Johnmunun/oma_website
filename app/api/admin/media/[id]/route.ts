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

// Fonction pour extraire l'ID d'une vidéo YouTube (améliorée)
function extractYouTubeId(url: string): string | null {
  if (!url) return null
  
  // Nettoyer l'URL
  const cleanUrl = url.trim()
  
  // Patterns pour différents formats d'URL YouTube
  const patterns = [
    // https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // https://youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // https://www.youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // https://www.youtube.com/v/VIDEO_ID
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    // https://www.youtube.com/watch?v=VIDEO_ID&feature=...
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    // Format court avec paramètres
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\?|&|$)/,
  ]
  
  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern)
    if (match && match[1] && match[1].length === 11) {
      console.log('[Media] ID YouTube extrait:', match[1], 'depuis:', cleanUrl)
      return match[1]
    }
  }
  
  console.warn('[Media] Impossible d\'extraire l\'ID YouTube de:', cleanUrl)
  return null
}

// Fonction pour générer une miniature YouTube
function getYouTubeThumbnail(videoId: string): string {
  // maxresdefault.jpg est la meilleure qualité, mais peut ne pas exister pour toutes les vidéos
  // On peut aussi utiliser hqdefault.jpg ou mqdefault.jpg comme fallback
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

    // Détecter automatiquement la plateforme et générer la miniature si l'URL change
    let platform = validatedData.platform || existingMedia.platform
    let thumbnailUrl = validatedData.thumbnailUrl || existingMedia.thumbnailUrl

    if (validatedData.url) {
      const url = validatedData.url.toLowerCase()
      
      // Si l'URL a changé ou si c'est YouTube, régénérer la miniature
      const urlChanged = validatedData.url !== existingMedia.url
      
      // Détecter YouTube
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        if (!platform) {
          platform = 'youtube'
        }
        // Régénérer la miniature si l'URL a changé ou si elle n'existe pas
        if (urlChanged || !thumbnailUrl) {
          const videoId = extractYouTubeId(validatedData.url)
          if (videoId) {
            thumbnailUrl = getYouTubeThumbnail(videoId)
            console.log('[Media] Miniature YouTube régénérée:', thumbnailUrl)
          }
        }
      } else if (url.includes('facebook.com') && !platform) {
        platform = 'facebook'
      } else if (url.includes('instagram.com') && !platform) {
        platform = 'instagram'
      } else if ((url.includes('twitter.com') || url.includes('x.com')) && !platform) {
        platform = 'twitter'
      } else if (url.includes('linkedin.com') && !platform) {
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







