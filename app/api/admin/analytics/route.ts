/**
 * @file app/api/admin/analytics/route.ts
 * @description API route pour récupérer les statistiques d'analytics (admin)
 * GET: Récupère les statistiques selon les filtres (date, période, etc.)
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/admin/analytics
// Récupère les statistiques d'analytics
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

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d, all
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculer les dates selon la période
    let dateFrom: Date
    const dateTo = endDate ? new Date(endDate) : new Date()

    if (startDate) {
      dateFrom = new Date(startDate)
    } else {
      switch (period) {
        case '7d':
          dateFrom = new Date()
          dateFrom.setDate(dateFrom.getDate() - 7)
          break
        case '30d':
          dateFrom = new Date()
          dateFrom.setDate(dateFrom.getDate() - 30)
          break
        case '90d':
          dateFrom = new Date()
          dateFrom.setDate(dateFrom.getDate() - 90)
          break
        case 'all':
        default:
          dateFrom = new Date(0) // Toutes les dates
          break
      }
    }

    // Construire le filtre de date
    const dateFilter = period !== 'all' ? {
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
    } : {}

    // Statistiques générales
    const [
      totalVisits,
      uniqueVisitors,
      totalPageViews,
      visitsByDay,
      visitsByPath,
      visitsByCountry,
      visitsByDevice,
      visitsByBrowser,
      visitsByOS,
      topReferrers,
    ] = await Promise.all([
      // Total des visites
      prisma.visit.count({
        where: dateFilter,
      }),

      // Visiteurs uniques (basé sur IP)
      prisma.visit.groupBy({
        by: ['ip'],
        where: {
          ...dateFilter,
          ip: { not: null },
        },
        _count: true,
      }),

      // Total des pages vues (même chose que totalVisits pour l'instant)
      prisma.visit.count({
        where: dateFilter,
      }),

      // Visites par jour (PostgreSQL compatible)
      prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT 
          DATE_TRUNC('day', "createdAt")::date as date,
          COUNT(*)::int as count
        FROM "Visit"
        WHERE "createdAt" >= ${dateFrom}
          AND "createdAt" <= ${dateTo}
        GROUP BY DATE_TRUNC('day', "createdAt")::date
        ORDER BY date ASC
      `,

      // Visites par chemin
      prisma.visit.groupBy({
        by: ['path'],
        where: dateFilter,
        _count: true,
        orderBy: {
          _count: {
            path: 'desc',
          },
        },
        take: 10,
      }),

      // Visites par pays
      prisma.visit.groupBy({
        by: ['country'],
        where: {
          ...dateFilter,
          country: { not: null },
        },
        _count: true,
        orderBy: {
          _count: {
            country: 'desc',
          },
        },
        take: 10,
      }),

      // Visites par appareil
      prisma.visit.groupBy({
        by: ['device'],
        where: {
          ...dateFilter,
          device: { not: null },
        },
        _count: true,
        orderBy: {
          _count: {
            device: 'desc',
          },
        },
      }),

      // Visites par navigateur
      prisma.visit.groupBy({
        by: ['browser'],
        where: {
          ...dateFilter,
          browser: { not: null },
        },
        _count: true,
        orderBy: {
          _count: {
            browser: 'desc',
          },
        },
        take: 10,
      }),

      // Visites par OS
      prisma.visit.groupBy({
        by: ['os'],
        where: {
          ...dateFilter,
          os: { not: null },
        },
        _count: true,
        orderBy: {
          _count: {
            os: 'desc',
          },
        },
        take: 10,
      }),

      // Top référents
      prisma.visit.groupBy({
        by: ['referer'],
        where: {
          ...dateFilter,
          referer: { not: null },
        },
        _count: true,
        orderBy: {
          _count: {
            referer: 'desc',
          },
        },
        take: 10,
      }),
    ])

    // Calculer la durée moyenne de visite
    const avgDuration = await prisma.visit.aggregate({
      where: {
        ...dateFilter,
        duration: { not: null },
      },
      _avg: {
        duration: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalVisits,
          uniqueVisitors: uniqueVisitors.length,
          totalPageViews,
          avgDuration: avgDuration._avg.duration ? Math.round(avgDuration._avg.duration) : 0,
        },
        visitsByDay: visitsByDay.map((item) => ({
          date: item.date instanceof Date ? item.date.toISOString().split('T')[0] : String(item.date),
          count: Number(item.count),
        })),
        visitsByPath: visitsByPath.map((item) => ({
          path: item.path,
          count: item._count,
        })),
        visitsByCountry: visitsByCountry.map((item) => ({
          country: item.country,
          count: item._count,
        })),
        visitsByDevice: visitsByDevice.map((item) => ({
          device: item.device,
          count: item._count,
        })),
        visitsByBrowser: visitsByBrowser.map((item) => ({
          browser: item.browser,
          count: item._count,
        })),
        visitsByOS: visitsByOS.map((item) => ({
          os: item.os,
          count: item._count,
        })),
        topReferrers: topReferrers.map((item) => ({
          referer: item.referer,
          count: item._count,
        })),
        period: {
          from: dateFrom.toISOString(),
          to: dateTo.toISOString(),
        },
      },
    })
  } catch (error) {
    console.error('[API] Erreur GET analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}

