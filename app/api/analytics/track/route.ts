/**
 * @file app/api/analytics/track/route.ts
 * @description API route pour enregistrer les visites des utilisateurs
 * POST: Enregistre une visite avec toutes les métadonnées
 * PUBLIC : Accessible sans authentification
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { detectDevice, detectBrowser, detectOS, getClientIP, resolveVisitorGeo } from '@/lib/analytics'

const emptyToNull = (v: unknown) =>
  v === '' || v === 'null' || v === undefined ? null : v

const softUrl = z.preprocess((v) => {
  const n = emptyToNull(v)
  if (n == null) return null
  if (typeof n !== 'string') return null
  try {
    // Valide sans faire échouer tout le tracking
    // eslint-disable-next-line no-new
    new URL(n)
    return n
  } catch {
    return null
  }
}, z.string().url().nullable())

const trackVisitSchema = z.object({
  url: z.string().min(1),
  path: z.string().min(1),
  referer: softUrl.optional(),
  screenWidth: z.number().int().positive().optional().nullable(),
  screenHeight: z.number().int().positive().optional().nullable(),
  language: z.preprocess(emptyToNull, z.string().nullable().optional()),
  sessionId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  duration: z.number().int().min(0).optional().nullable(),
})

async function parseTrackBody(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return request.json()
  }
  const text = await request.text()
  return text ? JSON.parse(text) : {}
}

// POST /api/analytics/track
export async function POST(request: NextRequest) {
  try {
    const body = await parseTrackBody(request)
    const validatedData = trackVisitSchema.parse(body)

    const userAgent = request.headers.get('user-agent')
    const referer = validatedData.referer || request.headers.get('referer') || null
    const ip = getClientIP(request)

    // Mise à jour de durée uniquement (ne jamais créer une 2e visite)
    if (validatedData.duration != null && validatedData.sessionId) {
      try {
        const lastVisit = await prisma.visit.findFirst({
          where: {
            sessionId: validatedData.sessionId,
            path: validatedData.path,
          },
          orderBy: { createdAt: 'desc' },
          select: { id: true, createdAt: true },
        })
        if (lastVisit && Date.now() - lastVisit.createdAt.getTime() < 45 * 60 * 1000) {
          if (validatedData.duration > 0) {
            await prisma.visit.update({
              where: { id: lastVisit.id },
              data: { duration: validatedData.duration },
            })
          }
          return NextResponse.json({ success: true, data: { id: lastVisit.id, updated: true } })
        }
      } catch (err) {
        console.warn('[API] Mise à jour durée visite échouée:', err)
      }
      // Beacon durée sans visite récente → ignorer (pas de doublon)
      return NextResponse.json({ success: true, data: { skipped: true } })
    }

    let pageUrl = validatedData.url
    try {
      // eslint-disable-next-line no-new
      new URL(pageUrl)
    } catch {
      pageUrl = `https://unknown.local${validatedData.path.startsWith('/') ? '' : '/'}${validatedData.path}`
    }

    const device = detectDevice(userAgent)
    const browser = detectBrowser(userAgent)
    const os = detectOS(userAgent)
    const geo = await resolveVisitorGeo(request, ip)

    const visit = await prisma.visit.create({
      data: {
        ip,
        userAgent,
        referer,
        url: pageUrl,
        path: validatedData.path,
        method: 'GET',
        country: geo.country,
        city: geo.city,
        device,
        browser,
        os,
        screenWidth: validatedData.screenWidth || null,
        screenHeight: validatedData.screenHeight || null,
        language: validatedData.language || null,
        sessionId: validatedData.sessionId || null,
        duration: null,
        userId: null,
      },
    })

    return NextResponse.json({
      success: true,
      data: { id: visit.id },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur track visit:', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'enregistrement de la visite" },
      { status: 500 }
    )
  }
}
