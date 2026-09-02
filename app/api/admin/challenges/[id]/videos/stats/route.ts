/**
 * @file app/api/admin/challenges/[id]/videos/stats/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { ChallengeVideoStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireChallengePermission } from '@/lib/challenges/challenge-scope'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const access = await requireChallengePermission(id, 'videos.view')
    if (!access.ok) return access.response

    const [total, pending, published, rejected, approvedCandidates] = await Promise.all([
      prisma.challengeVideo.count({ where: { challengeId: id } }),
      prisma.challengeVideo.count({
        where: { challengeId: id, status: ChallengeVideoStatus.PENDING },
      }),
      prisma.challengeVideo.count({
        where: { challengeId: id, status: ChallengeVideoStatus.PUBLISHED },
      }),
      prisma.challengeVideo.count({
        where: { challengeId: id, status: ChallengeVideoStatus.REJECTED },
      }),
      prisma.candidate.count({
        where: { challengeId: id, status: 'APPROVED' },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        total,
        pending,
        published,
        rejected,
        approvedCandidates,
        awaitingVideo: Math.max(approvedCandidates - total, 0),
      },
    })
  } catch (error) {
    console.error('[API] Erreur GET video stats:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
