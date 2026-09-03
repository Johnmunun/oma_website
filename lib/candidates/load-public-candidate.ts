/**
 * Fiche publique d'un candidat (par candidateCode)
 */

import { CandidateStatus, ChallengeStatus, ChallengeVideoStatus, StructureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { parseChallengeCoverImageUrl } from '@/lib/challenges/challenge-registration-settings'
import { parseFeatureSettingsFromChallenge } from '@/lib/challenges/challenge-feature-settings'
import { getVotePublicTokenFromSettings } from '@/lib/votes/vote-public-token'

const STRUCTURE_WHERE = (segment: string) => ({
  OR: [{ slug: segment }, { landingPagePath: segment }, { subdomain: segment }],
  isActive: true,
  status: StructureStatus.ACTIVE,
})

export async function loadPublicCandidatePage(
  structureSegment: string,
  challengeSlug: string,
  candidateCode: string
) {
  const segment = structureSegment.trim().toLowerCase()
  const slug = challengeSlug.trim().toLowerCase()
  const code = decodeURIComponent(candidateCode).trim().toUpperCase()
  if (!segment || !slug || !code) return null

  const structure = await prisma.structure.findFirst({
    where: STRUCTURE_WHERE(segment),
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      landingPagePath: true,
      subdomain: true,
      landingThemeColor: true,
    },
  })

  if (!structure) return null

  const challenge = await prisma.challenge.findFirst({
    where: {
      structureId: structure.id,
      slug,
      status: ChallengeStatus.ACTIVE,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      settings: true,
    },
  })

  if (!challenge) return null

  const candidate = await prisma.candidate.findFirst({
    where: {
      challengeId: challenge.id,
      candidateCode: { equals: code, mode: 'insensitive' },
      status: CandidateStatus.APPROVED,
      video: { status: ChallengeVideoStatus.PUBLISHED },
    },
    select: {
      id: true,
      fullName: true,
      age: true,
      city: true,
      candidateCode: true,
      createdAt: true,
      video: {
        select: {
          title: true,
          thumbnailUrl: true,
          videoUrl: true,
        },
      },
      _count: { select: { votes: true } },
    },
  })

  if (!candidate?.candidateCode) return null

  const earlierCount = await prisma.candidate.count({
    where: {
      challengeId: challenge.id,
      status: CandidateStatus.APPROVED,
      video: { status: ChallengeVideoStatus.PUBLISHED },
      createdAt: { lt: candidate.createdAt },
    },
  })

  const features = parseFeatureSettingsFromChallenge(challenge.settings)
  const coverImageUrl = parseChallengeCoverImageUrl(challenge.settings)
  const voteToken = getVotePublicTokenFromSettings(challenge.settings)
  const contactSlug =
    structure.landingPagePath?.trim() ||
    structure.subdomain?.trim() ||
    structure.slug

  return {
    structure,
    challenge: {
      id: challenge.id,
      name: challenge.name,
      slug: challenge.slug,
      description: challenge.description,
    },
    features,
    coverImageUrl,
    contactSlug,
    voteToken,
    candidate: {
      id: candidate.id,
      number: earlierCount + 1,
      fullName: candidate.fullName,
      age: candidate.age,
      city: candidate.city,
      candidateCode: candidate.candidateCode,
      video: candidate.video,
      voteCount: candidate._count.votes,
    },
  }
}

export type PublicCandidatePageData = NonNullable<
  Awaited<ReturnType<typeof loadPublicCandidatePage>>
>
