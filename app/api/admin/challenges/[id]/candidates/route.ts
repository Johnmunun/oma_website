/**
 * @file app/api/admin/challenges/[id]/candidates/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { CandidateStatus } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireChallengePermission } from '@/lib/challenges/challenge-scope'
import {
  createCandidateSchema,
  normalizeCandidateEmail,
  parseOptionalBirthDate,
} from '@/lib/candidates/candidate-schema'
import { generateUniqueCandidateCode, backfillMissingCandidateCodes } from '@/lib/candidates/generate-candidate-code'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const access = await requireChallengePermission(id, 'candidates.view')
    if (!access.ok) return access.response

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')?.trim()

    const where: {
      challengeId: string
      status?: CandidateStatus
      OR?: Array<Record<string, unknown>>
    } = { challengeId: id }

    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      where.status = status as CandidateStatus
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { parentName: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { candidateCode: { contains: search, mode: 'insensitive' } },
      ]
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: { slug: true },
    })
    if (challenge) {
      try {
        await backfillMissingCandidateCodes(id, challenge.slug)
      } catch (backfillError) {
        console.warn('[API] Backfill candidateCode ignoré:', backfillError)
      }
    }

    const candidates = await prisma.candidate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: candidates })
  } catch (error) {
    console.error('[API] Erreur GET challenge candidates:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des candidats' },
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
    const access = await requireChallengePermission(id, 'candidates.create')
    if (!access.ok) return access.response

    const data = createCandidateSchema.parse(await request.json())
    const email = normalizeCandidateEmail(data.email)

    const existing = await prisma.candidate.findUnique({
      where: { challengeId_email: { challengeId: id, email } },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà inscrit à ce challenge' },
        { status: 409 }
      )
    }

    const status = data.status ?? CandidateStatus.PENDING
    const now = new Date()

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: { slug: true },
    })
    if (!challenge) {
      return NextResponse.json({ success: false, error: 'Challenge introuvable' }, { status: 404 })
    }

    const candidateCode = await generateUniqueCandidateCode(id, challenge.slug)

    const candidate = await prisma.candidate.create({
      data: {
        challengeId: id,
        candidateCode,
        fullName: data.fullName.trim(),
        email,
        phone: data.phone?.trim() || null,
        birthDate: parseOptionalBirthDate(data.birthDate),
        age: data.age ?? null,
        parentName: data.parentName?.trim() || null,
        parentEmail: data.parentEmail?.trim() || null,
        parentPhone: data.parentPhone?.trim() || null,
        city: data.city?.trim() || null,
        notes: data.notes?.trim() || null,
        status,
        approvedAt: status === CandidateStatus.APPROVED ? now : null,
        rejectedAt: status === CandidateStatus.REJECTED ? now : null,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: access.session.user.id,
        action: 'candidate.create',
        target: 'Candidate',
        payload: { id: candidate.id, challengeId: id, email: candidate.email },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Candidat créé',
      data: candidate,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur POST challenge candidate:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du candidat' },
      { status: 500 }
    )
  }
}
