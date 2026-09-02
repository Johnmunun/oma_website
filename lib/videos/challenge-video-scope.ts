import 'server-only'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireChallengePermission } from '@/lib/challenges/challenge-scope'
import {
  requirePermission,
  isPermissionDenied,
  type PermissionSession,
} from '@/lib/authz/require-permission'

export async function getChallengeVideoById(videoId: string) {
  return prisma.challengeVideo.findUnique({
    where: { id: videoId },
    include: {
      candidate: {
        select: {
          id: true,
          fullName: true,
          email: true,
          status: true,
          videoSubmitToken: true,
        },
      },
      challenge: {
        include: {
          structure: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  })
}

export async function requireVideoInChallenge(
  challengeId: string,
  videoId: string,
  permission: string
): Promise<
  | { ok: true; session: PermissionSession; video: NonNullable<Awaited<ReturnType<typeof getChallengeVideoById>>> }
  | { ok: false; response: NextResponse }
> {
  const access = await requireChallengePermission(challengeId, permission)
  if (!access.ok) return access

  const video = await getChallengeVideoById(videoId)
  if (!video) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Vidéo introuvable' },
        { status: 404 }
      ),
    }
  }

  if (video.challengeId !== challengeId) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Vidéo hors de ce challenge' },
        { status: 403 }
      ),
    }
  }

  return { ok: true, session: access.session, video }
}

export async function requireVideoPermission(
  videoId: string,
  permission: string
): Promise<
  | { ok: true; session: PermissionSession; video: NonNullable<Awaited<ReturnType<typeof getChallengeVideoById>>> }
  | { ok: false; response: NextResponse }
> {
  const video = await getChallengeVideoById(videoId)
  if (!video) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Vidéo introuvable' },
        { status: 404 }
      ),
    }
  }

  const session = await requirePermission(permission, {
    structureId: video.challenge.structureId,
  })
  if (isPermissionDenied(session)) {
    return { ok: false, response: session }
  }

  return { ok: true, session, video }
}
