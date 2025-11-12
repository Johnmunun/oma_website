/**
 * @file app/api/admin/messages/route.ts
 * @description API routes pour gérer les messages de contact
 * GET: Récupère les messages (avec filtres)
 * PATCH: Marque un message comme lu/non lu
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/admin/messages
// Récupère les messages de contact
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Tous les rôles (ADMIN, EDITOR, VIEWER) peuvent voir les messages
    // Les permissions de modification seront vérifiées dans PATCH

    const { searchParams } = new URL(request.url)
    const isRead = searchParams.get('isRead')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construire les filtres
    const where: any = {}
    if (isRead !== null) {
      where.isRead = isRead === 'true'
    }

    // Récupérer les messages
    const [messages, total, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({ where: { isRead: false } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        messages,
        total,
        unreadCount,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('[API] Erreur GET messages:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/messages/:id
// Marque un message comme lu/non lu
export async function PATCH(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('id')
    const body = await request.json()

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'ID du message requis' },
        { status: 400 }
      )
    }

    const isRead = body.isRead === true

    const message = await prisma.contactMessage.update({
      where: { id: messageId },
      data: {
        isRead,
        readAt: isRead ? new Date() : null,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Message marqué comme ${isRead ? 'lu' : 'non lu'}`,
      data: message,
    })
  } catch (error) {
    console.error('[API] Erreur PATCH message:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du message' },
      { status: 500 }
    )
  }
}




