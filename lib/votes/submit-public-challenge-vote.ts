import { CandidateStatus, ChallengeStatus, ChallengeVideoStatus, StructureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { parseChallengeCoverImageUrl } from '@/lib/challenges/challenge-registration-settings'
import { normalizeCandidateEmail } from '@/lib/candidates/candidate-schema'
import { parseFeatureSettingsFromChallenge } from '@/lib/challenges/challenge-feature-settings'
import {
  getActivePhase,
  getVotePhaseKey,
  parsePhasesSettingsFromChallenge,
} from '@/lib/challenges/challenge-phase-settings'
import { getVotePublicTokenFromSettings } from '@/lib/votes/vote-public-token'

export class PublicVoteError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'PublicVoteError'
  }
}

const STRUCTURE_WHERE = (segment: string) => ({
  OR: [{ slug: segment }, { landingPagePath: segment }, { subdomain: segment }],
  isActive: true,
  status: StructureStatus.ACTIVE,
})

const STRUCTURE_SELECT = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  landingPagePath: true,
  subdomain: true,
  landingThemeColor: true,
} as const

type VoteChallengeRow = {
  id: string
  name: string
  slug: string
  description: string | null
  settings: unknown
}

async function findChallengeByVoteToken(
  structureId: string,
  voteToken: string
): Promise<VoteChallengeRow | null> {
  const token = voteToken.trim()
  if (!token) return null

  const challenges = await prisma.challenge.findMany({
    where: {
      structureId,
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

  return (
    challenges.find((c) => getVotePublicTokenFromSettings(c.settings) === token) ?? null
  )
}

function assertVotesOpen(settings: unknown) {
  const features = parseFeatureSettingsFromChallenge(settings)
  if (!features.votes.enabled || !features.votes.published) {
    throw new PublicVoteError('Le vote public n\'est pas ouvert', 403)
  }
  return features
}

async function loadEligibleCandidates(
  challengeId: string,
  phaseId: string | null
) {
  const rows = await prisma.candidate.findMany({
    where: {
      challengeId,
      status: CandidateStatus.APPROVED,
      video: { status: ChallengeVideoStatus.PUBLISHED },
      ...(phaseId ? { phaseId } : {}),
    },
    orderBy: [{ createdAt: 'asc' }, { fullName: 'asc' }],
    select: {
      id: true,
      fullName: true,
      age: true,
      city: true,
      candidateCode: true,
      phaseId: true,
      video: {
        select: {
          title: true,
          thumbnailUrl: true,
          videoUrl: true,
        },
      },
      votes: phaseId
        ? { where: { phaseId }, select: { id: true } }
        : { select: { id: true } },
    },
  })

  return rows.map((c, index) => ({
    id: c.id,
    number: index + 1,
    fullName: c.fullName,
    age: c.age,
    city: c.city,
    candidateCode: c.candidateCode,
    phaseId: c.phaseId,
    video: c.video,
    voteCount: c.votes.length,
  }))
}

async function recordVote(
  challengeId: string,
  candidateId: string,
  email: string,
  phaseKey: string,
  requiredPhaseId: string | null
) {
  const voterKey = normalizeCandidateEmail(email)

  const candidate = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      challengeId,
      status: CandidateStatus.APPROVED,
      video: { status: ChallengeVideoStatus.PUBLISHED },
      ...(requiredPhaseId ? { phaseId: requiredPhaseId } : {}),
    },
  })

  if (!candidate) {
    throw new PublicVoteError('Candidat non éligible au vote', 404)
  }

  const existing = await prisma.challengeVote.findUnique({
    where: {
      challengeId_voterKey_phaseId: {
        challengeId,
        voterKey,
        phaseId: phaseKey,
      },
    },
  })

  if (existing) {
    throw new PublicVoteError(
      phaseKey
        ? 'Vous avez déjà voté pour cette phase (1 vote par email et par tour)'
        : 'Vous avez déjà voté pour ce concours (1 vote par email)',
      409
    )
  }

  const vote = await prisma.challengeVote.create({
    data: {
      challengeId,
      candidateId,
      voterKey,
      voterEmail: voterKey,
      phaseId: phaseKey,
    },
  })

  return { vote, candidate }
}

function buildVotePagePayload(
  structure: {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    landingPagePath: string | null
    subdomain: string | null
    landingThemeColor: string | null
  },
  challenge: VoteChallengeRow,
  candidates: Awaited<ReturnType<typeof loadEligibleCandidates>>
) {
  const features = parseFeatureSettingsFromChallenge(challenge.settings)
  const phases = parsePhasesSettingsFromChallenge(challenge.settings)
  const activePhase = getActivePhase(phases)
  const contactSlug =
    structure.landingPagePath?.trim() ||
    structure.subdomain?.trim() ||
    structure.slug
  const coverImageUrl = parseChallengeCoverImageUrl(challenge.settings)
  const voteToken = getVotePublicTokenFromSettings(challenge.settings)
  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0)

  return {
    structure,
    challenge: {
      id: challenge.id,
      name: challenge.name,
      slug: challenge.slug,
      description: challenge.description,
    },
    features,
    phases: {
      enabled: phases.enabled,
      activePhase,
    },
    candidates,
    contactSlug,
    coverImageUrl,
    voteToken,
    totalVotes,
  }
}

/** Vote via lien court /s/{structure}/v/{token} */
export async function submitPublicChallengeVoteByToken(
  structureSegment: string,
  voteToken: string,
  candidateId: string,
  email: string
) {
  const segment = structureSegment.trim().toLowerCase()

  const structure = await prisma.structure.findFirst({
    where: STRUCTURE_WHERE(segment),
    select: { id: true, name: true },
  })

  if (!structure) {
    throw new PublicVoteError('Lien de vote invalide', 404)
  }

  const challenge = await findChallengeByVoteToken(structure.id, voteToken)
  if (!challenge) {
    throw new PublicVoteError('Lien de vote invalide ou expiré', 404)
  }

  assertVotesOpen(challenge.settings)
  const phases = parsePhasesSettingsFromChallenge(challenge.settings)
  const phaseKey = getVotePhaseKey(phases)
  const requiredPhaseId = phases.enabled ? phases.activePhaseId : null
  if (phases.enabled && !requiredPhaseId) {
    throw new PublicVoteError('Aucune phase active pour le vote', 403)
  }

  const { vote, candidate } = await recordVote(
    challenge.id,
    candidateId,
    email,
    phaseKey,
    requiredPhaseId
  )

  return { vote, challenge, structure, candidate }
}

export async function submitPublicChallengeVote(
  structureSegment: string,
  challengeSlug: string,
  candidateId: string,
  email: string
) {
  const segment = structureSegment.trim().toLowerCase()
  const slug = challengeSlug.trim().toLowerCase()

  const structure = await prisma.structure.findFirst({
    where: STRUCTURE_WHERE(segment),
    select: { id: true, name: true },
  })

  if (!structure) {
    throw new PublicVoteError('Challenge introuvable', 404)
  }

  const challenge = await prisma.challenge.findFirst({
    where: {
      structureId: structure.id,
      slug,
      status: ChallengeStatus.ACTIVE,
    },
    select: { id: true, name: true, slug: true, description: true, settings: true },
  })

  if (!challenge) {
    throw new PublicVoteError('Challenge introuvable ou fermé', 404)
  }

  assertVotesOpen(challenge.settings)
  const phases = parsePhasesSettingsFromChallenge(challenge.settings)
  const phaseKey = getVotePhaseKey(phases)
  const requiredPhaseId = phases.enabled ? phases.activePhaseId : null
  if (phases.enabled && !requiredPhaseId) {
    throw new PublicVoteError('Aucune phase active pour le vote', 403)
  }

  const { vote, candidate } = await recordVote(
    challenge.id,
    candidateId,
    email,
    phaseKey,
    requiredPhaseId
  )

  return { vote, challenge, structure, candidate }
}

export async function loadPublicVotePageByToken(
  structureSegment: string,
  voteToken: string
) {
  const segment = structureSegment.trim().toLowerCase()

  const structure = await prisma.structure.findFirst({
    where: STRUCTURE_WHERE(segment),
    select: STRUCTURE_SELECT,
  })

  if (!structure) return null

  const challenge = await findChallengeByVoteToken(structure.id, voteToken)
  if (!challenge) return null

  try {
    assertVotesOpen(challenge.settings)
  } catch {
    return null
  }

  const phases = parsePhasesSettingsFromChallenge(challenge.settings)
  const requiredPhaseId = phases.enabled ? phases.activePhaseId : null
  if (phases.enabled && !requiredPhaseId) return null

  const candidates = await loadEligibleCandidates(challenge.id, requiredPhaseId)
  return buildVotePagePayload(structure, challenge, candidates)
}

export async function loadPublicVotePage(
  structureSegment: string,
  challengeSlug: string
) {
  const segment = structureSegment.trim().toLowerCase()
  const slug = challengeSlug.trim().toLowerCase()

  const structure = await prisma.structure.findFirst({
    where: STRUCTURE_WHERE(segment),
    select: STRUCTURE_SELECT,
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

  try {
    assertVotesOpen(challenge.settings)
  } catch {
    return null
  }

  const phases = parsePhasesSettingsFromChallenge(challenge.settings)
  const requiredPhaseId = phases.enabled ? phases.activePhaseId : null
  if (phases.enabled && !requiredPhaseId) return null

  const candidates = await loadEligibleCandidates(challenge.id, requiredPhaseId)
  return buildVotePagePayload(structure, challenge, candidates)
}
