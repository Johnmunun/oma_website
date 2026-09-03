/**
 * GET/POST chat live public
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  LiveChatError,
  listPublicLiveChatMessages,
  liveChatPostSchema,
  postPublicLiveChatMessage,
} from '@/lib/challenges/live-chat'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; challengeSlug: string }> }
) {
  try {
    const { slug, challengeSlug } = await params
    const after = request.nextUrl.searchParams.get('after')
    const messages = await listPublicLiveChatMessages(slug, challengeSlug, after)
    return NextResponse.json({ success: true, data: messages })
  } catch (error) {
    if (error instanceof LiveChatError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }
    console.error('[API] GET live chat:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur chat' },
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
    const body = liveChatPostSchema.parse(await request.json())
    const message = await postPublicLiveChatMessage(slug, challengeSlug, body)
    return NextResponse.json({ success: true, data: message })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Données invalides',
        },
        { status: 400 }
      )
    }
    if (error instanceof LiveChatError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }
    console.error('[API] POST live chat:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l’envoi' },
      { status: 500 }
    )
  }
}
