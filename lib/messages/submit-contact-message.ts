import { prisma } from '@/lib/prisma'
import { sendContactEmail } from '@/lib/nodemailer'
import { contactMessageSchema, type ContactMessageInput } from '@/lib/messages/contact-schema'

export async function submitContactMessage(
  data: ContactMessageInput,
  structureId: string | null,
  structureName?: string
) {
  const validated = contactMessageSchema.parse(data)

  const contactMessage = await prisma.contactMessage.create({
    data: {
      name: validated.name.trim(),
      email: validated.email.trim().toLowerCase(),
      subject: validated.subject?.trim() || null,
      message: validated.message.trim(),
      structureId,
      isRead: false,
    },
  })

  const emailSubject =
    validated.subject?.trim() ||
    (structureName
      ? `[${structureName}] Message de ${validated.name.trim()}`
      : `Message de ${validated.name.trim()}`)

  let emailSent = false
  let emailError: string | null = null

  try {
    await sendContactEmail(
      validated.name.trim(),
      validated.email.trim(),
      emailSubject,
      validated.message.trim()
    )
    emailSent = true
  } catch (err: unknown) {
    emailError = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('[submitContactMessage] Erreur envoi email:', emailError)
  }

  return { contactMessage, emailSent, emailError }
}
