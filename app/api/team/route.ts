/**
 * @file app/api/team/route.ts
 * @description API publique pour récupérer les membres de l'équipe
 * GET: Récupère tous les membres (publique)
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/team
// Récupère tous les membres de l'équipe (publique)
export const revalidate = 60 // Cache 60 secondes

export async function GET() {
  try {
    // Récupérer tous les membres triés par ordre
    const members = await prisma.teamMember.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        role: true,
        bio: true,
        photoUrl: true,
        xUrl: true,
        linkedinUrl: true,
        facebookUrl: true,
        instagramUrl: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: members,
    })
  } catch (error) {
    console.error('[API] Erreur GET team (public):', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des membres' },
      { status: 500 }
    )
  }
}

