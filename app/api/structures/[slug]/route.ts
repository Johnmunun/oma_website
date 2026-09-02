/**
 * Données publiques d'une structure (pour landing pages codées)
 */

import { NextRequest, NextResponse } from 'next/server'
import { StructureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const structure = await prisma.structure.findFirst({
      where: {
        OR: [{ slug }, { landingPagePath: slug }, { subdomain: slug }],
        isActive: true,
        status: StructureStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        type: true,
        subdomain: true,
        domain: true,
        landingPagePath: true,
        expertiseDomain: {
          select: { id: true, name: true, slug: true },
        },
        parent: { select: { name: true, slug: true } },
      },
    })

    if (!structure) {
      return NextResponse.json({ success: false, error: 'Structure introuvable' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: structure })
  } catch (error) {
    console.error('[API] Erreur GET structure publique:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}
