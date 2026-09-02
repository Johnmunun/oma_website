/**
 * @file app/api/admin/challenges/[id]/jury/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireChallengePermission } from '@/lib/challenges/challenge-scope'
import { createJuryMemberSchema } from '@/lib/jury/challenge-jury-schema'
import { normalizeCandidateEmail } from '@/lib/candidates/candidate-schema'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const access = await requireChallengePermission(id, 'jury.view')
    if (!access.ok) return access.response

    const members = await prisma.challengeJuryMember.findMany({
      where: { challengeId: id },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        _count: { select: { evaluations: true } },
      },
    })

    return NextResponse.json({ success: true, data: members })
  } catch (error) {
    console.error('[API] Erreur GET jury:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du jury' },
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
    const access = await requireChallengePermission(id, 'jury.create')
    if (!access.ok) return access.response

    const data = createJuryMemberSchema.parse(await request.json())
    const email = normalizeCandidateEmail(data.email)

    const existing = await prisma.challengeJuryMember.findUnique({
      where: { challengeId_email: { challengeId: id, email } },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà membre du jury' },
        { status: 409 }
      )
    }

    const member = await prisma.challengeJuryMember.create({
      data: {
        challengeId: id,
        fullName: data.fullName.trim(),
        email,
        title: data.title?.trim() || null,
        bio: data.bio?.trim() || null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        accessToken: randomUUID(),
      },
      include: { _count: { select: { evaluations: true } } },
    })

    await prisma.auditLog.create({
      data: {
        userId: access.session.user.id,
        action: 'jury_member.create',
        target: 'ChallengeJuryMember',
        payload: { id: member.id, challengeId: id },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Membre du jury ajouté',
      data: member,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur POST jury:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'ajout du membre' },
      { status: 500 }
    )
  }
}
