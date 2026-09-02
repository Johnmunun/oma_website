import { z } from 'zod'

const optionalText = z.string().max(2000).optional().nullable()

export const createJuryMemberSchema = z.object({
  fullName: z.string().min(2).max(200),
  email: z.string().email(),
  title: z.string().max(200).optional().nullable(),
  bio: optionalText,
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
})

export const updateJuryMemberSchema = createJuryMemberSchema.partial()

export const juryEvaluationSchema = z.object({
  candidateId: z.string().uuid(),
  score: z.number().min(0, 'Note minimum 0').max(10, 'Note maximum 10'),
  comment: optionalText,
})

export const publicJuryEvaluationSchema = juryEvaluationSchema.extend({
  token: z.string().min(8),
})

export type CreateJuryMemberInput = z.infer<typeof createJuryMemberSchema>
export type UpdateJuryMemberInput = z.infer<typeof updateJuryMemberSchema>
export type JuryEvaluationInput = z.infer<typeof juryEvaluationSchema>
