/**
 * @file app/api/partners/route.ts
 * @description API route publique pour récupérer les partenaires
 * GET: Récupère tous les partenaires (pour affichage public)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Configuration de cache pour Next.js 15
export const dynamic = 'force-dynamic' // Force le rendu dynamique pour avoir les données à jour

// GET /api/partners
// Récupère tous les partenaires (public)
export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les partenaires (ordonnés par order)
    const partners = await prisma.partner.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        url: true,
        order: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: partners || [], // S'assurer qu'on retourne toujours un tableau
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error: any) {
    console.error('[API] Erreur GET partners (public):', error)
    
    // Gérer les erreurs Prisma spécifiques
    let errorMessage = 'Erreur lors de la récupération des partenaires'
    let statusCode = 500
    
    if (error?.code === 'P2002') {
      errorMessage = 'Erreur de contrainte unique dans la base de données'
    } else if (error?.code === 'P2025') {
      errorMessage = 'Enregistrement non trouvé'
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: statusCode }
    )
  }
}

