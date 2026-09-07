/**
 * @file app/api/admin/event-reviews/[id]/route.ts
 * @description Suppression d'une critique d'événement
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('events.manage')
    if (isPermissionDenied(session)) return session

    const { id } = await params

    const existing = await prisma.eventReview.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Critique non trouvée' },
        { status: 404 }
      )
    }

    await prisma.eventReview.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'eventReview.delete',
        target: 'EventReview',
        payload: { id },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Critique supprimée',
    })
  } catch (error) {
    console.error('[API] Erreur DELETE admin event-reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la critique' },
      { status: 500 }
    )
  }
}
