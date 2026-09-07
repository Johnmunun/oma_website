/**
 * @file app/api/admin/event-reviews/route.ts
 * @description Modération des critiques d'événements
 * GET: liste filtrable
 * PATCH: publish / reject
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'
import { z } from 'zod'

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['PUBLISHED', 'REJECTED', 'PENDING']),
})

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('events.view')
    if (isPermissionDenied(session)) return session

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const eventId = searchParams.get('eventId')
    const search = searchParams.get('search')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (eventId) {
      where.eventId = eventId
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { event: { title: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const reviews = await prisma.eventReview.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: { id: true, title: true, slug: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('[API] Erreur GET admin event-reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des critiques' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requirePermission('events.manage')
    if (isPermissionDenied(session)) return session

    const body = await request.json()
    const validated = patchSchema.parse(body)

    const existing = await prisma.eventReview.findUnique({
      where: { id: validated.id },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Critique non trouvée' },
        { status: 404 }
      )
    }

    const review = await prisma.eventReview.update({
      where: { id: validated.id },
      data: { status: validated.status },
      include: {
        event: {
          select: { id: true, title: true, slug: true },
        },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'eventReview.update',
        target: 'EventReview',
        payload: { id: validated.id, status: validated.status },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Critique mise à jour',
      data: {
        ...review,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur PATCH admin event-reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la critique' },
      { status: 500 }
    )
  }
}
