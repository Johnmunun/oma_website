/**
 * @file app/api/testimonials/submit/route.ts
 * @description API route publique pour soumettre un témoignage via token
 * POST: Soumet un témoignage avec validation du token
 * PUBLIC : Accessible avec un token valide
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour la soumission
const submitTestimonialSchema = z.object({
  token: z.string().min(1),
  content: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5).default(5),
  photoUrl: z.string().url().optional().nullable(),
})

// POST /api/testimonials/submit
// Soumet un témoignage via token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = submitTestimonialSchema.parse(body)

    // Vérifier que le token existe et est valide
    const testimonial = await prisma.testimonial.findUnique({
      where: { token: validatedData.token },
    })

    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 404 }
      )
    }

    // Vérifier que le token n'est pas expiré
    if (testimonial.tokenExpiresAt && new Date() > testimonial.tokenExpiresAt) {
      return NextResponse.json(
        { success: false, error: 'Le lien de formulaire a expiré' },
        { status: 410 }
      )
    }

    // Vérifier que le témoignage n'a pas déjà été soumis
    if (testimonial.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Ce témoignage a déjà été soumis' },
        { status: 409 }
      )
    }

    // Mettre à jour le témoignage avec les données soumises
    const updatedTestimonial = await prisma.testimonial.update({
      where: { id: testimonial.id },
      data: {
        content: validatedData.content,
        rating: validatedData.rating,
        photoUrl: validatedData.photoUrl || null,
        status: 'SUBMITTED',
        submittedAt: new Date(),
        // Invalider le token après soumission
        token: null,
        tokenExpiresAt: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Témoignage soumis avec succès ! Il sera examiné par notre équipe avant publication.',
      data: {
        id: updatedTestimonial.id,
        name: updatedTestimonial.name,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur POST testimonials/submit:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la soumission du témoignage' },
      { status: 500 }
    )
  }
}

