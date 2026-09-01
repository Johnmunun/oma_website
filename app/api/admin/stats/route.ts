import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireEditorOrAdmin } from '@/lib/authz/guards'

export async function GET() {
  try {
    const session = await auth()
    const authError = requireAuth(session)
    if (authError) return authError
    const roleError = requireEditorOrAdmin(session!)
    if (roleError) return roleError

    const now = new Date()
    const last7Days = new Date()
    last7Days.setDate(last7Days.getDate() - 7)
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const [
      totalEvents,
      upcomingEvents,
      pastEvents,
      totalRegistrations,
      totalFormations,
      totalSubscribers,
      // Statistiques de visiteurs
      totalVisits,
      visitsLast7Days,
      visitsLast30Days,
      uniqueVisitorsLast7Days,
      uniqueVisitorsLast30Days,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { startsAt: { gte: now } } }),
      prisma.event.count({ where: { startsAt: { lt: now } } }),
      prisma.registration.count(),
      prisma.formation.count(),
      prisma.newsletterSubscriber.count(),
      // Visites totales
      prisma.visit.count(),
      // Visites des 7 derniers jours
      prisma.visit.count({
        where: { createdAt: { gte: last7Days } },
      }),
      // Visites des 30 derniers jours
      prisma.visit.count({
        where: { createdAt: { gte: last30Days } },
      }),
      // Visiteurs uniques (7 derniers jours)
      prisma.visit.groupBy({
        by: ['ip'],
        where: {
          createdAt: { gte: last7Days },
          ip: { not: null },
        },
      }),
      // Visiteurs uniques (30 derniers jours)
      prisma.visit.groupBy({
        by: ['ip'],
        where: {
          createdAt: { gte: last30Days },
          ip: { not: null },
        },
      }),
    ])

    return NextResponse.json({
      totalEvents,
      upcomingEvents,
      pastEvents,
      totalRegistrations,
      totalFormations,
      totalSubscribers,
      // Statistiques de visiteurs
      totalVisits,
      visitsLast7Days,
      visitsLast30Days,
      uniqueVisitorsLast7Days: uniqueVisitorsLast7Days.length,
      uniqueVisitorsLast30Days: uniqueVisitorsLast30Days.length,
    })
  } catch (e) {
    console.error('[API] Erreur GET stats:', e)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}













