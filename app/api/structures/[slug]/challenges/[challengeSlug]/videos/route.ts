/**
 * POST /api/structures/[slug]/challenges/[challengeSlug]/videos
 * Soumission publique de vidéo par candidat approuvé (token)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { publicVideoSubmitSchema } from '@/lib/videos/challenge-video-schema'
import {
  PublicVideoSubmitError,
  submitPublicChallengeVideo,
} from '@/lib/videos/submit-public-challenge-video'
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
      const resetIn = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000 / 60)
      return NextResponse.json(
        {
          success: false,
          error: `Trop de tentatives. Réessayez dans ${resetIn} minute(s).`,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = publicVideoSubmitSchema.parse(body)

    const { video, candidate, structure } = await submitPublicChallengeVideo(
      slug,
      challengeSlug,
      validated
    )

    return NextResponse.json({
      success: true,
      message: `Vidéo enregistrée pour « ${candidate.fullName} ». Elle sera visible après validation par ${structure.name}.`,
      data: { id: video.id, status: video.status },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    if (error instanceof PublicVideoSubmitError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }
    console.error('[API] Erreur POST public challenge video:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi de la vidéo' },
      { status: 500 }
    )
  }
}
