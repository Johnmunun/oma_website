import 'server-only'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireChallengePermission } from '@/lib/challenges/challenge-scope'
import {
  requirePermission,
  isPermissionDenied,
  type PermissionSession,
} from '@/lib/authz/require-permission'

export async function getJuryMemberById(memberId: string) {
  return prisma.challengeJuryMember.findUnique({
    where: { id: memberId },
    include: {
      challenge: {
        include: {
          structure: { select: { id: true, name: true, slug: true } },
        },
      },
      _count: { select: { evaluations: true } },
    },
  })
}

export async function requireJuryMemberInChallenge(
  challengeId: string,
  memberId: string,
  permission: string
) {
  const access = await requireChallengePermission(challengeId, permission)
  if (!access.ok) return access

  const member = await getJuryMemberById(memberId)
  if (!member) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, error: 'Membre du jury introuvable' },
        { status: 404 }
      ),
    }
  }

  if (member.challengeId !== challengeId) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, error: 'Membre hors de ce challenge' },
        { status: 403 }
      ),
    }
  }

  return { ok: true as const, session: access.session, member }
}

export async function requireJuryMemberPermission(
  memberId: string,
  permission: string
): Promise<
  | { ok: true; session: PermissionSession; member: NonNullable<Awaited<ReturnType<typeof getJuryMemberById>>> }
  | { ok: false; response: NextResponse }
> {
  const member = await getJuryMemberById(memberId)
  if (!member) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Membre du jury introuvable' },
        { status: 404 }
      ),
    }
  }

  const session = await requirePermission(permission, {
    structureId: member.challenge.structureId,
  })
  if (isPermissionDenied(session)) {
    return { ok: false, response: session }
  }

  return { ok: true, session, member }
}
