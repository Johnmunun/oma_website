/**
 * @file app/api/media/route.ts
 * @description API route publique pour récupérer les médias publiés
 * GET: Récupère tous les médias publiés
 * PUBLIC : Accessible sans authentification
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/media
// Récupère tous les médias publiés (publique)
export const revalidate = 60 // Cache 60 secondes

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const platform = searchParams.get('platform')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Construire les filtres
    const where: any = {
      isPublished: true,
    }

    if (type && type !== 'all') {
      where.type = type
    }
    if (platform && platform !== 'all') {
      where.platform = platform
    }

    // Récupérer uniquement les médias publiés
    const media = await prisma.media.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      select: {
        id: true,
        url: true,
        type: true,
        title: true,
        description: true,
        platform: true,
        thumbnailUrl: true,
        alt: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: media,
    })
  } catch (error) {
    console.error('[API] Erreur GET media (public):', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des médias' },
      { status: 500 }
    )
  }
}







