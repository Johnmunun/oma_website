/**
 * GET/PATCH admin — messages chat live
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireChallengePermission } from '@/lib/challenges/challenge-scope'

const patchSchema = z.object({
  messageId: z.string().uuid(),
  isHidden: z.boolean(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const access = await requireChallengePermission(id, 'live.view')
    const viewAccess = access.ok
      ? access
      : await requireChallengePermission(id, 'challenges.view')
    if (!viewAccess.ok) return viewAccess.response

    const includeHidden = request.nextUrl.searchParams.get('all') === '1'

    const messages = await prisma.challengeLiveChatMessage.findMany({
      where: {
        challengeId: id,
        ...(includeHidden ? {} : { isHidden: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        authorName: true,
        body: true,
        isHidden: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('[API] GET admin live chat:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur chat' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const access = await requireChallengePermission(id, 'live.update')
    const editAccess = access.ok
      ? access
      : await requireChallengePermission(id, 'challenges.settings')
    if (!editAccess.ok) return editAccess.response

    const body = patchSchema.parse(await request.json())

    const updated = await prisma.challengeLiveChatMessage.updateMany({
      where: { id: body.messageId, challengeId: id },
      data: { isHidden: body.isHidden },
    })

    if (updated.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Message introuvable' },
        { status: 404 }
      )
    }

    await prisma.auditLog.create({
      data: {
        userId: editAccess.session.user.id,
        action: body.isHidden ? 'challenge.live_chat.hide' : 'challenge.live_chat.unhide',
        target: 'ChallengeLiveChatMessage',
        payload: { challengeId: id, messageId: body.messageId },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] PATCH admin live chat:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur moderation' },
      { status: 500 }
    )
  }
}
