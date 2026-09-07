/**
 * POST /api/structures/[slug]/challenges/[challengeSlug]/votes
 * Vote public (email + OTP + anti-fraude navigateur / IP)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  PublicVoteError,
  submitPublicChallengeVote,
} from '@/lib/votes/submit-public-challenge-vote'
import { applyBallotCookie, hasBallotCookie } from '@/lib/votes/vote-ballot-cookie'
import { hashVoteIp } from '@/lib/votes/vote-ip-guard'
import { checkRateLimit, getClientIP, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'

const voteBodySchema = z.object({
  candidateId: z.string().uuid('Candidat invalide'),
  email: z.string().email('Email invalide'),
  otp: z.string().min(4).max(12),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; challengeSlug: string }> }
) {
  try {
    const { slug, challengeSlug } = await params

    const ip = getClientIP(request)
    const rateLimitResult = await checkRateLimit(ip, RATE_LIMIT_CONFIGS.challengeVote)
    if (!rateLimitResult.allowed) {
      const resetIn = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000 / 60)
      return NextResponse.json(
        {
          success: false,
          error: `Trop de tentatives. Réessayez dans ${resetIn} minute(s).`,
        },
        { status: 429 }
      )
    }

    const body = voteBodySchema.parse(await request.json())

    const result = await submitPublicChallengeVote(
      slug,
      challengeSlug,
      body.candidateId,
      body.email,
      {
        otp: body.otp,
        ipHash: hashVoteIp(ip),
        clientIp: ip,
        checkBallot: (challengeId, phaseKey) => hasBallotCookie(request, challengeId, phaseKey),
      }
    )

    const response = NextResponse.json({
      success: true,
      message: `Merci ! Votre vote pour ${result.candidate.fullName} a bien été enregistré.`,
      data: {
        candidateId: result.candidate.id,
        challengeId: result.challenge.id,
        phaseKey: result.phaseKey,
      },
    })
    applyBallotCookie(response, result.challenge.id, result.phaseKey)
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    if (error instanceof PublicVoteError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }
    console.error('[API] Erreur POST public vote:', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'enregistrement du vote" },
      { status: 500 }
    )
  }
}
