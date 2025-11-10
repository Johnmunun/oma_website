import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()

    const [
      totalEvents,
      upcomingEvents,
      pastEvents,
      totalRegistrations,
      totalFormations,
      totalSubscribers,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { startsAt: { gte: now } } }),
      prisma.event.count({ where: { startsAt: { lt: now } } }),
      prisma.registration.count(),
      prisma.formation.count(),
      prisma.newsletterSubscriber.count(),
    ])

    return NextResponse.json({
      totalEvents,
      upcomingEvents,
      pastEvents,
      totalRegistrations,
      totalFormations,
      totalSubscribers,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}













