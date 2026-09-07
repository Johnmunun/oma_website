/**
 * POST /api/structures/[slug]/challenges/[challengeSlug]/votes/request-otp
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  PublicVoteError,
  requestPublicVoteOtp,
} from '@/lib/votes/submit-public-challenge-vote'
import { checkRateLimit, getClientIP, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'

const bodySchema = z.object({
  email: z.string().email('Email invalide'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; challengeSlug: string }> }
) {
  try {
    const { slug, challengeSlug } = await params
    const ip = getClientIP(request)

    const ipLimit = await checkRateLimit(ip, RATE_LIMIT_CONFIGS.challengeVoteOtp)
    if (!ipLimit.allowed) {
      const resetIn = Math.ceil((ipLimit.resetAt.getTime() - Date.now()) / 1000 / 60)
      return NextResponse.json(
        { success: false, error: `Trop de demandes. Réessayez dans ${resetIn} minute(s).` },
        { status: 429 }
      )
    }

    const body = bodySchema.parse(await request.json())

    const emailLimit = await checkRateLimit(
      body.email.toLowerCase(),
      RATE_LIMIT_CONFIGS.challengeVoteOtp
    )
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Trop de codes envoyés à cet email. Réessayez plus tard.' },
        { status: 429 }
      )
    }

    await requestPublicVoteOtp(slug, challengeSlug, body.email)

    return NextResponse.json({
      success: true,
      message: 'Un code de confirmation a été envoyé à votre email.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Email invalide' },
        { status: 400 }
      )
    }
    if (error instanceof PublicVoteError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }
    console.error('[API] Erreur request-otp vote:', error)
    return NextResponse.json(
      { success: false, error: "Impossible d'envoyer le code" },
      { status: 500 }
    )
  }
}
