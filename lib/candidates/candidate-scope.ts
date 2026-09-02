import 'server-only'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireChallengePermission,
} from '@/lib/challenges/challenge-scope'
import {
  requirePermission,
  isPermissionDenied,
  type PermissionSession,
} from '@/lib/authz/require-permission'

type CandidateRecord = NonNullable<Awaited<ReturnType<typeof getCandidateById>>>

export async function getCandidateById(candidateId: string) {
  return prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      challenge: {
        include: {
          structure: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  })
}

export async function requireCandidateInChallenge(
  challengeId: string,
  candidateId: string,
  permission: string
): Promise<
  | { ok: true; session: PermissionSession; candidate: CandidateRecord }
  | { ok: false; response: NextResponse }
> {
  const access = await requireChallengePermission(challengeId, permission)
  if (!access.ok) return access

  const candidate = await getCandidateById(candidateId)
  if (!candidate) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Candidat introuvable' },
        { status: 404 }
      ),
    }
  }

  if (candidate.challengeId !== challengeId) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Candidat hors de ce challenge' },
        { status: 403 }
      ),
    }
  }

  return { ok: true, session: access.session, candidate }
}

export async function requireCandidatePermission(
  candidateId: string,
  permission: string
): Promise<
  | { ok: true; session: PermissionSession; candidate: CandidateRecord }
  | { ok: false; response: NextResponse }
> {
  const candidate = await getCandidateById(candidateId)
  if (!candidate) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Candidat introuvable' },
        { status: 404 }
      ),
    }
  }

  const session = await requirePermission(permission, {
    structureId: candidate.challenge.structureId,
  })
  if (isPermissionDenied(session)) {
    return { ok: false, response: session }
  }

  return { ok: true, session, candidate }
}
