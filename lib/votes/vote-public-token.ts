import { randomBytes } from 'crypto'
import { parseFeatureSettingsFromChallenge } from '@/lib/challenges/challenge-feature-settings'

/** Token court (~12 car.) pour le lien public de vote */
export function generateVotePublicToken(): string {
  return randomBytes(9).toString('base64url').slice(0, 12)
}

export function getVotePublicTokenFromSettings(settings: unknown): string | null {
  const { votes } = parseFeatureSettingsFromChallenge(settings)
  const token = votes.publicToken?.trim()
  return token && token.length >= 8 ? token : null
}

export function ensureVotePublicTokenInSettings(settings: unknown): Record<string, unknown> {
  const base =
    settings && typeof settings === 'object'
      ? { ...(settings as Record<string, unknown>) }
      : {}

  const features = parseFeatureSettingsFromChallenge(base)
  const votes = { ...features.votes }

  if (votes.enabled && !votes.publicToken?.trim()) {
    votes.publicToken = generateVotePublicToken()
  }

  return {
    ...base,
    votes,
  }
}
