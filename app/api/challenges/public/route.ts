/**
 * Challenges publics d'une structure (landing)
 */

import { NextRequest, NextResponse } from 'next/server'
import { ChallengeStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const structureSlug = searchParams.get('structure')

    if (!structureSlug) {
      return NextResponse.json(
        { success: false, error: 'Paramètre structure requis' },
        { status: 400 }
      )
    }

    const structure = await prisma.structure.findFirst({
      where: {
        OR: [{ slug: structureSlug }, { landingPagePath: structureSlug }],
        isActive: true,
      },
      select: { id: true, name: true, slug: true },
    })

    if (!structure) {
      return NextResponse.json({ success: true, data: [] })
    }

    const challenges = await prisma.challenge.findMany({
      where: {
        structureId: structure.id,
        status: ChallengeStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        startsAt: true,
        endsAt: true,
      },
    })

    return NextResponse.json(
      { success: true, data: challenges, structure },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('[API] Erreur GET public challenges:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}
