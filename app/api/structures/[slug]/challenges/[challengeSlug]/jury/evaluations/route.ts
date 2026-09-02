/**
 * POST /api/structures/[slug]/challenges/[challengeSlug]/jury/evaluations
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { publicJuryEvaluationSchema } from '@/lib/jury/challenge-jury-schema'
import {
  PublicJuryEvaluationError,
  submitPublicJuryEvaluation,
} from '@/lib/jury/load-public-jury-portal'
import { checkRateLimit, getClientIP, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; challengeSlug: string }> }
) {
  try {
    const { slug, challengeSlug } = await params

    const ip = getClientIP(request)
    const rateLimitResult = await checkRateLimit(ip, RATE_LIMIT_CONFIGS.challengeRegistration)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = publicJuryEvaluationSchema.parse(body)

    const { evaluation } = await submitPublicJuryEvaluation(
      slug,
      challengeSlug,
      validated.token,
      validated.candidateId,
      validated.score,
      validated.comment
    )

    return NextResponse.json({
      success: true,
      message: 'Évaluation enregistrée',
      data: { id: evaluation.id, score: evaluation.score },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    if (error instanceof PublicJuryEvaluationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }
    console.error('[API] Erreur POST jury evaluation:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'enregistrement de l\'évaluation' },
      { status: 500 }
    )
  }
}
