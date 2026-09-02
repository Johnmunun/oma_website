/**
 * @file app/api/admin/challenges/[id]/videos/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { CandidateStatus, ChallengeVideoStatus } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireChallengePermission } from '@/lib/challenges/challenge-scope'
import { createChallengeVideoSchema } from '@/lib/videos/challenge-video-schema'
import { parseVideoUrl } from '@/lib/videos/parse-video-url'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const access = await requireChallengePermission(id, 'videos.view')
    if (!access.ok) return access.response

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')?.trim()

    const where: {
      challengeId: string
      status?: ChallengeVideoStatus
      OR?: Array<Record<string, unknown>>
    } = { challengeId: id }

    if (status && ['PENDING', 'PUBLISHED', 'REJECTED'].includes(status)) {
      where.status = status as ChallengeVideoStatus
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { candidate: { fullName: { contains: search, mode: 'insensitive' } } },
        { candidate: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const videos = await prisma.challengeVideo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
      },
    })

    return NextResponse.json({ success: true, data: videos })
  } catch (error) {
    console.error('[API] Erreur GET challenge videos:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des vidéos' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const access = await requireChallengePermission(id, 'videos.upload')
    if (!access.ok) return access.response

    const data = createChallengeVideoSchema.parse(await request.json())

    const candidate = await prisma.candidate.findFirst({
      where: { id: data.candidateId, challengeId: id },
    })

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidat introuvable pour ce challenge' },
        { status: 404 }
      )
    }

    if (candidate.status !== CandidateStatus.APPROVED) {
      return NextResponse.json(
        { success: false, error: 'Seuls les candidats approuvés peuvent avoir une vidéo' },
        { status: 400 }
      )
    }

    const parsed = parseVideoUrl(data.videoUrl)
    if (!parsed && !data.source) {
      return NextResponse.json(
        { success: false, error: 'URL vidéo invalide' },
        { status: 400 }
      )
    }

    const video = await prisma.challengeVideo.upsert({
      where: { candidateId: candidate.id },
      create: {
        challengeId: id,
        candidateId: candidate.id,
        title: data.title?.trim() || `Prestation — ${candidate.fullName}`,
        description: data.description?.trim() || null,
        videoUrl: parsed?.videoUrl ?? data.videoUrl,
        thumbnailUrl: data.thumbnailUrl ?? parsed?.thumbnailUrl ?? null,
        source: data.source ?? parsed?.source ?? 'EXTERNAL',
        status: data.status ?? ChallengeVideoStatus.PENDING,
      },
      update: {
        title: data.title?.trim() || `Prestation — ${candidate.fullName}`,
        description: data.description?.trim() || null,
        videoUrl: parsed?.videoUrl ?? data.videoUrl,
        thumbnailUrl: data.thumbnailUrl ?? parsed?.thumbnailUrl ?? null,
        source: data.source ?? parsed?.source ?? 'EXTERNAL',
        status: data.status ?? ChallengeVideoStatus.PENDING,
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
        action: 'challenge_video.create',
        target: 'ChallengeVideo',
        payload: { id: video.id, challengeId: id, candidateId: candidate.id },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Vidéo enregistrée',
      data: video,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur POST challenge video:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'enregistrement de la vidéo' },
      { status: 500 }
    )
  }
}
