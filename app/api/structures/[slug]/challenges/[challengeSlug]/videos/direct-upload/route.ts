/**
 * POST — crée une URL d'upload Cloudflare Stream (candidat public)
 * multipart ≤200 Mo, tus au-delà (jusqu'à 2 Go)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { CandidateStatus, ChallengeStatus, StructureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  CloudflareStreamError,
  CLOUDFLARE_MULTIPART_MAX_BYTES,
  CLOUDFLARE_TUS_MAX_BYTES,
  createCloudflareDirectUpload,
  createCloudflareTusDirectUpload,
  isCloudflareStreamConfigured,
  pickCloudflareUploadMode,
} from '@/lib/videos/cloudflare-stream'

const bodySchema = z.object({
  token: z.string().min(8),
  fileName: z.string().max(200).optional().nullable(),
  fileSize: z.number().int().positive().max(CLOUDFLARE_TUS_MAX_BYTES),
  maxDurationSeconds: z.number().int().min(30).max(3600).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; challengeSlug: string }> }
) {
  try {
    if (!isCloudflareStreamConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Upload Cloudflare non configuré. Ajoutez CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_STREAM_API_TOKEN et CLOUDFLARE_STREAM_CUSTOMER_CODE.',
        },
        { status: 503 }
      )
    }

    const { slug, challengeSlug } = await params
    const body = bodySchema.parse(await request.json())
    const segment = slug.trim().toLowerCase()
    const challengeSlugNorm = challengeSlug.trim().toLowerCase()

    const structure = await prisma.structure.findFirst({
      where: {
        OR: [{ slug: segment }, { landingPagePath: segment }, { subdomain: segment }],
        isActive: true,
        status: StructureStatus.ACTIVE,
      },
      select: { id: true },
    })
    if (!structure) {
      return NextResponse.json({ success: false, error: 'Challenge introuvable' }, { status: 404 })
    }

    const challenge = await prisma.challenge.findFirst({
      where: {
        structureId: structure.id,
        slug: challengeSlugNorm,
        status: ChallengeStatus.ACTIVE,
      },
      select: { id: true },
    })
    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge introuvable ou fermé' },
        { status: 404 }
      )
    }

    const candidate = await prisma.candidate.findFirst({
      where: {
        challengeId: challenge.id,
        videoSubmitToken: body.token,
        status: CandidateStatus.APPROVED,
      },
      select: { id: true, fullName: true },
    })
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Lien invalide ou candidature non validée' },
        { status: 403 }
      )
    }

    const mode = pickCloudflareUploadMode(body.fileSize)
    const metaName = body.fileName?.trim() || `Prestation — ${candidate.fullName}`
    const maxDurationSeconds = body.maxDurationSeconds ?? 600

    const upload =
      mode === 'tus'
        ? await createCloudflareTusDirectUpload({
            uploadLength: body.fileSize,
            maxDurationSeconds,
            creator: candidate.id,
            metaName,
          })
        : await createCloudflareDirectUpload({
            maxDurationSeconds,
            creator: candidate.id,
            metaName,
          })

    return NextResponse.json({
      success: true,
      data: {
        uploadURL: upload.uploadURL,
        uid: upload.uid,
        mode,
        maxBytes: CLOUDFLARE_TUS_MAX_BYTES,
        multipartMaxBytes: CLOUDFLARE_MULTIPART_MAX_BYTES,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    if (error instanceof CloudflareStreamError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }
    console.error('[API] Erreur direct-upload public:', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la préparation de l'upload" },
      { status: 500 }
    )
  }
}
