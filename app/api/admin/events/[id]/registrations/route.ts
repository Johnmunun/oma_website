/**
 * @file app/api/admin/events/[id]/registrations/route.ts
 * @description API admin pour gérer les inscriptions d'un événement
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'
import { sendRegistrationConfirmationEmail } from '@/lib/email'

// Schéma pour créer une inscription manuellement
const createRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

// GET /api/admin/events/[id]/registrations
// Récupère toutes les inscriptions d'un événement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId: params.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        notes: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: registrations,
    })
  } catch (error: any) {
    console.error('[API] Erreur GET event registrations:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des inscriptions' },
      { status: 500 }
    )
  }
}

// POST /api/admin/events/[id]/registrations
// Crée une inscription manuellement (admin uniquement)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createRegistrationSchema.safeParse(body)

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

    const { fullName, email, phone, notes } = validation.data

    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
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

    // Vérifier si l'email n'est pas déjà inscrit
    const existing = await prisma.registration.findFirst({
      where: {
        eventId: params.id,
        email: email.toLowerCase(),
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà inscrit à cet événement' },
        { status: 409 }
      )
    }

    // Créer l'inscription
    const registration = await prisma.registration.create({
      data: {
        eventId: params.id,
        fullName,
        email: email.toLowerCase(),
        phone: phone || null,
        notes: notes || null,
        status: 'CONFIRMED', // Inscriptions manuelles sont confirmées par défaut
      },
    })

    // Envoyer l'email de confirmation (en arrière-plan)
    if (event) {
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
        console.error('[API] Erreur envoi email confirmation:', error)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Inscription créée avec succès. Un email de confirmation a été envoyé.',
      data: registration,
    })
  } catch (error: any) {
    console.error('[API] Erreur POST event registration:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà inscrit' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'inscription' },
      { status: 500 }
    )
  }
}

