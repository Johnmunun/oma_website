/**
 * @file app/api/events/[id]/register/route.ts
 * @description API publique sécurisée pour les inscriptions aux événements
 * Utilise un token sécurisé pour éviter les abus
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendRegistrationConfirmationEmail } from '@/lib/email'
import { checkRateLimit, getClientIP, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'
import { generateEventTokenWithTimestamp, verifyEventTokenWithTimestamp } from '@/lib/token-utils'

// Schéma de validation pour l'inscription
const registrationSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis (min 2 caractères)'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  notes: z.string().optional(),
  token: z.string().min(1, 'Token requis'),
})

// GET /api/events/[id]/register
// Génère un token sécurisé pour l'inscription à un événement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        startsAt: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    if (event.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: 'Cet événement n\'est pas disponible pour les inscriptions' },
        { status: 403 }
      )
    }

    // Générer un token unique pour cet événement avec timestamp
    const token = generateEventTokenWithTimestamp(event.id)

    return NextResponse.json({
      success: true,
      data: {
        eventId: event.id,
        eventTitle: event.title,
        token,
      },
    })
  } catch (error: any) {
    console.error('[API] Erreur GET event register token:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération du token' },
      { status: 500 }
    )
  }
}

// POST /api/events/[id]/register
// Crée une inscription à un événement (publique mais sécurisée)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Rate limiting basé sur la base de données
    const ip = getClientIP(request)
    const rateLimitResult = await checkRateLimit(ip, RATE_LIMIT_CONFIGS.eventRegistration)
    
    if (!rateLimitResult.allowed) {
      const resetIn = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000 / 60)
      return NextResponse.json(
        { 
          success: false, 
          error: `Trop de tentatives. Veuillez réessayer dans ${resetIn} minute(s).`,
          resetAt: rateLimitResult.resetAt.toISOString(),
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.eventRegistration.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      )
    }

    const body = await request.json()

    // Validation
    const validation = registrationSchema.safeParse({
      ...body,
      token: body.token || '',
    })

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { fullName, email, phone, notes, token } = validation.data

    // Vérifier que l'événement existe et est publié
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        location: true,
        startsAt: true,
        endsAt: true,
        slug: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    if (event.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: 'Cet événement n\'accepte pas d\'inscriptions' },
        { status: 403 }
      )
    }

    // Vérifier le token avec validation HMAC complète
    const tokenValidation = verifyEventTokenWithTimestamp(event.id, token, 60 * 60 * 1000) // 1 heure
    
    if (!tokenValidation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: tokenValidation.reason || 'Token invalide ou expiré',
        },
        { status: 403 }
      )
    }

    // Vérifier si l'email n'est pas déjà inscrit à cet événement
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        eventId: event.id,
        email: email.toLowerCase(),
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { success: false, error: 'Vous êtes déjà inscrit à cet événement' },
        { status: 409 }
      )
    }

    // Créer l'inscription
    const registration = await prisma.registration.create({
      data: {
        eventId: event.id,
        fullName,
        email: email.toLowerCase(),
        phone: phone || null,
        notes: notes || null,
        status: 'PENDING',
      },
    })

    // Envoyer l'email de confirmation (en arrière-plan, ne pas bloquer la réponse)
    sendRegistrationConfirmationEmail({
      email: email.toLowerCase(),
      fullName,
      eventTitle: event.title,
      eventDate: event.startsAt ? new Date(event.startsAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) : null,
      eventLocation: event.location,
      eventDescription: event.description,
      registrationId: registration.id,
      eventSlug: event.slug,
    }).catch((error) => {
      // Logger l'erreur mais ne pas faire échouer l'inscription
      console.error('[API] Erreur envoi email confirmation:', error)
    })

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie ! Un email de confirmation vous a été envoyé.',
      data: {
        id: registration.id,
        fullName: registration.fullName,
        email: registration.email,
      },
    })
  } catch (error: any) {
    console.error('[API] Erreur POST event register:', error)
    
    // Gérer les erreurs de contrainte unique
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Vous êtes déjà inscrit à cet événement' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}

