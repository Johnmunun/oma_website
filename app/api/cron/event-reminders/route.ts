/**
 * @file app/api/cron/event-reminders/route.ts
 * @description API route pour envoyer les rappels d'événements
 * À appeler via un cron job (Vercel Cron, GitHub Actions, etc.)
 * Envoie des rappels quotidiens 5 jours avant l'événement
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEventReminderEmail } from '@/lib/email'

// Vérifier que la requête vient d'un cron job sécurisé
function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret) {
    console.warn('[Cron] CRON_SECRET non configuré, autorisation par défaut')
    return true // En développement, autoriser sans secret
  }
  
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'autorisation
    if (!verifyCronRequest(request)) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const now = new Date()
    const fiveDaysFromNow = new Date(now)
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5)
    
    // Trouver les événements qui commencent dans 5 jours (±1 jour pour gérer les fuseaux horaires)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const inSixDays = new Date(now)
    inSixDays.setDate(inSixDays.getDate() + 6)
    inSixDays.setHours(23, 59, 59, 999)

    const upcomingEvents = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        startsAt: {
          gte: tomorrow,
          lte: inSixDays,
        },
      },
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

    if (upcomingEvents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun événement à rappeler',
        remindersSent: 0,
      })
    }

    let remindersSent = 0
    let errors = 0

    // Pour chaque événement, envoyer des rappels aux inscrits
    for (const event of upcomingEvents) {
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)
      
      const registrations = await prisma.registration.findMany({
        where: {
          eventId: event.id,
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
          remindersEnabled: true,
          // Ne pas envoyer de rappel si on en a déjà envoyé un aujourd'hui
          OR: [
            { lastReminderSent: null },
            { lastReminderSent: { lt: todayStart } },
          ],
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          lastReminderSent: true,
        },
      })

      for (const registration of registrations) {
        try {
          const daysUntilEvent = Math.ceil(
            (event.startsAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )

          // Envoyer le rappel uniquement si l'événement est dans 5 jours ou moins
          if (daysUntilEvent <= 5 && daysUntilEvent > 0) {
            await sendEventReminderEmail({
              email: registration.email,
              fullName: registration.fullName,
              eventTitle: event.title,
              eventDate: event.startsAt!,
              eventLocation: event.location,
              eventDescription: event.description,
              daysUntilEvent,
              eventSlug: event.slug,
              registrationId: registration.id,
            })

            // Mettre à jour la date du dernier rappel
            await prisma.registration.update({
              where: { id: registration.id },
              data: { lastReminderSent: now },
            })

            remindersSent++
          }
        } catch (error) {
          console.error(`[Cron] Erreur envoi rappel pour ${registration.email}:`, error)
          errors++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Rappels envoyés: ${remindersSent}, Erreurs: ${errors}`,
      remindersSent,
      errors,
      eventsProcessed: upcomingEvents.length,
    })
  } catch (error: any) {
    console.error('[Cron] Erreur rappels événements:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'envoi des rappels',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

