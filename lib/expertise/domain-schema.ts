import { z } from 'zod'
import { EXPERTISE_ICON_KEYS } from '@/lib/expertise/domain-icons'

export const createExpertiseDomainSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug invalide'),
  description: z.string().max(500).optional().nullable(),
  iconKey: z.enum(EXPERTISE_ICON_KEYS).default('mic'),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true),
})

export const updateExpertiseDomainSchema = createExpertiseDomainSchema.partial()
