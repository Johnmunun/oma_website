import { ChallengeStatus, ChallengeVideoStatus, StructureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function loadPublicJuryPortal(
  structureSegment: string,
  challengeSlug: string,
  token: string
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
    select: { id: true, name: true, slug: true, description: true },
  })

  if (!challenge) return null

  const member = await prisma.challengeJuryMember.findFirst({
    where: {
      challengeId: challenge.id,
      accessToken: token,
      isActive: true,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      title: true,
    },
  })

  if (!member) return null

  const candidates = await prisma.candidate.findMany({
    where: {
      challengeId: challenge.id,
      video: { status: ChallengeVideoStatus.PUBLISHED },
    },
    orderBy: { fullName: 'asc' },
    select: {
      id: true,
      fullName: true,
      age: true,
      city: true,
      video: {
        select: {
          id: true,
          title: true,
          videoUrl: true,
          thumbnailUrl: true,
          source: true,
          fileId: true,
        },
      },
    },
  })

  const evaluations = await prisma.challengeJuryEvaluation.findMany({
    where: { juryMemberId: member.id },
    select: {
      id: true,
      candidateId: true,
      score: true,
      comment: true,
      updatedAt: true,
    },
  })

  const contactSlug =
    structure.landingPagePath?.trim() ||
    structure.subdomain?.trim() ||
    structure.slug

  return {
    structure,
    challenge,
    member,
    candidates,
    evaluations,
    contactSlug,
    token,
  }
}

export class PublicJuryEvaluationError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'PublicJuryEvaluationError'
  }
}

export async function submitPublicJuryEvaluation(
  structureSegment: string,
  challengeSlug: string,
  token: string,
  candidateId: string,
  score: number,
  comment?: string | null
) {
  const portal = await loadPublicJuryPortal(structureSegment, challengeSlug, token)
  if (!portal) {
    throw new PublicJuryEvaluationError('Accès jury invalide', 403)
  }

  const candidate = portal.candidates.find((c) => c.id === candidateId)
  if (!candidate) {
    throw new PublicJuryEvaluationError('Candidat non éligible à l\'évaluation', 404)
  }

  const evaluation = await prisma.challengeJuryEvaluation.upsert({
    where: {
      juryMemberId_candidateId: {
        juryMemberId: portal.member.id,
        candidateId,
      },
    },
    create: {
      challengeId: portal.challenge.id,
      juryMemberId: portal.member.id,
      candidateId,
      score,
      comment: comment?.trim() || null,
    },
    update: {
      score,
      comment: comment?.trim() || null,
    },
  })

  return { evaluation, portal }
}

export async function getChallengeJuryRankings(challengeId: string) {
  const evaluations = await prisma.challengeJuryEvaluation.findMany({
    where: { challengeId },
    include: {
      candidate: {
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
              source: true,
              fileId: true,
            },
          },
        },
      },
      juryMember: {
        select: { id: true, fullName: true, title: true },
      },
    },
  })

  const byCandidate = new Map<
    string,
    {
      candidate: (typeof evaluations)[0]['candidate']
      scores: number[]
      evaluations: typeof evaluations
    }
  >()

  for (const ev of evaluations) {
    const existing = byCandidate.get(ev.candidateId)
    if (existing) {
      existing.scores.push(ev.score)
      existing.evaluations.push(ev)
    } else {
      byCandidate.set(ev.candidateId, {
        candidate: ev.candidate,
        scores: [ev.score],
        evaluations: [ev],
      })
    }
  }

  const rankings = Array.from(byCandidate.entries())
    .map(([candidateId, data]) => {
      const average =
        data.scores.reduce((sum, s) => sum + s, 0) / Math.max(data.scores.length, 1)
      return {
        candidateId,
        candidate: data.candidate,
        averageScore: Math.round(average * 100) / 100,
        evaluationCount: data.scores.length,
        evaluations: data.evaluations,
      }
    })
    .sort((a, b) => b.averageScore - a.averageScore)

  return rankings
}
