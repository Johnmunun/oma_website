/**
 * @file app/api/admin/challenges/[id]/candidates/[candidateId]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { CandidateStatus } from '@prisma/client'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireCandidateInChallenge } from '@/lib/candidates/candidate-scope'
import {
  candidateStatusActionSchema,
  normalizeCandidateEmail,
  parseOptionalBirthDate,
  updateCandidateSchema,
} from '@/lib/candidates/candidate-schema'
import { notifyCandidateStatusChange } from '@/lib/candidates/candidate-notification-email'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; candidateId: string }> }
) {
  try {
    const { id, candidateId } = await params
    const access = await requireCandidateInChallenge(id, candidateId, 'candidates.view')
    if (!access.ok) return access.response

    return NextResponse.json({ success: true, data: access.candidate })
  } catch (error) {
    console.error('[API] Erreur GET candidate:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du candidat' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; candidateId: string }> }
) {
  try {
    const { id, candidateId } = await params
    const access = await requireCandidateInChallenge(id, candidateId, 'candidates.update')
    if (!access.ok) return access.response

    const data = updateCandidateSchema.parse(await request.json())
    const updateData: Record<string, unknown> = {}

    if (data.fullName !== undefined) updateData.fullName = data.fullName.trim()
    if (data.email !== undefined) updateData.email = normalizeCandidateEmail(data.email)
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null
    if (data.birthDate !== undefined) {
      updateData.birthDate = parseOptionalBirthDate(data.birthDate)
    }
    if (data.age !== undefined) updateData.age = data.age
    if (data.parentName !== undefined) updateData.parentName = data.parentName?.trim() || null
    if (data.parentEmail !== undefined) updateData.parentEmail = data.parentEmail?.trim() || null
    if (data.parentPhone !== undefined) updateData.parentPhone = data.parentPhone?.trim() || null
    if (data.city !== undefined) updateData.city = data.city?.trim() || null
    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null
    if (data.reviewNotes !== undefined) updateData.reviewNotes = data.reviewNotes?.trim() || null
    if (data.status !== undefined) {
      updateData.status = data.status
      const now = new Date()
      if (data.status === CandidateStatus.APPROVED) {
        updateData.approvedAt = now
        updateData.rejectedAt = null
        if (!access.candidate.videoSubmitToken) {
          updateData.videoSubmitToken = randomUUID()
        }
      } else if (data.status === CandidateStatus.REJECTED) {
        updateData.rejectedAt = now
        updateData.approvedAt = null
      } else {
        updateData.approvedAt = null
        updateData.rejectedAt = null
      }
    }

    const previousStatus = access.candidate.status

    if (data.email && data.email !== access.candidate.email) {
      const duplicate = await prisma.candidate.findUnique({
        where: {
          challengeId_email: {
            challengeId: id,
            email: normalizeCandidateEmail(data.email),
          },
        },
      })
      if (duplicate && duplicate.id !== candidateId) {
        return NextResponse.json(
          { success: false, error: 'Cet email est déjà utilisé pour ce challenge' },
          { status: 409 }
        )
      }
    }

    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: updateData,
    })

    if (
      data.status !== undefined &&
      data.status !== previousStatus &&
      (data.status === CandidateStatus.APPROVED || data.status === CandidateStatus.REJECTED)
    ) {
      void notifyCandidateStatusChange(
        candidate.id,
        data.status,
        data.reviewNotes ?? candidate.reviewNotes
      )
    }

    await prisma.auditLog.create({
      data: {
        userId: access.session.user.id,
        action: 'candidate.update',
        target: 'Candidate',
        payload: { id: candidate.id, challengeId: id },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Candidat mis à jour',
      data: candidate,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur PUT candidate:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du candidat' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; candidateId: string }> }
) {
  try {
    const { id, candidateId } = await params
    const body = candidateStatusActionSchema.parse(await request.json())
    const permission =
      body.action === 'approve' ? 'candidates.approve' : 'candidates.reject'

    const access = await requireCandidateInChallenge(id, candidateId, permission)
    if (!access.ok) return access.response

    const now = new Date()
    const videoSubmitToken =
      body.action === 'approve'
        ? access.candidate.videoSubmitToken ?? randomUUID()
        : access.candidate.videoSubmitToken

    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        status: body.action === 'approve' ? CandidateStatus.APPROVED : CandidateStatus.REJECTED,
        reviewNotes: body.reviewNotes?.trim() || access.candidate.reviewNotes,
        approvedAt: body.action === 'approve' ? now : null,
        rejectedAt: body.action === 'reject' ? now : null,
        videoSubmitToken,
      },
    })

    void notifyCandidateStatusChange(
      candidate.id,
      body.action === 'approve' ? CandidateStatus.APPROVED : CandidateStatus.REJECTED,
      body.reviewNotes
    )

    await prisma.auditLog.create({
      data: {
        userId: access.session.user.id,
        action: body.action === 'approve' ? 'candidate.approve' : 'candidate.reject',
        target: 'Candidate',
        payload: { id: candidate.id, challengeId: id, status: candidate.status },
      },
    })

    return NextResponse.json({
      success: true,
      message: body.action === 'approve' ? 'Candidat approuvé' : 'Candidat rejeté',
      data: candidate,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur PATCH candidate:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du changement de statut' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; candidateId: string }> }
) {
  try {
    const { id, candidateId } = await params
    const access = await requireCandidateInChallenge(id, candidateId, 'candidates.delete')
    if (!access.ok) return access.response

    await prisma.candidate.delete({ where: { id: candidateId } })

    await prisma.auditLog.create({
      data: {
        userId: access.session.user.id,
        action: 'candidate.delete',
        target: 'Candidate',
        payload: { id: candidateId, challengeId: id },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Candidat supprimé',
    })
  } catch (error) {
    console.error('[API] Erreur DELETE candidate:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du candidat' },
      { status: 500 }
    )
  }
}
