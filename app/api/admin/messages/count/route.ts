/**
 * @file app/api/admin/messages/count/route.ts
 * @description API route pour obtenir le nombre de messages non lus
 * Utilisé pour le compteur en temps réel dans le sidebar
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/admin/messages/count
// Retourne le nombre de messages non lus
export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const unreadCount = await prisma.contactMessage.count({
      where: { isRead: false },
    })

    return NextResponse.json({
      success: true,
      data: {
        unreadCount,
      },
    })
  } catch (error) {
    console.error('[API] Erreur GET messages count:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du compteur' },
      { status: 500 }
    )
  }
}




