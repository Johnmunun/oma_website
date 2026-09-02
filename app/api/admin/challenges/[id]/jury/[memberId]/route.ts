/**
 * @file app/api/admin/challenges/[id]/jury/[memberId]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireJuryMemberInChallenge } from '@/lib/jury/challenge-jury-scope'
import { updateJuryMemberSchema } from '@/lib/jury/challenge-jury-schema'
import { normalizeCandidateEmail } from '@/lib/candidates/candidate-schema'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params
    const access = await requireJuryMemberInChallenge(id, memberId, 'jury.view')
    if (!access.ok) return access.response

    return NextResponse.json({ success: true, data: access.member })
  } catch (error) {
    console.error('[API] Erreur GET jury member:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params
    const access = await requireJuryMemberInChallenge(id, memberId, 'jury.update')
    if (!access.ok) return access.response

    const data = updateJuryMemberSchema.parse(await request.json())
    const updateData: Record<string, unknown> = {}

    if (data.fullName !== undefined) updateData.fullName = data.fullName.trim()
    if (data.email !== undefined) updateData.email = normalizeCandidateEmail(data.email)
    if (data.title !== undefined) updateData.title = data.title?.trim() || null
    if (data.bio !== undefined) updateData.bio = data.bio?.trim() || null
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder

    if (data.email && data.email !== access.member.email) {
      const duplicate = await prisma.challengeJuryMember.findUnique({
        where: {
          challengeId_email: {
            challengeId: id,
            email: normalizeCandidateEmail(data.email),
          },
        },
      })
      if (duplicate && duplicate.id !== memberId) {
        return NextResponse.json(
          { success: false, error: 'Cet email est déjà utilisé' },
          { status: 409 }
        )
      }
    }

    const member = await prisma.challengeJuryMember.update({
      where: { id: memberId },
      data: updateData,
      include: { _count: { select: { evaluations: true } } },
    })

    await prisma.auditLog.create({
      data: {
        userId: access.session.user.id,
        action: 'jury_member.update',
        target: 'ChallengeJuryMember',
        payload: { id: member.id, challengeId: id },
      },
    })

    return NextResponse.json({ success: true, message: 'Membre mis à jour', data: member })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur PUT jury member:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params
    const access = await requireJuryMemberInChallenge(id, memberId, 'jury.assign')
    if (!access.ok) return access.response

    const body = z.object({ action: z.enum(['regenerate_token']) }).parse(await request.json())

    if (body.action === 'regenerate_token') {
      const member = await prisma.challengeJuryMember.update({
        where: { id: memberId },
        data: { accessToken: randomUUID() },
        include: { _count: { select: { evaluations: true } } },
      })

      return NextResponse.json({
        success: true,
        message: 'Lien jury régénéré',
        data: member,
      })
    }

    return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur PATCH jury member:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'action' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params
    const access = await requireJuryMemberInChallenge(id, memberId, 'jury.delete')
    if (!access.ok) return access.response

    await prisma.challengeJuryMember.delete({ where: { id: memberId } })

    await prisma.auditLog.create({
      data: {
        userId: access.session.user.id,
        action: 'jury_member.delete',
        target: 'ChallengeJuryMember',
        payload: { id: memberId, challengeId: id },
      },
    })

    return NextResponse.json({ success: true, message: 'Membre supprimé' })
  } catch (error) {
    console.error('[API] Erreur DELETE jury member:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
