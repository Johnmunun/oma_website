import { z } from 'zod'
import { ChallengeStatus } from '@prisma/client'
import { challengeRegistrationSettingsSchema } from '@/lib/challenges/challenge-registration-settings'

export const challengeStatusSchema = z.nativeEnum(ChallengeStatus)

/** Préserve ranking, votes, coverImageUrl, etc. lors des mises à jour admin */
export const challengeSettingsSchema = z
  .object({
    registration: challengeRegistrationSettingsSchema.optional(),
    coverImageUrl: z.string().optional().nullable(),
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
  status: challengeStatusSchema.default(ChallengeStatus.DRAFT),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  settings: challengeSettingsSchema.optional().nullable(),
})

export const updateChallengeSchema = createChallengeSchema.partial()

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>
export type UpdateChallengeInput = z.infer<typeof updateChallengeSchema>

export function parseOptionalDate(value?: string | null): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}
