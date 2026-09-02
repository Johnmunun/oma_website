import { z } from 'zod'
import { EXPERTISE_ICON_KEYS } from '@/lib/expertise/domain-icons'

const iconKeySchema = z
  .string()
  .max(50)
  .refine((value) => (EXPERTISE_ICON_KEYS as readonly string[]).includes(value), {
    message: 'Icône invalide',
  })

export const landingServiceItemSchema = z.object({
  title: z.string().min(2, 'Titre requis').max(120),
  description: z.string().max(500).optional().nullable(),
  iconKey: iconKeySchema.default('mic'),
})

export type LandingServiceInput = z.infer<typeof landingServiceItemSchema>

export const landingServicesFieldSchema = z.array(landingServiceItemSchema).max(12).optional()
