/**
 * GET /api/admin/events/upcoming-count
 * Compteur léger pour le badge sidebar (évite de charger 1000 événements)
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'

export async function GET() {
  try {
    const session = await requirePermission('events.view')
    if (isPermissionDenied(session)) return session

    const count = await prisma.event.count({
      where: {
        status: 'PUBLISHED',
        startsAt: { gte: new Date() },
      },
    })

    return NextResponse.json({ success: true, data: { count } })
  } catch (error) {
    console.error('[API] Erreur upcoming-count:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du comptage' },
      { status: 500 }
    )
  }
}
