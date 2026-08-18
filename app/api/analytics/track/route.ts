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

const trackVisitSchema = z.object({
  url: z.string().url(),
  path: z.string().min(1),
  referer: z.preprocess(emptyToNull, z.string().url().nullable().optional()),
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

    // Mise à jour de durée : ne pas créer une seconde visite
    if (validatedData.duration && validatedData.sessionId) {
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
          await prisma.visit.update({
            where: { id: lastVisit.id },
            data: { duration: validatedData.duration },
          })
          return NextResponse.json({ success: true, data: { id: lastVisit.id, updated: true } })
        }
      } catch (err) {
        console.warn('[API] Mise à jour durée visite échouée:', err)
      }
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
        url: validatedData.url,
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
        duration: validatedData.duration || null,
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
