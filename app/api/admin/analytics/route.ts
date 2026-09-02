/**
 * @file app/api/admin/analytics/route.ts
 * @description API route pour récupérer les statistiques d'analytics (admin)
 * GET: Récupère les statistiques selon les filtres (date, période, etc.)
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/analytics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let dateFrom: Date
    const dateTo = endDate ? new Date(endDate) : new Date()

    if (startDate) {
      dateFrom = new Date(startDate)
    } else {
      switch (period) {
        case '24h':
          dateFrom = new Date()
          dateFrom.setHours(dateFrom.getHours() - 24)
          break
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
          dateFrom = new Date(0)
          break
      }
    }

    const dateFilter = period !== 'all' ? {
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
    } : {}

    const dateWhere =
      period === 'all'
        ? Prisma.sql`TRUE`
        : Prisma.sql`"createdAt" >= ${dateFrom} AND "createdAt" <= ${dateTo}`

    const chartFrom =
      period === 'all'
        ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        : dateFrom

    const [
      totalVisits,
      uniqueRow,
      extraRow,
      avgDuration,
      visitsByDay,
      visitsByPath,
      visitsByCountry,
      visitsByCity,
      visitsByDevice,
      visitsByBrowser,
      visitsByOS,
      visitsByLanguage,
      topReferrers,
    ] = await Promise.all([
      prisma.visit.count({ where: dateFilter }),

      prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(DISTINCT COALESCE("sessionId", "ip"))::int as count
        FROM "Visit"
        WHERE ${dateWhere}
      `,

      prisma.$queryRaw<Array<{
        uniqueCountries: number
        uniqueCities: number
        bounceSessions: number
        totalSessions: number
        pagesPerSession: number
      }>>`
        WITH filtered AS (
          SELECT "country", "city", COALESCE("sessionId", "ip") as sid
          FROM "Visit"
          WHERE ${dateWhere}
        )
        SELECT
          COUNT(DISTINCT "country") FILTER (WHERE "country" IS NOT NULL)::int as "uniqueCountries",
          COUNT(DISTINCT "city") FILTER (WHERE "city" IS NOT NULL)::int as "uniqueCities",
          (
            SELECT COUNT(*)::int FROM (
              SELECT sid FROM filtered WHERE sid IS NOT NULL GROUP BY sid HAVING COUNT(*) = 1
            ) b
          ) as "bounceSessions",
          (
            SELECT COUNT(*)::int FROM (
              SELECT sid FROM filtered WHERE sid IS NOT NULL GROUP BY sid
            ) s
          ) as "totalSessions",
          COALESCE((
            SELECT AVG(c)::float FROM (
              SELECT COUNT(*)::int as c FROM filtered WHERE sid IS NOT NULL GROUP BY sid
            ) p
          ), 0) as "pagesPerSession"
        FROM filtered
      `,

      prisma.visit.aggregate({
        where: {
          ...dateFilter,
          duration: { gt: 0 },
        },
        _avg: { duration: true },
      }),

      prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT
          DATE_TRUNC('day', "createdAt")::date as date,
          COUNT(*)::int as count
        FROM "Visit"
        WHERE "createdAt" >= ${chartFrom}
          AND "createdAt" <= ${dateTo}
        GROUP BY DATE_TRUNC('day', "createdAt")::date
        ORDER BY date ASC
      `,

      prisma.visit.groupBy({
        by: ['path'],
        where: dateFilter,
        _count: true,
        orderBy: { _count: { path: 'desc' } },
        take: 12,
      }),

      prisma.visit.groupBy({
        by: ['country'],
        where: { ...dateFilter, country: { not: null } },
        _count: true,
        orderBy: { _count: { country: 'desc' } },
        take: 15,
      }),

      prisma.visit.groupBy({
        by: ['city'],
        where: { ...dateFilter, city: { not: null } },
        _count: true,
        orderBy: { _count: { city: 'desc' } },
        take: 12,
      }),

      prisma.visit.groupBy({
        by: ['device'],
        where: { ...dateFilter, device: { not: null } },
        _count: true,
        orderBy: { _count: { device: 'desc' } },
      }),

      prisma.visit.groupBy({
        by: ['browser'],
        where: { ...dateFilter, browser: { not: null } },
        _count: true,
        orderBy: { _count: { browser: 'desc' } },
        take: 10,
      }),

      prisma.visit.groupBy({
        by: ['os'],
        where: { ...dateFilter, os: { not: null } },
        _count: true,
        orderBy: { _count: { os: 'desc' } },
        take: 10,
      }),

      prisma.visit.groupBy({
        by: ['language'],
        where: { ...dateFilter, language: { not: null } },
        _count: true,
        orderBy: { _count: { language: 'desc' } },
        take: 8,
      }),

      prisma.visit.groupBy({
        by: ['referer'],
        where: { ...dateFilter, referer: { not: null } },
        _count: true,
        orderBy: { _count: { referer: 'desc' } },
        take: 12,
      }),
    ])

    const extras = extraRow[0] || {
      uniqueCountries: 0,
      uniqueCities: 0,
      bounceSessions: 0,
      totalSessions: 0,
      pagesPerSession: 0,
    }

    const bounceRate =
      extras.totalSessions > 0
        ? Math.round((extras.bounceSessions / extras.totalSessions) * 100)
        : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalVisits,
          uniqueVisitors: Number(uniqueRow[0]?.count || 0),
          totalPageViews: totalVisits,
          avgDuration: avgDuration._avg.duration ? Math.round(avgDuration._avg.duration) : 0,
          bounceRate,
          pagesPerSession: Number(Number(extras.pagesPerSession || 0).toFixed(1)),
          uniqueCountries: Number(extras.uniqueCountries || 0),
          uniqueCities: Number(extras.uniqueCities || 0),
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
        visitsByCity: visitsByCity.map((item) => ({
          city: item.city,
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
        visitsByLanguage: visitsByLanguage.map((item) => ({
          language: item.language,
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
