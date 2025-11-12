/**
 * @file app/api/admin/search/route.ts
 * @description API pour la recherche globale dans le panel admin
 * Recherche dans: Événements, Utilisateurs, Messages
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/admin/search?q=query
// Recherche globale dans les événements, utilisateurs et messages
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

    // Vérifier les permissions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          events: [],
          users: [],
          messages: [],
        },
      })
    }

    const searchTerm = query.trim().toLowerCase()

    // Recherche en parallèle dans les différentes tables
    const [events, users, messages] = await Promise.all([
      // Recherche dans les événements
      prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { location: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
        },
        take: 5, // Limiter à 5 résultats par catégorie
        orderBy: { createdAt: 'desc' },
      }),

      // Recherche dans les utilisateurs (seulement pour ADMIN)
      session.user.role === 'ADMIN'
        ? prisma.user.findMany({
            where: {
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
            select: {
              id: true,
              name: true,
              email: true,
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
          })
        : [],

      // Recherche dans les messages
      prisma.contactMessage.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { subject: { contains: searchTerm, mode: 'insensitive' } },
            { message: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        events: events.map((e) => ({
          id: e.id,
          title: e.title,
          slug: e.slug,
        })),
        users: users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
        })),
        messages: messages.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          subject: m.subject,
        })),
      },
    })
  } catch (error) {
    console.error('[API] Erreur recherche globale:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}

