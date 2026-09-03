import { z } from 'zod'
import { ChallengeVideoSource, ChallengeVideoStatus } from '@prisma/client'

export const challengeVideoStatusSchema = z.nativeEnum(ChallengeVideoStatus)
export const challengeVideoSourceSchema = z.nativeEnum(ChallengeVideoSource)

const optionalText = z.string().max(2000).optional().nullable()

export const publicVideoSubmitSchema = z
  .object({
    token: z.string().min(8),
    title: z.string().max(200).optional().nullable(),
    description: optionalText,
    videoUrl: z.string().min(8).optional().nullable(),
    fileId: z.string().min(8).max(80).optional().nullable(),
  })
  .superRefine((val, ctx) => {
    if (!val.fileId?.trim() && !val.videoUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Uploadez une vidéo Cloudflare ou collez un lien',
        path: ['videoUrl'],
      })
    }
  })

const createChallengeVideoBaseSchema = z.object({
  candidateId: z.string().uuid(),
  title: z.string().max(200).optional().nullable(),
  description: optionalText,
  videoUrl: z.string().min(8).optional().nullable(),
  fileId: z.string().min(8).max(80).optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  source: challengeVideoSourceSchema.optional(),
  status: challengeVideoStatusSchema.optional(),
})

export const createChallengeVideoSchema = createChallengeVideoBaseSchema.superRefine(
  (val, ctx) => {
    if (!val.fileId?.trim() && !val.videoUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Uploadez une vidéo ou fournissez une URL',
        path: ['videoUrl'],
      })
    }
  }
)

export const updateChallengeVideoSchema = createChallengeVideoBaseSchema
  .omit({ candidateId: true })
  .partial()
  .extend({
    reviewNotes: optionalText,
  })

export const challengeVideoStatusActionSchema = z.object({
  action: z.enum(['publish', 'reject', 'unpublish']),
  reviewNotes: optionalText,
})

export type CreateChallengeVideoInput = z.infer<typeof createChallengeVideoSchema>
export type UpdateChallengeVideoInput = z.infer<typeof updateChallengeVideoSchema>
export type PublicVideoSubmitInput = z.infer<typeof publicVideoSubmitSchema>
