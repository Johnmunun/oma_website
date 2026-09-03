/**
 * POST — URL d'upload Cloudflare Stream (admin)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireChallengePermission } from '@/lib/challenges/challenge-scope'
import {
  CloudflareStreamError,
  createCloudflareDirectUpload,
  isCloudflareStreamConfigured,
} from '@/lib/videos/cloudflare-stream'

const bodySchema = z.object({
  fileName: z.string().max(200).optional().nullable(),
  maxDurationSeconds: z.number().int().min(30).max(3600).optional(),
  candidateId: z.string().uuid().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const access = await requireChallengePermission(id, 'videos.upload')
    if (!access.ok) return access.response

    if (!isCloudflareStreamConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Cloudflare Stream non configuré (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_STREAM_API_TOKEN, CLOUDFLARE_STREAM_CUSTOMER_CODE)',
        },
        { status: 503 }
      )
    }

    const body = bodySchema.parse(await request.json().catch(() => ({})))
    const upload = await createCloudflareDirectUpload({
      maxDurationSeconds: body.maxDurationSeconds ?? 600,
      creator: body.candidateId || access.session.user.id,
      metaName: body.fileName?.trim() || undefined,
    })

    return NextResponse.json({
      success: true,
      data: {
        uploadURL: upload.uploadURL,
        uid: upload.uid,
        maxBytes: 200 * 1024 * 1024,
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
    console.error('[API] Erreur admin direct-upload:', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la préparation de l'upload" },
      { status: 500 }
    )
  }
}
