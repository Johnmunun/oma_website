/**
 * @file app/api/admin/challenges/[id]/jury/stats/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { ChallengeVideoStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireChallengePermission } from '@/lib/challenges/challenge-scope'
import { getChallengeJuryRankings } from '@/lib/jury/load-public-jury-portal'
import {
  getActivePhase,
  parsePhasesSettingsFromChallenge,
} from '@/lib/challenges/challenge-phase-settings'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const access = await requireChallengePermission(id, 'jury.view')
    if (!access.ok) return access.response

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: { settings: true },
    })
    const phases = parsePhasesSettingsFromChallenge(challenge?.settings)
    const activePhase = getActivePhase(phases)

    const candidatePhaseWhere = phases.enabled
      ? activePhase
        ? { phaseId: activePhase.id }
        : { phaseId: '___no_active_phase___' }
      : {}

    const [memberCount, activeMembers, evaluationCount, publishedVideos, rankings] =
      await Promise.all([
        prisma.challengeJuryMember.count({ where: { challengeId: id } }),
        prisma.challengeJuryMember.count({ where: { challengeId: id, isActive: true } }),
        prisma.challengeJuryEvaluation.count({
          where: {
            challengeId: id,
            ...(phases.enabled
              ? { candidate: candidatePhaseWhere }
              : {}),
          },
        }),
        prisma.challengeVideo.count({
          where: {
            challengeId: id,
            status: ChallengeVideoStatus.PUBLISHED,
            ...(phases.enabled
              ? { candidate: candidatePhaseWhere }
              : {}),
          },
        }),
        getChallengeJuryRankings(id, {
          phasesEnabled: phases.enabled,
          phaseId: activePhase?.id ?? null,
        }),
      ])

    return NextResponse.json({
      success: true,
      data: {
        memberCount,
        activeMembers,
        evaluationCount,
        publishedVideos,
        rankedCandidates: rankings.length,
        rankings,
        activePhase: activePhase
          ? { id: activePhase.id, name: activePhase.name }
          : null,
        phasesEnabled: phases.enabled,
      },
    })
  } catch (error) {
    console.error('[API] Erreur GET jury stats:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
