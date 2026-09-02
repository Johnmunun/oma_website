/**
 * POST /api/structures/[slug]/contact — message scopé à une structure partenaire
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { StructureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { contactMessageSchema } from '@/lib/messages/contact-schema'
import { submitContactMessage } from '@/lib/messages/submit-contact-message'
import { checkRateLimit, getClientIP, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const segment = slug.trim().toLowerCase()

    const structure = await prisma.structure.findFirst({
      where: {
        OR: [{ slug: segment }, { landingPagePath: segment }, { subdomain: segment }],
        isActive: true,
        status: StructureStatus.ACTIVE,
      },
      select: { id: true, name: true },
    })

    if (!structure) {
      return NextResponse.json(
        { success: false, error: 'Structure introuvable' },
        { status: 404 }
      )
    }

    const ip = getClientIP(request)
    const rateLimitResult = await checkRateLimit(ip, RATE_LIMIT_CONFIGS.contact)
    if (!rateLimitResult.allowed) {
      const resetIn = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000 / 60)
      return NextResponse.json(
        {
          success: false,
          error: `Trop de tentatives. Veuillez réessayer dans ${resetIn} minute(s).`,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validatedData = contactMessageSchema.parse(body)

    const { contactMessage, emailSent, emailError } = await submitContactMessage(
      validatedData,
      structure.id,
      structure.name
    )

    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
        : 'Votre message a été enregistré. Nous vous contacterons bientôt.',
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
          details: error.errors,
        },
        { status: 400 }
      )
    }
    console.error('[API] Erreur POST structure contact:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}
