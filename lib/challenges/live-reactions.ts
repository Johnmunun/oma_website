/**
 * Réactions emoji live (style TikTok)
 */

import { createHash } from 'crypto'
import { ChallengeStatus, StructureStatus } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { parseLiveSettingsFromChallenge } from '@/lib/challenges/challenge-live-settings'

export const LIVE_REACTION_EMOJIS = [
  '❤️',
  '🔥',
  '👏',
  '😂',
  '😮',
  '🎉',
  '💯',
  '👍',
  '🙌',
  '💖',
] as const

export type LiveReactionEmoji = (typeof LIVE_REACTION_EMOJIS)[number]

export const liveReactionPostSchema = z.object({
  emoji: z.enum(LIVE_REACTION_EMOJIS),
})

export class LiveReactionError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'LiveReactionError'
  }
}

export function hashReactionClientIp(ip: string): string {
  return createHash('sha256').update(`oma-live-reaction:${ip}`).digest('hex').slice(0, 40)
}

const STRUCTURE_WHERE = (segment: string) => ({
  OR: [{ slug: segment }, { landingPagePath: segment }, { subdomain: segment }],
  isActive: true,
  status: StructureStatus.ACTIVE,
})

async function resolveLiveChallengeForReactions(
  structureSegment: string,
  challengeSlug: string
) {
  const segment = structureSegment.trim().toLowerCase()
  const slug = challengeSlug.trim().toLowerCase()

  const structure = await prisma.structure.findFirst({
    where: STRUCTURE_WHERE(segment),
    select: { id: true },
  })
  if (!structure) throw new LiveReactionError('Challenge introuvable', 404)

  const challenge = await prisma.challenge.findFirst({
    where: {
      structureId: structure.id,
      slug,
      status: ChallengeStatus.ACTIVE,
    },
    select: { id: true, settings: true },
  })
  if (!challenge) throw new LiveReactionError('Challenge introuvable', 404)

  const live = parseLiveSettingsFromChallenge(challenge.settings)
  if (!live.enabled) throw new LiveReactionError('Live indisponible', 404)
  if (!live.reactionsEnabled) throw new LiveReactionError('Réactions désactivées', 403)
  if (!live.isLive) throw new LiveReactionError('Réactions disponibles pendant le direct', 403)

  return { challenge, live }
}

export async function listPublicLiveReactions(
  structureSegment: string,
  challengeSlug: string,
  afterIso?: string | null
) {
  const { challenge } = await resolveLiveChallengeForReactions(structureSegment, challengeSlug)

  let after: Date | null = null
  if (afterIso) {
    const d = new Date(afterIso)
    if (!Number.isNaN(d.getTime())) after = d
  } else {
    after = new Date(Date.now() - 15_000)
  }

  const reactions = await prisma.challengeLiveReaction.findMany({
    where: {
      challengeId: challenge.id,
      createdAt: { gt: after },
    },
    orderBy: { createdAt: 'asc' },
    take: 80,
    select: {
      id: true,
      emoji: true,
      createdAt: true,
    },
  })

  return reactions.map((r) => ({
    id: r.id,
    emoji: r.emoji,
    createdAt: r.createdAt.toISOString(),
  }))
}

export async function postPublicLiveReaction(
  structureSegment: string,
  challengeSlug: string,
  emoji: LiveReactionEmoji,
  opts?: { ipHash?: string | null }
) {
  const { challenge } = await resolveLiveChallengeForReactions(structureSegment, challengeSlug)
  const data = liveReactionPostSchema.parse({ emoji })

  const reaction = await prisma.challengeLiveReaction.create({
    data: {
      challengeId: challenge.id,
      emoji: data.emoji,
      ipHash: opts?.ipHash?.trim() || null,
    },
    select: {
      id: true,
      emoji: true,
      createdAt: true,
    },
  })

  // Nettoyage léger (fire-and-forget)
  void prisma.challengeLiveReaction
    .deleteMany({
      where: {
        challengeId: challenge.id,
        createdAt: { lt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      },
    })
    .catch((err) => console.error('[LiveReaction] cleanup:', err))

  return {
    id: reaction.id,
    emoji: reaction.emoji,
    createdAt: reaction.createdAt.toISOString(),
  }
}
