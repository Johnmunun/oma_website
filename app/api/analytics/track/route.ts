/**
 * @file app/api/analytics/track/route.ts
 * @description API route pour enregistrer les visites des utilisateurs
 * POST: Enregistre une visite avec toutes les métadonnées
 * PUBLIC : Accessible sans authentification
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { detectDevice, detectBrowser, detectOS, getClientIP } from '@/lib/analytics'

// Schéma de validation pour les données de visite
const trackVisitSchema = z.object({
  url: z.string().url(),
  path: z.string(),
  referer: z.string().url().optional().nullable(),
  screenWidth: z.number().int().positive().optional().nullable(),
  screenHeight: z.number().int().positive().optional().nullable(),
  language: z.string().optional().nullable(),
  sessionId: z.string().optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
})

// POST /api/analytics/track
// Enregistre une visite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Valider les données
    const validatedData = trackVisitSchema.parse(body)
    
    // Récupérer les informations de la requête
    const userAgent = request.headers.get('user-agent')
    const referer = validatedData.referer || request.headers.get('referer') || null
    const ip = getClientIP(request)
    
    // Détecter les informations du navigateur
    const device = detectDevice(userAgent)
    const browser = detectBrowser(userAgent)
    const os = detectOS(userAgent)
    
    // Pour la géolocalisation, on pourrait utiliser un service externe
    // Pour l'instant, on laisse null (peut être ajouté plus tard avec un service comme ipapi.co)
    const country = null
    const city = null
    
    // Créer la visite dans la base de données
    const visit = await prisma.visit.create({
      data: {
        ip,
        userAgent,
        referer,
        url: validatedData.url,
        path: validatedData.path,
        method: 'GET',
        country,
        city,
        device,
        browser,
        os,
        screenWidth: validatedData.screenWidth || null,
        screenHeight: validatedData.screenHeight || null,
        language: validatedData.language || null,
        sessionId: validatedData.sessionId || null,
        duration: validatedData.duration || null,
        userId: null, // Sera rempli si l'utilisateur est connecté
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
      { success: false, error: 'Erreur lors de l\'enregistrement de la visite' },
      { status: 500 }
    )
  }
}






