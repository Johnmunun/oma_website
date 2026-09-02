/**
 * @file app/api/admin/challenges/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'
import { getAggregatedEffectivePermissions, getEffectivePermissions } from '@/lib/authz/get-effective-permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('challenges.view')
    if (isPermissionDenied(session)) return session

    const { searchParams } = new URL(request.url)
    const structureId = searchParams.get('structureId')

    const effective = structureId
      ? await getEffectivePermissions(session.user.id, structureId)
      : await getAggregatedEffectivePermissions(session.user.id)

    if (!effective.isRoot && effective.permissions.size === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    let challenges

    if (structureId) {
      const scoped = await requirePermission('challenges.view', { structureId })
      if (isPermissionDenied(scoped)) return scoped

      challenges = await prisma.challenge.findMany({
        where: { structureId },
        orderBy: { createdAt: 'desc' },
        include: {
          structure: {
            select: {
              id: true,
              name: true,
              slug: true,
              landingPagePath: true,
              subdomain: true,
            },
          },
        },
      })
    } else if (effective.isRoot) {
      challenges = await prisma.challenge.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          structure: {
            select: {
              id: true,
              name: true,
              slug: true,
              landingPagePath: true,
              subdomain: true,
            },
          },
        },
      })
    } else {
      const memberships = await prisma.structureMembership.findMany({
        where: { userId: session.user.id, isActive: true },
        select: { structureId: true },
      })
      const structureIds = memberships.map((m) => m.structureId)

      challenges = await prisma.challenge.findMany({
        where: { structureId: { in: structureIds } },
        orderBy: { createdAt: 'desc' },
        include: {
          structure: {
            select: {
              id: true,
              name: true,
              slug: true,
              landingPagePath: true,
              subdomain: true,
            },
          },
        },
      })
    }

    return NextResponse.json({ success: true, data: challenges })
  } catch (error) {
    console.error('[API] Erreur GET challenges:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des challenges' },
      { status: 500 }
    )
  }
}
