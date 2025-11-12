/**
 * @file app/api/admin/activity/route.ts
 * @description API route pour récupérer l'activité système et les sessions actives
 * GET: Récupère les sessions actives, les dernières activités et les utilisateurs connectés
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN uniquement
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/admin/activity
// Récupère les sessions actives et l'activité système
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

    // Seuls les ADMIN peuvent voir l'activité système
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Seuls les administrateurs peuvent voir l\'activité système.' },
        { status: 403 }
      )
    }

    const now = new Date()

    // Récupérer les sessions actives (non expirées)
    const activeSessions = await prisma.session.findMany({
      where: {
        expires: {
          gt: now, // Sessions non expirées
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: {
        expires: 'desc',
      },
    })

    // Récupérer les dernières activités (audit logs) - 50 dernières
    const recentActivities = await prisma.auditLog.findMany({
      take: 50,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    // Récupérer les utilisateurs connectés récemment (dernière connexion dans les 24h)
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const recentlyActiveUsers = await prisma.user.findMany({
      where: {
        lastLoginAt: {
          gte: last24Hours,
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        lastLoginAt: true,
      },
      orderBy: {
        lastLoginAt: 'desc',
      },
    })

    // Statistiques d'activité
    const activityStats = {
      activeSessionsCount: activeSessions.length,
      recentActivitiesCount: recentActivities.length,
      recentlyActiveUsersCount: recentlyActiveUsers.length,
      totalUsers: await prisma.user.count({ where: { isActive: true } }),
      totalActivitiesToday: await prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          },
        },
      }),
      totalActivitiesLast7Days: await prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    }

    // Formater les sessions actives
    const formattedSessions = activeSessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      user: session.user,
      expiresAt: session.expires.toISOString(),
      isExpired: session.expires <= now,
      timeUntilExpiry: Math.max(0, Math.floor((session.expires.getTime() - now.getTime()) / 1000 / 60)), // en minutes
    }))

    // Formater les activités récentes
    const formattedActivities = recentActivities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      target: activity.target,
      payload: activity.payload,
      user: activity.user,
      createdAt: activity.createdAt.toISOString(),
    }))

    // Formater les utilisateurs récemment actifs
    const formattedRecentUsers = recentlyActiveUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        activeSessions: formattedSessions,
        recentActivities: formattedActivities,
        recentlyActiveUsers: formattedRecentUsers,
        stats: activityStats,
      },
    })
  } catch (error) {
    console.error('[API] Erreur GET activity:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'activité système' },
      { status: 500 }
    )
  }
}








