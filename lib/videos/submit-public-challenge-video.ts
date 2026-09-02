import { CandidateStatus, ChallengeStatus, ChallengeVideoStatus, StructureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { parseVideoUrl } from '@/lib/videos/parse-video-url'
import type { PublicVideoSubmitInput } from '@/lib/videos/challenge-video-schema'

export class PublicVideoSubmitError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'PublicVideoSubmitError'
  }
}

export async function submitPublicChallengeVideo(
  structureSegment: string,
  challengeSlug: string,
  data: PublicVideoSubmitInput
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

  if (!structure) {
    throw new PublicVideoSubmitError('Challenge introuvable', 404)
  }

  const challenge = await prisma.challenge.findFirst({
    where: {
      structureId: structure.id,
      slug,
      status: ChallengeStatus.ACTIVE,
    },
    select: { id: true, name: true },
  })

  if (!challenge) {
    throw new PublicVideoSubmitError('Challenge introuvable ou fermé', 404)
  }

  const candidate = await prisma.candidate.findFirst({
    where: {
      challengeId: challenge.id,
      videoSubmitToken: data.token,
      status: CandidateStatus.APPROVED,
    },
  })

  if (!candidate) {
    throw new PublicVideoSubmitError('Lien invalide ou candidature non validée', 403)
  }

  const parsed = parseVideoUrl(data.videoUrl)
  if (!parsed) {
    throw new PublicVideoSubmitError(
      'URL vidéo non reconnue. Utilisez YouTube, Vimeo ou un lien direct HTTPS.',
      400
    )
  }

  const video = await prisma.challengeVideo.upsert({
    where: { candidateId: candidate.id },
    create: {
      challengeId: challenge.id,
      candidateId: candidate.id,
      title: data.title?.trim() || `Prestation — ${candidate.fullName}`,
      description: data.description?.trim() || null,
      videoUrl: parsed.videoUrl,
      thumbnailUrl: parsed.thumbnailUrl,
      source: parsed.source,
      status: ChallengeVideoStatus.PENDING,
      rejectedAt: null,
      publishedAt: null,
      reviewNotes: null,
    },
    update: {
      title: data.title?.trim() || `Prestation — ${candidate.fullName}`,
      description: data.description?.trim() || null,
      videoUrl: parsed.videoUrl,
      thumbnailUrl: parsed.thumbnailUrl,
      source: parsed.source,
      status: ChallengeVideoStatus.PENDING,
      rejectedAt: null,
      publishedAt: null,
      reviewNotes: null,
    },
  })

  return { video, candidate, challenge, structure }
}

export async function loadPublicVideoSubmitPage(
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

  const candidate = await prisma.candidate.findFirst({
    where: {
      challengeId: challenge.id,
      videoSubmitToken: token,
      status: CandidateStatus.APPROVED,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      video: { select: { id: true, status: true, title: true, videoUrl: true } },
    },
  })

  if (!candidate) return null

  const contactSlug =
    structure.landingPagePath?.trim() ||
    structure.subdomain?.trim() ||
    structure.slug

  return { structure, challenge, candidate, contactSlug, token }
}
