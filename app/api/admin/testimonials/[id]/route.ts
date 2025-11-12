/**
 * @file app/api/admin/testimonials/[id]/route.ts
 * @description API routes pour gérer un témoignage spécifique (admin)
 * GET: Récupère un témoignage
 * PUT: Met à jour un témoignage
 * DELETE: Supprime un témoignage
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour la mise à jour
const updateTestimonialSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  role: z.string().max(200).optional().nullable(),
  content: z.string().min(10).max(1000).optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional(),
  status: z.enum(['PENDING', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'REJECTED']).optional(),
})

// GET /api/admin/testimonials/[id]
// Récupère un témoignage spécifique
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

    const testimonial = await prisma.testimonial.findUnique({
      where: { id: params.id },
    })

    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: 'Témoignage non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: testimonial,
    })
  } catch (error) {
    console.error('[API] Erreur GET testimonial:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du témoignage' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/testimonials/[id]
// Met à jour un témoignage
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
    const validatedData = updateTestimonialSchema.parse(body)

    // Vérifier que le témoignage existe
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id: params.id },
    })

    if (!existingTestimonial) {
      return NextResponse.json(
        { success: false, error: 'Témoignage non trouvé' },
        { status: 404 }
      )
    }

    // Préparer les données de mise à jour
    const updateData: any = { ...validatedData }

    // Si le statut passe à APPROVED ou PUBLISHED, enregistrer la date d'approbation
    if (validatedData.status === 'APPROVED' || validatedData.status === 'PUBLISHED') {
      if (!existingTestimonial.approvedAt) {
        updateData.approvedAt = new Date()
      }
    }

    // Mettre à jour le témoignage
    const testimonial = await prisma.testimonial.update({
      where: { id: params.id },
      data: updateData,
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'testimonial.update',
        target: 'Testimonial',
        payload: { id: params.id, ...validatedData },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Témoignage mis à jour avec succès',
      data: testimonial,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur PUT testimonial:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du témoignage' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/testimonials/[id]
// Supprime un témoignage
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

    // Vérifier que le témoignage existe
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id: params.id },
    })

    if (!existingTestimonial) {
      return NextResponse.json(
        { success: false, error: 'Témoignage non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le témoignage
    await prisma.testimonial.delete({
      where: { id: params.id },
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'testimonial.delete',
        target: 'Testimonial',
        payload: { id: params.id },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Témoignage supprimé avec succès',
    })
  } catch (error) {
    console.error('[API] Erreur DELETE testimonial:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du témoignage' },
      { status: 500 }
    )
  }
}

