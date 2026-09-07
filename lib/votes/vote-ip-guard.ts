/**
 * Anti-fraude vote : hash IP + limite votes réussis par IP / challenge / phase
 */

import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, isRateLimitBypassed, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'

export function hashVoteIp(ip: string): string {
  return createHash('sha256').update(`oma-vote-ip:${ip}`).digest('hex').slice(0, 40)
}

function voteOkKey(challengeId: string, phaseKey: string, ip: string): string {
  return `${challengeId}:${phaseKey || '_'}:${ip}`
}

/** true si cette IP a déjà atteint le plafond de votes réussis */
export async function isVoteIpLimitReached(
  challengeId: string,
  phaseKey: string,
  ip: string
): Promise<boolean> {
  if (isRateLimitBypassed()) return false
  if (!ip || ip === 'unknown') return false

  const fullKey = `${RATE_LIMIT_CONFIGS.challengeVoteOk.keyPrefix}:${voteOkKey(challengeId, phaseKey, ip)}`
  const row = await prisma.rateLimit.findUnique({ where: { key: fullKey } })
  if (!row) return false
  if (row.resetAt.getTime() < Date.now()) return false
  return row.count >= RATE_LIMIT_CONFIGS.challengeVoteOk.maxRequests
}

/** Incrémente le compteur après un vote réussi */
export async function recordSuccessfulVoteIp(
  challengeId: string,
  phaseKey: string,
  ip: string
): Promise<void> {
  if (!ip || ip === 'unknown') return
  await checkRateLimit(voteOkKey(challengeId, phaseKey, ip), RATE_LIMIT_CONFIGS.challengeVoteOk)
}
