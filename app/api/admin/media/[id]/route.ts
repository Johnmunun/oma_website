/**
 * @file app/api/admin/media/[id]/route.ts
 * @description API routes pour gérer un média spécifique (admin)
 * GET: Récupère un média
 * PUT: Met à jour un média
 * DELETE: Supprime un média
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { resolveMediaMeta } from '@/lib/media-thumbnails'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'
import { auth } from '@/auth'
import { requireAuth, requireAdmin } from '@/lib/authz/guards'

const emptyToNull = (val: unknown) =>
  val === '' || val === undefined ? null : val

// Schéma de validation pour la mise à jour
const updateMediaSchema = z.object({
  url: z.string().url('URL invalide').optional(),
  type: z.enum(['IMAGE', 'VIDEO', 'FILE']).optional(),
  title: z.preprocess(emptyToNull, z.string().max(200).nullable().optional()),
  description: z.preprocess(emptyToNull, z.string().max(1000).nullable().optional()),
  platform: z.preprocess(emptyToNull, z.string().max(50).nullable().optional()),
  thumbnailUrl: z.preprocess(emptyToNull, z.string().url('URL de miniature invalide').nullable().optional()),
  alt: z.preprocess(emptyToNull, z.string().max(200).nullable().optional()),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  folder: z.preprocess(emptyToNull, z.string().max(100).nullable().optional()),
  eventId: z.preprocess(emptyToNull, z.string().uuid().nullable().optional()),
  order: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
})

// GET /api/admin/media/[id]
// Récupère un média spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Vérifier l'authentification
    const session = await requirePermission('media.view')
    if (isPermissionDenied(session)) return session

    const media = await prisma.media.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Vérifier l'authentification
    const session = await requirePermission('media.upload')
    if (isPermissionDenied(session)) return session

    const body = await request.json()

    // Valider les données
    const validatedData = updateMediaSchema.parse(body)

    // Vérifier que le média existe
    const existingMedia = await prisma.media.findUnique({
      where: { id },
    })

    if (!existingMedia) {
      return NextResponse.json(
        { success: false, error: 'Média non trouvé' },
        { status: 404 }
      )
    }

    // Détecter plateforme + miniature si URL fournie / manquante
    let platform = validatedData.platform ?? existingMedia.platform
    let thumbnailUrl = validatedData.thumbnailUrl ?? existingMedia.thumbnailUrl
    let title = validatedData.title !== undefined ? validatedData.title : existingMedia.title

    const urlToResolve = validatedData.url || existingMedia.url
    const urlChanged = Boolean(validatedData.url && validatedData.url !== existingMedia.url)
    const needsThumb = urlChanged || !thumbnailUrl

    if (urlToResolve && (needsThumb || !platform)) {
      const meta = await resolveMediaMeta(urlToResolve)
      if (!platform) platform = meta.platform
      if (needsThumb && meta.thumbnailUrl) thumbnailUrl = meta.thumbnailUrl
      if ((!title || title === '') && meta.title) title = meta.title
    }

    // Mettre à jour le média
    const media = await prisma.media.update({
      where: { id },
      data: {
        ...validatedData,
        ...(title !== undefined && { title }),
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
        payload: { id, ...validatedData },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Vérifier l'authentification
    const session = await auth()
    const authError = requireAuth(session)
    if (authError) return authError
    const adminError = requireAdmin(session!)
    if (adminError) return adminError

    // Vérifier que le média existe
    const existingMedia = await prisma.media.findUnique({
      where: { id },
    })

    if (!existingMedia) {
      return NextResponse.json(
        { success: false, error: 'Média non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le média
    await prisma.media.delete({
      where: { id },
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: 'media.delete',
        target: 'Media',
        payload: { id },
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







