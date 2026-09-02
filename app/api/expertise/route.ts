/**
 * @file app/api/expertise/route.ts
 * @description Domaines d'expertise + structures partenaires (landing)
 */

import { NextResponse } from 'next/server'
import { StructureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { OMA_STRUCTURE_ID } from '@/lib/authz/constants'
import { isPrismaClientOutdatedError } from '@/lib/authz/schema'
import { getStructurePublicUrls } from '@/lib/structures/public-url'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let domains

    try {
      domains = await prisma.expertiseDomain.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          iconKey: true,
          sortOrder: true,
          structures: {
            where: {
              isActive: true,
              status: StructureStatus.ACTIVE,
              showOnLanding: true,
              id: { not: OMA_STRUCTURE_ID },
            },
            orderBy: [{ landingOrder: 'asc' }, { name: 'asc' }],
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              description: true,
              landingPagePath: true,
              subdomain: true,
            },
          },
        },
      })
    } catch (error) {
      if (!isPrismaClientOutdatedError(error)) throw error
      return NextResponse.json({ success: true, data: [] })
    }

    const data = domains.map((domain) => ({
      ...domain,
      structures: domain.structures.map((s) => ({
        ...s,
        logoUrl: s.logoUrl?.trim() || null,
        href: getStructurePublicUrls(s).primaryUrl,
      })),
    }))

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('[API] Erreur GET expertise (public):', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération', data: [] },
      { status: 500 }
    )
  }
}
