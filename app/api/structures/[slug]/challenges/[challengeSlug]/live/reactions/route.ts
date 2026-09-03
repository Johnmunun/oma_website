/**
 * GET/POST réactions emoji live
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  LiveReactionError,
  hashReactionClientIp,
  listPublicLiveReactions,
  liveReactionPostSchema,
  postPublicLiveReaction,
} from '@/lib/challenges/live-reactions'
import { checkRateLimit, getClientIP, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; challengeSlug: string }> }
) {
  try {
    const { slug, challengeSlug } = await params
    const after = request.nextUrl.searchParams.get('after')
    const reactions = await listPublicLiveReactions(slug, challengeSlug, after)
    return NextResponse.json({ success: true, data: reactions })
  } catch (error) {
    if (error instanceof LiveReactionError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }
    console.error('[API] GET live reactions:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur réactions' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; challengeSlug: string }> }
) {
  try {
    const { slug, challengeSlug } = await params
    const ip = getClientIP(request)
    const rate = await checkRateLimit(ip, RATE_LIMIT_CONFIGS.liveReaction)
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Trop de réactions. Patientez un instant.' },
        { status: 429 }
      )
    }

    const body = liveReactionPostSchema.parse(await request.json())
    const reaction = await postPublicLiveReaction(slug, challengeSlug, body.emoji, {
      ipHash: hashReactionClientIp(ip),
    })
    return NextResponse.json({ success: true, data: reaction })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Emoji invalide' },
        { status: 400 }
      )
    }
    if (error instanceof LiveReactionError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }
    console.error('[API] POST live reactions:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l’envoi' },
      { status: 500 }
    )
  }
}
