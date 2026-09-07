/**
 * @file app/api/events/[id]/reviews/route.ts
 * @description Critiques publiques d'un événement
 * GET: liste PUBLISHED + moyenne
 * POST: soumission (PENDING) — 1 critique / email / événement
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { checkRateLimit, getClientIP, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'

const reviewSchema = z.object({
  name: z.string().min(2, 'Le nom est requis').max(120),
  email: z.string().email('Email invalide').max(200),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(10, 'Critique trop courte (min. 10 caractères)').max(2000),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    const reviews = await prisma.eventReview.findMany({
      where: { eventId: id, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        rating: true,
        content: true,
        createdAt: true,
      },
    })

    const count = reviews.length
    const averageRating =
      count > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
        : null

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        })),
        averageRating,
        count,
      },
    })
  } catch (error) {
    console.error('[API] Erreur GET event reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des critiques' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ip = getClientIP(request)
    const rateLimitResult = await checkRateLimit(ip, RATE_LIMIT_CONFIGS.eventReview)

    if (!rateLimitResult.allowed) {
      const resetIn = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000 / 60)
      return NextResponse.json(
        {
          success: false,
          error: `Trop de tentatives. Veuillez réessayer dans ${resetIn} minute(s).`,
          resetAt: rateLimitResult.resetAt.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.eventReview.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    if (event.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: 'Cet événement n\'accepte pas de critiques' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = reviewSchema.parse(body)
    const email = validated.email.toLowerCase().trim()

    const existing = await prisma.eventReview.findUnique({
      where: {
        eventId_email: { eventId: id, email },
      },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vous avez déjà soumis une critique pour cet événement avec cet email.',
        },
        { status: 409 }
      )
    }

    const review = await prisma.eventReview.create({
      data: {
        eventId: id,
        name: validated.name.trim(),
        email,
        rating: validated.rating,
        content: validated.content.trim(),
        status: 'PENDING',
      },
      select: {
        id: true,
        name: true,
        rating: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message:
        'Merci ! Votre critique a été envoyée et sera publiée après modération.',
      data: {
        ...review,
        createdAt: review.createdAt.toISOString(),
      },
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    if (error?.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'Vous avez déjà soumis une critique pour cet événement avec cet email.',
        },
        { status: 409 }
      )
    }

    console.error('[API] Erreur POST event reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la soumission de la critique' },
      { status: 500 }
    )
  }
}
