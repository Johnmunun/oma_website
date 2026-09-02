/**
 * POST /api/structures/[slug]/challenges/[challengeSlug]/candidates
 * Inscription publique au challenge (landing partenaire)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { publicCandidateRegistrationSchema } from '@/lib/candidates/candidate-schema'
import {
  PublicCandidateError,
  submitPublicCandidateRegistration,
} from '@/lib/candidates/submit-public-candidate'
import {
  RegistrationValidationError,
  validatePublicRegistration,
  parseChallengeSettings,
} from '@/lib/challenges/challenge-registration-settings'
import { prisma } from '@/lib/prisma'
import { ChallengeStatus, StructureStatus } from '@prisma/client'
import { checkRateLimit, getClientIP, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'

async function loadActiveChallengeSettings(structureSegment: string, challengeSlug: string) {
  const segment = structureSegment.trim().toLowerCase()
  const slug = challengeSlug.trim().toLowerCase()

  const structure = await prisma.structure.findFirst({
    where: {
      OR: [{ slug: segment }, { landingPagePath: segment }, { subdomain: segment }],
      isActive: true,
      status: StructureStatus.ACTIVE,
    },
    select: { id: true },
  })
  if (!structure) return null

  const challenge = await prisma.challenge.findFirst({
    where: {
      structureId: structure.id,
      slug,
      status: ChallengeStatus.ACTIVE,
    },
    select: { settings: true },
  })
  if (!challenge) return null

  return parseChallengeSettings(challenge.settings)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; challengeSlug: string }> }
) {
  try {
    const { slug, challengeSlug } = await params

    const ip = getClientIP(request)
    const rateLimitResult = await checkRateLimit(ip, RATE_LIMIT_CONFIGS.challengeRegistration)
    if (!rateLimitResult.allowed) {
      const resetIn = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000 / 60)
      return NextResponse.json(
        {
          success: false,
          error: `Trop de tentatives. Veuillez réessayer dans ${resetIn} minute(s).`,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    publicCandidateRegistrationSchema.parse(body)

    const registrationSettings = await loadActiveChallengeSettings(slug, challengeSlug)
    if (!registrationSettings) {
      return NextResponse.json(
        { success: false, error: 'Challenge introuvable ou inscriptions fermées' },
        { status: 404 }
      )
    }

    const validated = validatePublicRegistration(body, registrationSettings)

    const { candidate, challenge, structure } = await submitPublicCandidateRegistration(
      slug,
      challengeSlug,
      validated
    )

    return NextResponse.json({
      success: true,
      message: `Inscription enregistrée pour « ${challenge.name} ». Notre équipe ${structure.name} vous contactera après validation.`,
      data: { id: candidate.id, candidateCode: candidate.candidateCode },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    if (error instanceof RegistrationValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, field: error.field },
        { status: 400 }
      )
    }
    if (error instanceof PublicCandidateError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }
    console.error('[API] Erreur POST public candidate:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}
