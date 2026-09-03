/**
 * Hub public d'un challenge (règles, CTA inscription / vote / classement)
 */

import { CandidateStatus, ChallengeStatus, ChallengeVideoStatus, StructureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { parseChallengeCoverImageUrl } from '@/lib/challenges/challenge-registration-settings'
import { parseFeatureSettingsFromChallenge } from '@/lib/challenges/challenge-feature-settings'
import {
  isLiveVisibleOnHub,
  parseLiveSettingsFromChallenge,
} from '@/lib/challenges/challenge-live-settings'
import { getVotePublicTokenFromSettings } from '@/lib/votes/vote-public-token'

const STRUCTURE_WHERE = (segment: string) => ({
  OR: [{ slug: segment }, { landingPagePath: segment }, { subdomain: segment }],
  isActive: true,
  status: StructureStatus.ACTIVE,
})

export async function loadPublicChallengeHub(
  structureSegment: string,
  challengeSlug: string
) {
  const segment = structureSegment.trim().toLowerCase()
  const slug = challengeSlug.trim().toLowerCase()
  if (!segment || !slug) return null

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
      startsAt: true,
      endsAt: true,
      settings: true,
    },
  })

  if (!challenge) return null

  const features = parseFeatureSettingsFromChallenge(challenge.settings)
  const live = parseLiveSettingsFromChallenge(challenge.settings)
  const coverImageUrl = parseChallengeCoverImageUrl(challenge.settings)
  const voteToken = getVotePublicTokenFromSettings(challenge.settings)
  const contactSlug =
    structure.landingPagePath?.trim() ||
    structure.subdomain?.trim() ||
    structure.slug

  const [approvedCount, publishedVideos, totalVotes] = await Promise.all([
    prisma.candidate.count({
      where: { challengeId: challenge.id, status: CandidateStatus.APPROVED },
    }),
    prisma.challengeVideo.count({
      where: { challengeId: challenge.id, status: ChallengeVideoStatus.PUBLISHED },
    }),
    prisma.challengeVote.count({ where: { challengeId: challenge.id } }),
  ])

  const spotlight = await prisma.candidate.findMany({
    where: {
      challengeId: challenge.id,
      status: CandidateStatus.APPROVED,
      video: { status: ChallengeVideoStatus.PUBLISHED },
      candidateCode: { not: null },
    },
    orderBy: { createdAt: 'asc' },
    take: 6,
    select: {
      id: true,
      fullName: true,
      age: true,
      city: true,
      candidateCode: true,
      video: {
        select: { thumbnailUrl: true, videoUrl: true, title: true },
      },
      _count: { select: { votes: true } },
    },
  })

  return {
    structure,
    challenge: {
      id: challenge.id,
      name: challenge.name,
      slug: challenge.slug,
      description: challenge.description,
      startsAt: challenge.startsAt?.toISOString() ?? null,
      endsAt: challenge.endsAt?.toISOString() ?? null,
    },
    features,
    live: {
      ...live,
      visibleOnHub: isLiveVisibleOnHub(live),
    },
    coverImageUrl,
    contactSlug,
    voteToken,
    stats: {
      approvedCount,
      publishedVideos,
      totalVotes,
    },
    spotlight: spotlight.map((c, index) => ({
      id: c.id,
      number: index + 1,
      fullName: c.fullName,
      age: c.age,
      city: c.city,
      candidateCode: c.candidateCode!,
      video: c.video,
      voteCount: c._count.votes,
    })),
  }
}

export type PublicChallengeHubData = NonNullable<
  Awaited<ReturnType<typeof loadPublicChallengeHub>>
>
