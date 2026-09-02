import { z } from 'zod'
import { ChallengeVideoSource, ChallengeVideoStatus } from '@prisma/client'

export const challengeVideoStatusSchema = z.nativeEnum(ChallengeVideoStatus)
export const challengeVideoSourceSchema = z.nativeEnum(ChallengeVideoSource)

const optionalText = z.string().max(2000).optional().nullable()

export const createChallengeVideoSchema = z.object({
  candidateId: z.string().uuid(),
  title: z.string().max(200).optional().nullable(),
  description: optionalText,
  videoUrl: z.string().url('URL vidéo invalide').or(z.string().min(8)),
  thumbnailUrl: z.string().url().optional().nullable(),
  source: challengeVideoSourceSchema.optional(),
  status: challengeVideoStatusSchema.optional(),
})

export const updateChallengeVideoSchema = createChallengeVideoSchema
  .omit({ candidateId: true })
  .partial()
  .extend({
    reviewNotes: optionalText,
  })

export const challengeVideoStatusActionSchema = z.object({
  action: z.enum(['publish', 'reject', 'unpublish']),
  reviewNotes: optionalText,
})

export const publicVideoSubmitSchema = z.object({
  token: z.string().min(8),
  title: z.string().max(200).optional().nullable(),
  description: optionalText,
  videoUrl: z.string().min(8, 'URL vidéo requise'),
})

export type CreateChallengeVideoInput = z.infer<typeof createChallengeVideoSchema>
export type UpdateChallengeVideoInput = z.infer<typeof updateChallengeVideoSchema>
export type PublicVideoSubmitInput = z.infer<typeof publicVideoSubmitSchema>
