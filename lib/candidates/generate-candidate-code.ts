import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

function challengeCodePrefix(challengeSlug: string): string {
  const clean = challengeSlug.replace(/[^a-z0-9]/gi, '').toUpperCase()
  if (clean.length >= 3) return clean.slice(0, 3)
  if (clean.length > 0) return clean.padEnd(3, 'X')
  return 'CAN'
}

/** Génère un code unique par challenge, ex. KID-0001 */
export async function generateUniqueCandidateCode(
  challengeId: string,
  challengeSlug: string
): Promise<string> {
  const prefix = challengeCodePrefix(challengeSlug)

  const existing = await prisma.candidate.findMany({
    where: { challengeId, candidateCode: { not: null } },
    select: { candidateCode: true },
  })

  let maxNum = 0
  for (const row of existing) {
    if (!row.candidateCode) continue
    const match = row.candidateCode.match(/-(\d+)$/)
    if (match) {
      maxNum = Math.max(maxNum, Number.parseInt(match[1], 10))
    }
  }

  for (let attempt = 0; attempt < 100; attempt++) {
    const num = maxNum + 1 + attempt
    const code = `${prefix}-${String(num).padStart(4, '0')}`
    const dup = await prisma.candidate.findFirst({
      where: { challengeId, candidateCode: code },
      select: { id: true },
    })
    if (!dup) return code
  }

  return `${prefix}-${randomBytes(3).toString('hex').toUpperCase()}`
}

/** Attribue un code aux candidats existants sans code (migration douce) */
export async function backfillMissingCandidateCodes(challengeId: string, challengeSlug: string) {
  const missing = await prisma.candidate.findMany({
    where: { challengeId, candidateCode: null },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  })

  for (const row of missing) {
    const candidateCode = await generateUniqueCandidateCode(challengeId, challengeSlug)
    await prisma.candidate.update({
      where: { id: row.id },
      data: { candidateCode },
    })
  }
}
