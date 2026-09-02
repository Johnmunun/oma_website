/**
 * @file app/api/contact/route.ts
 * @description API route pour recevoir les messages de contact du site principal OMA
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { contactMessageSchema } from '@/lib/messages/contact-schema'
import { submitContactMessage } from '@/lib/messages/submit-contact-message'
import { checkRateLimit, getClientIP, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const rateLimitResult = await checkRateLimit(ip, RATE_LIMIT_CONFIGS.contact)

    if (!rateLimitResult.allowed) {
      const resetIn = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000 / 60)
      return NextResponse.json(
        {
          success: false,
          error: `Trop de tentatives. Veuillez réessayer dans ${resetIn} minute(s).`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.contact.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      )
    }

    const body = await request.json()
    const validatedData = contactMessageSchema.parse(body)

    const { contactMessage, emailSent, emailError } = await submitContactMessage(
      validatedData,
      null
    )

    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
        : 'Votre message a été enregistré mais l\'envoi de l\'email a échoué. Nous vous contacterons bientôt.',
      data: {
        id: contactMessage.id,
        emailSent,
        ...(emailError && process.env.NODE_ENV === 'development' ? { emailError } : {}),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('[API Contact] Erreur:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.',
      },
      { status: 500 }
    )
  }
}
