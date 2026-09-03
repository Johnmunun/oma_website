/**
 * GET/PATCH /api/admin/challenges/[id]/live
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireChallengePermission } from '@/lib/challenges/challenge-scope'
import {
  mergeChallengeLiveSettings,
  parseLiveSettingsFromChallenge,
  resolveLiveEmbedUrl,
  resolveReplayEmbedUrl,
  updateLiveSettingsSchema,
} from '@/lib/challenges/challenge-live-settings'
import {
  getChallengeLiveUrl,
  getStructurePathSegment,
} from '@/lib/structures/public-url'

const patchLiveSchema = z.object({
  live: updateLiveSettingsSchema,
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const access = await requireChallengePermission(id, 'live.view')
    const viewAccess = access.ok
      ? access
      : await requireChallengePermission(id, 'challenges.view')
    if (!viewAccess.ok) return viewAccess.response

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        settings: true,
        structure: {
          select: {
            slug: true,
            landingPagePath: true,
            subdomain: true,
          },
        },
      },
    })

    if (!challenge) {
      return NextResponse.json({ success: false, error: 'Challenge introuvable' }, { status: 404 })
    }

    const live = parseLiveSettingsFromChallenge(challenge.settings)
    const embedUrl = resolveLiveEmbedUrl(live)
    const replayUrl = resolveReplayEmbedUrl(live)
    const publicUrl = getChallengeLiveUrl(challenge.structure, challenge.slug)
    const publicPath = `/s/${getStructurePathSegment(challenge.structure)}/challenges/${challenge.slug}/live`

    return NextResponse.json({
      success: true,
      data: {
        challenge: {
          id: challenge.id,
          name: challenge.name,
          slug: challenge.slug,
          status: challenge.status,
          structure: challenge.structure,
        },
        live,
        embedUrl,
        replayUrl,
        publicUrl,
        publicPath,
      },
    })
  } catch (error) {
    console.error('[API] Erreur GET live:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du live' },
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

    const body = patchLiveSchema.parse(await request.json())

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: { settings: true },
    })
    if (!challenge) {
      return NextResponse.json({ success: false, error: 'Challenge introuvable' }, { status: 404 })
    }

    const mergedSettings = mergeChallengeLiveSettings(challenge.settings, body.live)

    const updated = await prisma.challenge.update({
      where: { id },
      data: { settings: mergedSettings as Prisma.InputJsonValue },
      select: {
        id: true,
        settings: true,
        slug: true,
        structure: {
          select: {
            slug: true,
            landingPagePath: true,
            subdomain: true,
          },
        },
      },
    })

    const live = parseLiveSettingsFromChallenge(updated.settings)
    const embedUrl = resolveLiveEmbedUrl(live)
    const replayUrl = resolveReplayEmbedUrl(live)

    await prisma.auditLog.create({
      data: {
        userId: editAccess.session.user.id,
        action: 'challenge.live.update',
        target: 'Challenge',
        payload: {
          id,
          enabled: live.enabled,
          isLive: live.isLive,
          showOnHub: live.showOnHub,
          replayEnabled: live.replayEnabled,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        live,
        embedUrl,
        replayUrl,
        publicUrl: getChallengeLiveUrl(updated.structure, updated.slug),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur PATCH live:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du live' },
      { status: 500 }
    )
  }
}
