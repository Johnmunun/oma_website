import { StructureStatus, StructureType } from '@prisma/client'
import { z } from 'zod'

import { normalizeHexColor } from '@/lib/structures/landing-theme'
import { landingServicesFieldSchema } from '@/lib/structures/landing-service-schema'
import { slugifyStructureName } from './slug'

export const structureTypeSchema = z.nativeEnum(StructureType)
export const structureStatusSchema = z.nativeEnum(StructureStatus)

const optionalUrlField = z
  .string()
  .max(500)
  .optional()
  .nullable()
  .refine(
    (value) => {
      if (value == null || value.trim() === '') return true
      const trimmed = value.trim()
      if (trimmed.startsWith('/')) return true
      return z.string().url().safeParse(trimmed).success
    },
    { message: 'URL invalide' }
  )

const hexColorField = z
  .string()
  .max(20)
  .optional()
  .nullable()
  .refine(
    (value) => {
      if (value == null || value.trim() === '') return true
      const hex = value.trim().startsWith('#') ? value.trim() : `#${value.trim()}`
      return /^#[0-9a-fA-F]{3}$/.test(hex) || /^#[0-9a-fA-F]{6}$/.test(hex)
    },
    { message: 'Couleur hex invalide (ex. #f97316)' }
  )

export const createStructureSchema = z.object({
  name: z.string().min(2, 'Le nom est requis').max(200),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug invalide (a-z, 0-9, - uniquement)'),
  type: structureTypeSchema.default(StructureType.OMA_INTERNAL),
  description: z.string().max(500).optional().nullable(),
  logoUrl: optionalUrlField,
  status: structureStatusSchema.default(StructureStatus.ACTIVE),
  parentId: z.string().uuid().optional().nullable(),
  showOnLanding: z.boolean().default(false),
  landingOrder: z.number().int().min(0).max(9999).default(0),
  publicUrl: optionalUrlField,
  domain: z.string().max(200).optional().nullable(),
  subdomain: z
    .string()
    .max(100)
    .regex(/^[a-z0-9-]*$/, 'Sous-domaine invalide')
    .optional()
    .nullable(),
  expertiseDomainId: z.string().uuid().optional().nullable(),
  landingPagePath: z
    .string()
    .max(100)
    .regex(/^[a-z0-9-]*$/, 'Chemin landing invalide')
    .optional()
    .nullable(),
  landingHeroTitle: z.string().max(200).optional().nullable(),
  landingHeroHighlight: z.string().max(200).optional().nullable(),
  landingHeroSubtitle: z.string().max(500).optional().nullable(),
  landingThemeColor: hexColorField,
  landingServicesIntro: z.string().max(500).optional().nullable(),
  landingServices: landingServicesFieldSchema,
})

export const updateStructureSchema = createStructureSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateStructureInput = z.infer<typeof createStructureSchema>
export type UpdateStructureInput = z.infer<typeof updateStructureSchema>

export function normalizeOptionalUrl(value?: string | null): string | null {
  if (!value || value.trim() === '') return null
  return value.trim()
}

export function normalizeThemeColor(value?: string | null): string | null {
  return normalizeHexColor(value)
}
