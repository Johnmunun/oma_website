import { z } from 'zod'
import { ensureVotePublicTokenInSettings } from '@/lib/votes/vote-public-token'

export const challengeRankingSettingsSchema = z.object({
  published: z.boolean().default(false),
  showJuryDetails: z.boolean().default(true),
  juryWeight: z.number().min(0).max(1).default(0.7),
  voteWeight: z.number().min(0).max(1).default(0.3),
})

export const challengeVotesSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  published: z.boolean().default(false),
  /** Lien court sécurisé — généré automatiquement à l'activation des votes */
  publicToken: z.string().min(8).max(24).nullable().optional(),
})

export type ChallengeRankingSettings = z.infer<typeof challengeRankingSettingsSchema>
export type ChallengeVotesSettings = z.infer<typeof challengeVotesSettingsSchema>

export const DEFAULT_RANKING_SETTINGS = challengeRankingSettingsSchema.parse({})
export const DEFAULT_VOTES_SETTINGS = challengeVotesSettingsSchema.parse({})

export function parseRankingSettings(raw: unknown): ChallengeRankingSettings {
  if (!raw || typeof raw !== 'object') return DEFAULT_RANKING_SETTINGS
  return challengeRankingSettingsSchema.parse(raw)
}

export function parseVotesSettings(raw: unknown): ChallengeVotesSettings {
  if (!raw || typeof raw !== 'object') return DEFAULT_VOTES_SETTINGS
  return challengeVotesSettingsSchema.parse(raw)
}

export function parseFeatureSettingsFromChallenge(raw: unknown): {
  ranking: ChallengeRankingSettings
  votes: ChallengeVotesSettings
} {
  if (!raw || typeof raw !== 'object') {
    return { ranking: DEFAULT_RANKING_SETTINGS, votes: DEFAULT_VOTES_SETTINGS }
  }
  const obj = raw as Record<string, unknown>
  return {
    ranking: parseRankingSettings(obj.ranking),
    votes: parseVotesSettings(obj.votes),
  }
}

export function mergeChallengeFeatureSettings(
  existingSettings: unknown,
  patch: {
    ranking?: Partial<ChallengeRankingSettings>
    votes?: Partial<ChallengeVotesSettings>
  }
): Record<string, unknown> {
  const base =
    existingSettings && typeof existingSettings === 'object'
      ? { ...(existingSettings as Record<string, unknown>) }
      : {}

  const current = parseFeatureSettingsFromChallenge(base)

  const merged = {
    ...base,
    ranking: challengeRankingSettingsSchema.parse({
      ...current.ranking,
      ...patch.ranking,
    }),
    votes: challengeVotesSettingsSchema.parse({
      ...current.votes,
      ...patch.votes,
    }),
  }

  return ensureVotePublicTokenInSettings(merged)
}

export const updateRankingSettingsSchema = challengeRankingSettingsSchema.partial()
export const updateVotesSettingsSchema = challengeVotesSettingsSchema.partial()
