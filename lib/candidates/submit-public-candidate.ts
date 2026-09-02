import { CandidateStatus, ChallengeStatus, StructureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { normalizeCandidateEmail } from '@/lib/candidates/candidate-schema'
import type { ValidatedPublicRegistration } from '@/lib/challenges/challenge-registration-settings'
import { notifyCandidateRegistrationReceived } from '@/lib/candidates/candidate-notification-email'
import { generateUniqueCandidateCode } from '@/lib/candidates/generate-candidate-code'

export async function resolvePublicChallenge(
  structureSegment: string,
  challengeSlug: string
) {
  const segment = structureSegment.trim().toLowerCase()
  const slug = challengeSlug.trim().toLowerCase()

  const structure = await prisma.structure.findFirst({
    where: {
      OR: [{ slug: segment }, { landingPagePath: segment }, { subdomain: segment }],
      isActive: true,
      status: StructureStatus.ACTIVE,
    },
    select: { id: true, name: true },
  })

  if (!structure) return null

  const challenge = await prisma.challenge.findFirst({
    where: {
      structureId: structure.id,
      slug,
      status: ChallengeStatus.ACTIVE,
    },
    select: { id: true, name: true, slug: true, settings: true },
  })

  if (!challenge) return null

  return { structure, challenge }
}

export async function submitPublicCandidateRegistration(
  structureSegment: string,
  challengeSlug: string,
  data: ValidatedPublicRegistration
) {
  const resolved = await resolvePublicChallenge(structureSegment, challengeSlug)
  if (!resolved) {
    throw new PublicCandidateError('Challenge introuvable ou inscriptions fermées', 404)
  }

  const email = normalizeCandidateEmail(data.email)
  const existing = await prisma.candidate.findUnique({
    where: {
      challengeId_email: {
        challengeId: resolved.challenge.id,
        email,
      },
    },
  })

  if (existing) {
    throw new PublicCandidateError('Cet email est déjà inscrit à ce challenge', 409)
  }

  const candidateCode = await generateUniqueCandidateCode(
    resolved.challenge.id,
    resolved.challenge.slug
  )

  const candidate = await prisma.candidate.create({
    data: {
      challengeId: resolved.challenge.id,
      candidateCode,
      fullName: data.fullName.trim(),
      email,
      phone: data.phone?.trim() || null,
      age: data.age ?? null,
      parentName: data.parentName?.trim() || null,
      parentEmail: data.parentEmail?.trim() || null,
      parentPhone: data.parentPhone?.trim() || null,
      city: data.city?.trim() || null,
      notes: data.notes?.trim() || null,
      status: CandidateStatus.PENDING,
    },
  })

  void notifyCandidateRegistrationReceived(candidate.id)

  return { candidate, structure: resolved.structure, challenge: resolved.challenge }
}

export class PublicCandidateError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'PublicCandidateError'
  }
}
