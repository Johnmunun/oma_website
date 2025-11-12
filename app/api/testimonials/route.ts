/**
 * @file app/api/testimonials/route.ts
 * @description API route publique pour récupérer les témoignages publiés
 * GET: Récupère tous les témoignages publiés
 * PUBLIC : Accessible sans authentification
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/testimonials
// Récupère tous les témoignages publiés (publique)
export const revalidate = 60 // Cache 60 secondes

export async function GET() {
  try {
    // Récupérer uniquement les témoignages publiés
    const testimonials = await prisma.testimonial.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        role: true,
        content: true,
        photoUrl: true,
        rating: true,
        createdAt: true,
      },
    })

    console.log('[API] Témoignages publiés récupérés:', {
      count: testimonials.length,
      testimonials: testimonials.map(t => ({ id: t.id, name: t.name, status: 'PUBLISHED' })),
    })

    return NextResponse.json({
      success: true,
      data: testimonials,
    })
  } catch (error) {
    console.error('[API] Erreur GET testimonials (public):', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des témoignages' },
      { status: 500 }
    )
  }
}

