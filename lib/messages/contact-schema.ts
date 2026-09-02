import { z } from 'zod'

export const contactMessageSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z.string().email('Email invalide'),
  subject: z
    .string()
    .max(200, 'Le sujet ne peut pas dépasser 200 caractères')
    .optional()
    .nullable(),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(5000, 'Le message ne peut pas dépasser 5000 caractères'),
})

export type ContactMessageInput = z.infer<typeof contactMessageSchema>
