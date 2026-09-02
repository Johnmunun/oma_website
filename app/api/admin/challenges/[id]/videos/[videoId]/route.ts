/**
 * @file app/api/admin/challenges/[id]/videos/[videoId]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { ChallengeVideoStatus } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireVideoInChallenge } from '@/lib/videos/challenge-video-scope'
import {
  challengeVideoStatusActionSchema,
  updateChallengeVideoSchema,
} from '@/lib/videos/challenge-video-schema'
import { parseVideoUrl } from '@/lib/videos/parse-video-url'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const { id, videoId } = await params
    const access = await requireVideoInChallenge(id, videoId, 'videos.view')
    if (!access.ok) return access.response

    return NextResponse.json({ success: true, data: access.video })
  } catch (error) {
    console.error('[API] Erreur GET challenge video:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const { id, videoId } = await params
    const access = await requireVideoInChallenge(id, videoId, 'videos.update')
    if (!access.ok) return access.response

    const data = updateChallengeVideoSchema.parse(await request.json())
    const updateData: Record<string, unknown> = {}

    if (data.title !== undefined) updateData.title = data.title?.trim() || null
    if (data.description !== undefined) updateData.description = data.description?.trim() || null
    if (data.reviewNotes !== undefined) updateData.reviewNotes = data.reviewNotes?.trim() || null

    if (data.videoUrl !== undefined) {
      const parsed = parseVideoUrl(data.videoUrl)
      if (!parsed && !data.source) {
        return NextResponse.json(
          { success: false, error: 'URL vidéo invalide' },
          { status: 400 }
        )
      }
      updateData.videoUrl = parsed?.videoUrl ?? data.videoUrl
      updateData.thumbnailUrl = data.thumbnailUrl ?? parsed?.thumbnailUrl ?? null
      updateData.source = data.source ?? parsed?.source
    }

    if (data.status !== undefined) {
      updateData.status = data.status
      const now = new Date()
      if (data.status === ChallengeVideoStatus.PUBLISHED) {
        updateData.publishedAt = now
        updateData.rejectedAt = null
      } else if (data.status === ChallengeVideoStatus.REJECTED) {
        updateData.rejectedAt = now
        updateData.publishedAt = null
      } else {
        updateData.publishedAt = null
        updateData.rejectedAt = null
      }
    }

    const video = await prisma.challengeVideo.update({
      where: { id: videoId },
      data: updateData,
      include: {
        candidate: {
          select: { id: true, fullName: true, email: true, status: true },
        },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: access.session.user.id,
        action: 'challenge_video.update',
        target: 'ChallengeVideo',
        payload: { id: video.id, challengeId: id },
      },
    })

    return NextResponse.json({ success: true, message: 'Vidéo mise à jour', data: video })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur PUT challenge video:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const { id, videoId } = await params
    const body = challengeVideoStatusActionSchema.parse(await request.json())

    const permission =
      body.action === 'publish'
        ? 'videos.publish'
        : body.action === 'unpublish'
          ? 'videos.unpublish'
          : 'videos.update'

    const access = await requireVideoInChallenge(id, videoId, permission)
    if (!access.ok) return access.response

    const now = new Date()
    let status: ChallengeVideoStatus
    let publishedAt: Date | null = null
    let rejectedAt: Date | null = null

    if (body.action === 'publish') {
      status = ChallengeVideoStatus.PUBLISHED
      publishedAt = now
    } else if (body.action === 'reject') {
      status = ChallengeVideoStatus.REJECTED
      rejectedAt = now
    } else {
      status = ChallengeVideoStatus.PENDING
    }

    const video = await prisma.challengeVideo.update({
      where: { id: videoId },
      data: {
        status,
        publishedAt,
        rejectedAt,
        reviewNotes: body.reviewNotes?.trim() || access.video.reviewNotes,
      },
      include: {
        candidate: {
          select: { id: true, fullName: true, email: true, status: true },
        },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: access.session.user.id,
        action: `challenge_video.${body.action}`,
        target: 'ChallengeVideo',
        payload: { id: video.id, challengeId: id, status: video.status },
      },
    })

    const messages = {
      publish: 'Vidéo publiée',
      reject: 'Vidéo rejetée',
      unpublish: 'Vidéo dépubliée',
    }

    return NextResponse.json({
      success: true,
      message: messages[body.action],
      data: video,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur PATCH challenge video:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du changement de statut' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const { id, videoId } = await params
    const access = await requireVideoInChallenge(id, videoId, 'videos.delete')
    if (!access.ok) return access.response

    await prisma.challengeVideo.delete({ where: { id: videoId } })

    await prisma.auditLog.create({
      data: {
        userId: access.session.user.id,
        action: 'challenge_video.delete',
        target: 'ChallengeVideo',
        payload: { id: videoId, challengeId: id },
      },
    })

    return NextResponse.json({ success: true, message: 'Vidéo supprimée' })
  } catch (error) {
    console.error('[API] Erreur DELETE challenge video:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
