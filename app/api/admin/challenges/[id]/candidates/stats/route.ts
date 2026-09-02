/**
 * @file app/api/admin/challenges/[id]/candidates/stats/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { CandidateStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireChallengePermission } from '@/lib/challenges/challenge-scope'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const access = await requireChallengePermission(id, 'candidates.view')
    if (!access.ok) return access.response

    const [total, pending, approved, rejected] = await Promise.all([
      prisma.candidate.count({ where: { challengeId: id } }),
      prisma.candidate.count({
        where: { challengeId: id, status: CandidateStatus.PENDING },
      }),
      prisma.candidate.count({
        where: { challengeId: id, status: CandidateStatus.APPROVED },
      }),
      prisma.candidate.count({
        where: { challengeId: id, status: CandidateStatus.REJECTED },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: { total, pending, approved, rejected },
    })
  } catch (error) {
    console.error('[API] Erreur GET candidate stats:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
