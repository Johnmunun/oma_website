/**
 * Chat live public d'un challenge
 */

import { ChallengeStatus, StructureStatus } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { parseLiveSettingsFromChallenge } from '@/lib/challenges/challenge-live-settings'

export class LiveChatError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'LiveChatError'
  }
}

export const liveChatPostSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(2, 'Pseudo trop court')
    .max(32, 'Pseudo trop long'),
  body: z
    .string()
    .trim()
    .min(1, 'Message vide')
    .max(280, 'Message trop long (280 caractères)'),
})

const STRUCTURE_WHERE = (segment: string) => ({
  OR: [{ slug: segment }, { landingPagePath: segment }, { subdomain: segment }],
  isActive: true,
  status: StructureStatus.ACTIVE,
})

async function resolveLiveChallenge(structureSegment: string, challengeSlug: string) {
  const segment = structureSegment.trim().toLowerCase()
  const slug = challengeSlug.trim().toLowerCase()

  const structure = await prisma.structure.findFirst({
    where: STRUCTURE_WHERE(segment),
    select: { id: true },
  })
  if (!structure) throw new LiveChatError('Challenge introuvable', 404)

  const challenge = await prisma.challenge.findFirst({
    where: {
      structureId: structure.id,
      slug,
      status: ChallengeStatus.ACTIVE,
    },
    select: { id: true, settings: true },
  })
  if (!challenge) throw new LiveChatError('Challenge introuvable', 404)

  const live = parseLiveSettingsFromChallenge(challenge.settings)
  if (!live.enabled) throw new LiveChatError('Live indisponible', 404)
  if (!live.chatEnabled) throw new LiveChatError('Le chat est désactivé', 403)

  return { challenge, live }
}

export async function listPublicLiveChatMessages(
  structureSegment: string,
  challengeSlug: string,
  afterIso?: string | null
) {
  const { challenge } = await resolveLiveChallenge(structureSegment, challengeSlug)

  let after: Date | null = null
  if (afterIso) {
    const d = new Date(afterIso)
    if (!Number.isNaN(d.getTime())) after = d
  }

  const messages = await prisma.challengeLiveChatMessage.findMany({
    where: {
      challengeId: challenge.id,
      isHidden: false,
      ...(after ? { createdAt: { gt: after } } : {}),
    },
    orderBy: { createdAt: after ? 'asc' : 'desc' },
    take: after ? 50 : 80,
    select: {
      id: true,
      authorName: true,
      body: true,
      createdAt: true,
    },
  })

  const ordered = after ? messages : [...messages].reverse()

  return ordered.map((m) => ({
    id: m.id,
    authorName: m.authorName,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  }))
}

export async function postPublicLiveChatMessage(
  structureSegment: string,
  challengeSlug: string,
  input: z.infer<typeof liveChatPostSchema>
) {
  const { challenge } = await resolveLiveChallenge(structureSegment, challengeSlug)
  const data = liveChatPostSchema.parse(input)

  // Anti-spam basique : max 1 message / 3s pour le même pseudo
  const recent = await prisma.challengeLiveChatMessage.findFirst({
    where: {
      challengeId: challenge.id,
      authorName: data.authorName,
      createdAt: { gt: new Date(Date.now() - 3000) },
    },
    select: { id: true },
  })
  if (recent) {
    throw new LiveChatError('Patientez quelques secondes avant un nouveau message', 429)
  }

  const message = await prisma.challengeLiveChatMessage.create({
    data: {
      challengeId: challenge.id,
      authorName: data.authorName,
      body: data.body,
    },
    select: {
      id: true,
      authorName: true,
      body: true,
      createdAt: true,
    },
  })

  return {
    id: message.id,
    authorName: message.authorName,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
  }
}
