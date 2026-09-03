import { ChallengeStatus, ChallengeVideoStatus, StructureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { parseChallengeCoverImageUrl } from '@/lib/challenges/challenge-registration-settings'
import type { ChallengeRankingSettings } from '@/lib/challenges/challenge-feature-settings'
import { parsePhasesSettingsFromChallenge } from '@/lib/challenges/challenge-phase-settings'

export type RankingEntry = {
  rank: number
  candidateId: string
  fullName: string
  age: number | null
  city: string | null
  video: {
    title: string | null
    videoUrl: string | null
    thumbnailUrl: string | null
  } | null
  juryAverage: number | null
  juryEvaluationCount: number
  voteCount: number
  combinedScore: number
}

function computeCombinedScore(
  juryAverage: number | null,
  juryCount: number,
  voteCount: number,
  totalVotes: number,
  settings: ChallengeRankingSettings,
  votesEnabled: boolean
): number {
  const juryScore = juryAverage ?? 0
  const voteScore = totalVotes > 0 ? (voteCount / totalVotes) * 10 : 0

  if (!votesEnabled || totalVotes === 0) {
    return juryCount > 0 ? Math.round(juryScore * 100) / 100 : 0
  }
  if (juryCount === 0) {
    return Math.round(voteScore * 100) / 100
  }

  const juryW = settings.juryWeight
  const voteW = settings.voteWeight
  const totalW = juryW + voteW || 1
  const combined = (juryScore * juryW + voteScore * voteW) / totalW
  return Math.round(combined * 100) / 100
}

export async function buildChallengeRankings(
  challengeId: string,
  options?: {
    rankingSettings?: ChallengeRankingSettings
    votesEnabled?: boolean
    onlyPublishedVideos?: boolean
    /** Filtrer candidats + votes sur une phase */
    phaseId?: string | null
  }
) {
  const phaseId = options?.phaseId?.trim() || null
  const voteWhere = {
    challengeId,
    ...(phaseId ? { phaseId } : {}),
  }

  const juryEvaluations = await prisma.challengeJuryEvaluation.findMany({
    where: { challengeId },
    select: { candidateId: true, score: true },
  })

  const voteCounts = await prisma.challengeVote.groupBy({
    by: ['candidateId'],
    where: voteWhere,
    _count: { candidateId: true },
  })

  const voteMap = new Map(voteCounts.map((v) => [v.candidateId, v._count.candidateId]))
  const totalVotes = voteCounts.reduce((sum, v) => sum + v._count.candidateId, 0)

  const juryByCandidate = new Map<string, number[]>()
  for (const ev of juryEvaluations) {
    const list = juryByCandidate.get(ev.candidateId) ?? []
    list.push(ev.score)
    juryByCandidate.set(ev.candidateId, list)
  }

  const candidates = await prisma.candidate.findMany({
    where: {
      challengeId,
      status: 'APPROVED',
      ...(phaseId ? { phaseId } : {}),
      ...(options?.onlyPublishedVideos
        ? { video: { status: ChallengeVideoStatus.PUBLISHED } }
        : {}),
    },
    select: {
      id: true,
      fullName: true,
      age: true,
      city: true,
      video: {
        select: {
          title: true,
          videoUrl: true,
          thumbnailUrl: true,
          status: true,
        },
      },
    },
    orderBy: { fullName: 'asc' },
  })

  const settings = options?.rankingSettings
  const votesEnabled = options?.votesEnabled ?? false

  const entries: Omit<RankingEntry, 'rank'>[] = candidates.map((candidate) => {
    const scores = juryByCandidate.get(candidate.id) ?? []
    const juryAverage =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
        : null
    const voteCount = voteMap.get(candidate.id) ?? 0

    const combinedScore = computeCombinedScore(
      juryAverage,
      scores.length,
      voteCount,
      totalVotes,
      settings ?? {
        published: false,
        showJuryDetails: true,
        juryWeight: 0.7,
        voteWeight: 0.3,
      },
      votesEnabled
    )

    return {
      candidateId: candidate.id,
      fullName: candidate.fullName,
      age: candidate.age,
      city: candidate.city,
      video: candidate.video
        ? {
            title: candidate.video.title,
            videoUrl: candidate.video.videoUrl,
            thumbnailUrl: candidate.video.thumbnailUrl,
          }
        : null,
      juryAverage,
      juryEvaluationCount: scores.length,
      voteCount,
      combinedScore,
    }
  })

  entries.sort((a, b) => b.combinedScore - a.combinedScore)

  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }))
}

export async function loadPublicChallengeRankings(
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

  const { parseFeatureSettingsFromChallenge } = await import(
    '@/lib/challenges/challenge-feature-settings'
  )
  const features = parseFeatureSettingsFromChallenge(challenge.settings)

  if (!features.ranking.published) return null

  const phases = parsePhasesSettingsFromChallenge(challenge.settings)
  const phaseId = phases.enabled ? phases.activePhaseId : null
  if (phases.enabled && !phaseId) return null

  const rankings = await buildChallengeRankings(challenge.id, {
    rankingSettings: features.ranking,
    votesEnabled: features.votes.enabled,
    onlyPublishedVideos: true,
    phaseId,
  })

  const contactSlug =
    structure.landingPagePath?.trim() ||
    structure.subdomain?.trim() ||
    structure.slug

  const coverImageUrl = parseChallengeCoverImageUrl(challenge.settings)
  const activePhase = phases.enabled
    ? phases.items.find((p) => p.id === phaseId) ?? null
    : null

  return {
    structure,
    challenge,
    features,
    phases: {
      enabled: phases.enabled,
      activePhase,
    },
    rankings,
    contactSlug,
    coverImageUrl,
    totalVotes: rankings.reduce((sum, r) => sum + r.voteCount, 0),
  }
}
