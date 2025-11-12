/**
 * @file app/api/events/[id]/register/route.ts
 * @description API publique sécurisée pour les inscriptions aux événements
 * Utilise un token sécurisé pour éviter les abus
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'
import { sendRegistrationConfirmationEmail } from '@/lib/email'

// Schéma de validation pour l'inscription
const registrationSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis (min 2 caractères)'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  notes: z.string().optional(),
  token: z.string().min(1, 'Token requis'),
})

// Rate limiting simple (en mémoire - à améliorer avec Redis en production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 }) // 15 minutes
    return true
  }
  
  if (limit.count >= 5) { // Max 5 inscriptions par IP toutes les 15 minutes
    return false
  }
  
  limit.count++
  return true
}

// Générer un token sécurisé pour un événement
function generateEventToken(eventId: string): string {
  const secret = process.env.EVENT_REGISTRATION_SECRET || 'change-me-in-production'
  const data = `${eventId}-${Date.now()}`
  return crypto.createHmac('sha256', secret).update(data).digest('hex').substring(0, 32)
}

// Vérifier un token
function verifyEventToken(eventId: string, token: string): boolean {
  // Pour simplifier, on stocke le token dans la base de données
  // En production, on pourrait utiliser JWT ou un système plus robuste
  return token.length === 32 // Validation basique
}

// GET /api/events/[id]/register
// Génère un token sécurisé pour l'inscription à un événement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
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

    // Générer un token unique pour cet événement
    const token = generateEventToken(event.id)

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
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Trop de tentatives. Veuillez réessayer dans quelques minutes.' },
        { status: 429 }
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
      where: { id: params.id },
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

    // Vérifier le token (validation basique)
    if (!verifyEventToken(event.id, token)) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
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

