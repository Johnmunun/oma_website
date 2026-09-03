import { z } from 'zod'
import { ChallengeStatus } from '@prisma/client'
import { challengeRegistrationSettingsSchema } from '@/lib/challenges/challenge-registration-settings'

export const challengeStatusSchema = z.nativeEnum(ChallengeStatus)

/** '' / null → DRAFT (évite l'erreur Zod sur Select vide) */
const challengeStatusFieldSchema = z.preprocess((val) => {
  if (val === '' || val == null) return ChallengeStatus.DRAFT
  return val
}, challengeStatusSchema)

/** Préserve ranking, votes, coverImageUrl, etc. lors des mises à jour admin */
export const challengeSettingsSchema = z
  .object({
    registration: challengeRegistrationSettingsSchema.optional(),
    coverImageUrl: z.preprocess(
      (val) => (typeof val === 'string' && !val.trim() ? null : val),
      z.string().optional().nullable()
    ),
  })
  .passthrough()

export const createChallengeSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug invalide'),
  description: z.string().max(2000).optional().nullable(),
  status: challengeStatusFieldSchema.default(ChallengeStatus.DRAFT),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  settings: challengeSettingsSchema.optional().nullable(),
})

export const updateChallengeSchema = createChallengeSchema.partial().extend({
  status: challengeStatusFieldSchema.optional(),
})

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>
export type UpdateChallengeInput = z.infer<typeof updateChallengeSchema>

export function parseOptionalDate(value?: string | null): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function normalizeChallengeStatus(value?: string | null): ChallengeStatus {
  if (value === 'ACTIVE' || value === 'ARCHIVED' || value === 'DRAFT') return value
  return ChallengeStatus.DRAFT
}
