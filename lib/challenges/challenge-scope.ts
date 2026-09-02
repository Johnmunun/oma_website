import 'server-only'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requirePermission,
  isPermissionDenied,
  type PermissionSession,
} from '@/lib/authz/require-permission'

export type ChallengeWithStructure = {
  id: string
  structureId: string
  name: string
  slug: string
  description: string | null
  status: string
  structure: { id: string; name: string; slug: string }
}

export async function getChallengeById(challengeId: string) {
  return prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      structure: { select: { id: true, name: true, slug: true } },
    },
  })
}

export async function getChallengeByStructureAndSlug(structureId: string, slug: string) {
  return prisma.challenge.findUnique({
    where: {
      structureId_slug: { structureId, slug },
    },
    include: {
      structure: { select: { id: true, name: true, slug: true } },
    },
  })
}

export async function requireChallengePermission(
  challengeId: string,
  permission: string
): Promise<
  | { ok: true; session: PermissionSession; challenge: ChallengeWithStructure }
  | { ok: false; response: NextResponse }
> {
  const challenge = await getChallengeById(challengeId)

  if (!challenge) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Challenge introuvable' },
        { status: 404 }
      ),
    }
  }

  const session = await requirePermission(permission, {
    structureId: challenge.structureId,
  })

  if (isPermissionDenied(session)) {
    return { ok: false, response: session }
  }

  return { ok: true, session, challenge }
}

export async function requireStructurePermission(
  structureId: string,
  permission: string
): Promise<
  | { ok: true; session: PermissionSession }
  | { ok: false; response: NextResponse }
> {
  const structure = await prisma.structure.findUnique({
    where: { id: structureId },
    select: { id: true },
  })

  if (!structure) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Structure introuvable' },
        { status: 404 }
      ),
    }
  }

  const session = await requirePermission(permission, { structureId })
  if (isPermissionDenied(session)) {
    return { ok: false, response: session }
  }

  return { ok: true, session }
}
