/**
 * @file app/api/admin/challenges/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  updateChallengeSchema,
  parseOptionalDate,
} from '@/lib/challenges/challenge-schema'
import { requireChallengePermission } from '@/lib/challenges/challenge-scope'

const STRUCTURE_PUBLIC_SELECT = {
  id: true,
  name: true,
  slug: true,
  landingPagePath: true,
  subdomain: true,
} as const

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
      include: {
        structure: { select: STRUCTURE_PUBLIC_SELECT },
      },
    })

    return NextResponse.json({ success: true, data: challenge })
  } catch (error) {
    console.error('[API] Erreur GET challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const access = await requireChallengePermission(id, 'challenges.update')
    if (!access.ok) return access.response

    const data = updateChallengeSchema.parse(await request.json())
    const { challenge, session } = access

    if (data.status === 'ACTIVE') {
      const publishCheck = await requireChallengePermission(id, 'challenges.publish')
      if (!publishCheck.ok) return publishCheck.response
    }

    if (data.slug && data.slug !== challenge.slug) {
      const taken = await prisma.challenge.findUnique({
        where: {
          structureId_slug: {
            structureId: challenge.structureId,
            slug: data.slug,
          },
        },
      })
      if (taken) {
        return NextResponse.json(
          { success: false, error: 'Ce slug est déjà utilisé' },
          { status: 409 }
        )
      }
    }

    const updateData: Prisma.ChallengeUpdateInput = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.description !== undefined) updateData.description = data.description
    if (data.status !== undefined) updateData.status = data.status
    if (data.startsAt !== undefined) updateData.startsAt = parseOptionalDate(data.startsAt)
    if (data.endsAt !== undefined) updateData.endsAt = parseOptionalDate(data.endsAt)
    if (data.settings !== undefined) {
      updateData.settings = data.settings as Prisma.InputJsonValue
    }

    const updated = await prisma.challenge.update({
      where: { id },
      data: updateData,
      include: {
        structure: { select: STRUCTURE_PUBLIC_SELECT },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'challenge.update',
        target: 'Challenge',
        payload: { id, changes: data },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur PUT challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const access = await requireChallengePermission(id, 'challenges.delete')
    if (!access.ok) return access.response

    await prisma.challenge.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: access.session.user.id,
        action: 'challenge.delete',
        target: 'Challenge',
        payload: { id },
      },
    })

    return NextResponse.json({ success: true, message: 'Challenge supprimé' })
  } catch (error) {
    console.error('[API] Erreur DELETE challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
