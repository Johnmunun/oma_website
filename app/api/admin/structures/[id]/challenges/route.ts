/**
 * @file app/api/admin/structures/[id]/challenges/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  createChallengeSchema,
  parseOptionalDate,
} from '@/lib/challenges/challenge-schema'
import { requireStructurePermission } from '@/lib/challenges/challenge-scope'
import { slugifyStructureName } from '@/lib/structures/slug'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: structureId } = await params
    const access = await requireStructurePermission(structureId, 'challenges.view')
    if (!access.ok) return access.response

    const challenges = await prisma.challenge.findMany({
      where: { structureId },
      orderBy: { createdAt: 'desc' },
      include: {
        structure: { select: { id: true, name: true, slug: true } },
      },
    })

    return NextResponse.json({ success: true, data: challenges })
  } catch (error) {
    console.error('[API] Erreur GET structure challenges:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des challenges' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: structureId } = await params
    const access = await requireStructurePermission(structureId, 'challenges.create')
    if (!access.ok) return access.response

    const body = await request.json()
    const data = createChallengeSchema.parse(body)
    const slug = data.slug || slugifyStructureName(data.name)

    if (data.status === 'ACTIVE') {
      const publishAccess = await requireStructurePermission(structureId, 'challenges.publish')
      if (!publishAccess.ok) return publishAccess.response
    }

    const existing = await prisma.challenge.findUnique({
      where: { structureId_slug: { structureId, slug } },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ce slug est déjà utilisé pour cette structure' },
        { status: 409 }
      )
    }

    const challenge = await prisma.challenge.create({
      data: {
        structureId,
        name: data.name,
        slug,
        description: data.description ?? null,
        status: data.status,
        startsAt: parseOptionalDate(data.startsAt),
        endsAt: parseOptionalDate(data.endsAt),
        settings: data.settings ?? undefined,
      },
      include: {
        structure: { select: { id: true, name: true, slug: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: access.session.user.id,
        action: 'challenge.create',
        target: 'Challenge',
        payload: { id: challenge.id, structureId, slug: challenge.slug },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Challenge créé',
      data: challenge,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur POST structure challenges:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du challenge' },
      { status: 500 }
    )
  }
}
