/**
 * GET/PATCH /api/admin/challenges/[id]/phases
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireChallengePermission } from '@/lib/challenges/challenge-scope'
import {
  getActivePhase,
  mergeChallengePhasesSettings,
  parsePhasesSettingsFromChallenge,
  updatePhasesSettingsSchema,
} from '@/lib/challenges/challenge-phase-settings'

const patchSchema = z.object({
  phases: updatePhasesSettingsSchema.optional(),
  /** Assignation candidats → phaseId (null = retirer) */
  assignments: z
    .array(
      z.object({
        candidateId: z.string().uuid(),
        phaseId: z.string().min(8).max(64).nullable(),
      })
    )
    .optional(),
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
      select: {
        id: true,
        name: true,
        slug: true,
        settings: true,
        structure: {
          select: { slug: true, landingPagePath: true, subdomain: true },
        },
      },
    })

    if (!challenge) {
      return NextResponse.json({ success: false, error: 'Challenge introuvable' }, { status: 404 })
    }

    const phases = parsePhasesSettingsFromChallenge(challenge.settings)

    const candidates = await prisma.candidate.findMany({
      where: { challengeId: id, status: 'APPROVED' },
      orderBy: { fullName: 'asc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        candidateCode: true,
        phaseId: true,
        status: true,
        video: { select: { status: true } },
      },
    })

    const counts = phases.items.map((phase) => ({
      phaseId: phase.id,
      candidates: candidates.filter((c) => c.phaseId === phase.id).length,
    }))

    return NextResponse.json({
      success: true,
      data: {
        challenge: {
          id: challenge.id,
          name: challenge.name,
          slug: challenge.slug,
          structure: challenge.structure,
        },
        phases,
        activePhase: getActivePhase(phases),
        candidates,
        counts,
      },
    })
  } catch (error) {
    console.error('[API] Erreur GET phases:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des phases' },
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
    const editAccess = access.ok
      ? access
      : await requireChallengePermission(id, 'challenges.update')
    if (!editAccess.ok) return editAccess.response

    const body = patchSchema.parse(await request.json())

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: { settings: true },
    })
    if (!challenge) {
      return NextResponse.json({ success: false, error: 'Challenge introuvable' }, { status: 404 })
    }

    let settings: unknown = challenge.settings
    if (body.phases) {
      const merged = mergeChallengePhasesSettings(challenge.settings, body.phases)
      settings = merged
      await prisma.challenge.update({
        where: { id },
        data: { settings: merged as Prisma.InputJsonValue },
      })
    }

    const phases = parsePhasesSettingsFromChallenge(settings)

    if (body.assignments?.length) {
      const validIds = new Set(phases.items.map((p) => p.id))
      for (const row of body.assignments) {
        if (row.phaseId && !validIds.has(row.phaseId)) {
          return NextResponse.json(
            { success: false, error: `Phase inconnue: ${row.phaseId}` },
            { status: 400 }
          )
        }
      }

      await prisma.$transaction(
        body.assignments.map((row) =>
          prisma.candidate.updateMany({
            where: { id: row.candidateId, challengeId: id },
            data: { phaseId: row.phaseId },
          })
        )
      )
    }

    await prisma.auditLog.create({
      data: {
        userId: editAccess.session.user.id,
        action: 'challenge.phases.update',
        target: 'Challenge',
        payload: {
          id,
          enabled: phases.enabled,
          activePhaseId: phases.activePhaseId,
          assignmentCount: body.assignments?.length ?? 0,
        },
      },
    })

    const candidates = await prisma.candidate.findMany({
      where: { challengeId: id, status: 'APPROVED' },
      orderBy: { fullName: 'asc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        candidateCode: true,
        phaseId: true,
        status: true,
        video: { select: { status: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        phases,
        activePhase: getActivePhase(phases),
        candidates,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur PATCH phases:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour des phases' },
      { status: 500 }
    )
  }
}
