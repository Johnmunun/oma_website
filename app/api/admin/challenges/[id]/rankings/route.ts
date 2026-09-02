/**
 * GET/PATCH /api/admin/challenges/[id]/rankings
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireChallengePermission } from '@/lib/challenges/challenge-scope'
import {
  mergeChallengeFeatureSettings,
  parseFeatureSettingsFromChallenge,
  updateRankingSettingsSchema,
  updateVotesSettingsSchema,
} from '@/lib/challenges/challenge-feature-settings'
import { buildChallengeRankings } from '@/lib/rankings/build-challenge-rankings'

const patchRankingsSchema = z.object({
  ranking: updateRankingSettingsSchema.optional(),
  votes: updateVotesSettingsSchema.optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const access = await requireChallengePermission(id, 'challenges.view')
    if (!access.ok) return access.response

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: { id: true, settings: true },
    })
    if (!challenge) {
      return NextResponse.json({ success: false, error: 'Challenge introuvable' }, { status: 404 })
    }

    const features = parseFeatureSettingsFromChallenge(challenge.settings)

    const [rankings, totalVotes, uniqueVoters] = await Promise.all([
      buildChallengeRankings(id, {
        rankingSettings: features.ranking,
        votesEnabled: features.votes.enabled,
        onlyPublishedVideos: true,
      }),
      prisma.challengeVote.count({ where: { challengeId: id } }),
      prisma.challengeVote.count({ where: { challengeId: id } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        features,
        rankings,
        stats: {
          rankedCandidates: rankings.length,
          totalVotes,
          uniqueVoters,
        },
      },
    })
  } catch (error) {
    console.error('[API] Erreur GET rankings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du classement' },
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
    const access = await requireChallengePermission(id, 'challenges.settings')
    if (!access.ok) return access.response

    const body = patchRankingsSchema.parse(await request.json())

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: { settings: true },
    })
    if (!challenge) {
      return NextResponse.json({ success: false, error: 'Challenge introuvable' }, { status: 404 })
    }

    const mergedSettings = mergeChallengeFeatureSettings(challenge.settings, {
      ranking: body.ranking,
      votes: body.votes,
    })

    const updated = await prisma.challenge.update({
      where: { id },
      data: { settings: mergedSettings },
      select: { id: true, settings: true },
    })

    const features = parseFeatureSettingsFromChallenge(updated.settings)

    await prisma.auditLog.create({
      data: {
        userId: access.session.user.id,
        action: 'challenge.rankings.update',
        target: 'Challenge',
        payload: { id, ranking: body.ranking, votes: body.votes },
      },
    })

    return NextResponse.json({ success: true, data: { features } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur PATCH rankings:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
