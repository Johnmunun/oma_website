import { CandidateStatus } from '@prisma/client'
import { z } from 'zod'

export const candidateStatusSchema = z.nativeEnum(CandidateStatus)

const optionalEmail = z
  .string()
  .email('Email invalide')
  .optional()
  .nullable()
  .or(z.literal(''))

const optionalPhone = z.string().max(30).optional().nullable()
const optionalText = z.string().max(2000).optional().nullable()

export const createCandidateSchema = z.object({
  fullName: z.string().min(2, 'Nom requis').max(200),
  email: z.string().email('Email invalide'),
  phone: optionalPhone,
  birthDate: z.string().optional().nullable(),
  age: z.number().int().min(1).max(120).optional().nullable(),
  parentName: z.string().max(200).optional().nullable(),
  parentEmail: optionalEmail,
  parentPhone: optionalPhone,
  city: z.string().max(100).optional().nullable(),
  notes: optionalText,
  status: candidateStatusSchema.optional(),
})

export const updateCandidateSchema = createCandidateSchema.partial().extend({
  reviewNotes: optionalText,
})

export const candidateStatusActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reviewNotes: optionalText,
})

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>

/** Schéma permissif côté API — la validation fine se fait via validatePublicRegistration */
export const publicCandidateRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Nom requis').max(200),
  email: z.string().email('Email invalide'),
  phone: optionalPhone,
  age: z.number().int().min(1).max(120).optional().nullable(),
  parentName: z.string().max(200).optional().nullable(),
  parentEmail: optionalEmail,
  parentPhone: optionalPhone,
  city: z.string().max(100).optional().nullable(),
  notes: optionalText,
})

export type PublicCandidateRegistrationInput = z.infer<typeof publicCandidateRegistrationSchema>

export function parseOptionalBirthDate(value?: string | null): Date | null {
  if (!value?.trim()) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function normalizeCandidateEmail(email: string): string {
  return email.trim().toLowerCase()
}
