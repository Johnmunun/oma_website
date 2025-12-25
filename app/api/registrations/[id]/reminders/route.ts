/**
 * @file app/api/registrations/[id]/reminders/route.ts
 * @description API pour gérer les préférences de rappel d'une inscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateReminderSchema = z.object({
  enabled: z.boolean(),
})

// PATCH /api/registrations/[id]/reminders
// Active ou désactive les rappels pour une inscription
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validation = updateReminderSchema.safeParse(body)

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

    const { enabled } = validation.data

    const registration = await prisma.registration.update({
      where: { id: params.id },
      data: {
        remindersEnabled: enabled,
        // Réinitialiser lastReminderSent si on réactive les rappels
        ...(enabled ? {} : { lastReminderSent: null }),
      },
      select: {
        id: true,
        email: true,
        remindersEnabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: enabled
        ? 'Rappels activés pour cet événement'
        : 'Rappels désactivés pour cet événement',
      data: registration,
    })
  } catch (error: any) {
    console.error('[API] Erreur PATCH reminders:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Inscription non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour des préférences' },
      { status: 500 }
    )
  }
}

// GET /api/registrations/[id]/reminders
// Récupère l'état des rappels pour une inscription
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        remindersEnabled: true,
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startsAt: true,
          },
        },
      },
    })

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Inscription non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: registration,
    })
  } catch (error: any) {
    console.error('[API] Erreur GET reminders:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des préférences' },
      { status: 500 }
    )
  }
}

