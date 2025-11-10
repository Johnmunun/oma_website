/**
 * @file app/api/contact/route.ts
 * @description API route pour recevoir les messages de contact
 * Enregistre le message en base et envoie un email via Nodemailer
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContactEmail } from '@/lib/nodemailer'
import { z } from 'zod'

// Schéma de validation pour les messages de contact
const contactMessageSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z.string().email('Email invalide'),
  subject: z.string().max(200, 'Le sujet ne peut pas dépasser 200 caractères').optional().nullable(),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères').max(5000, 'Le message ne peut pas dépasser 5000 caractères'),
})

// POST /api/contact
// Reçoit un message de contact, l'enregistre en base et envoie un email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = contactMessageSchema.parse(body)

    // Enregistrer le message en base de données
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: validatedData.name.trim(),
        email: validatedData.email.trim().toLowerCase(),
        subject: validatedData.subject?.trim() || null,
        message: validatedData.message.trim(),
        isRead: false,
      },
    })

    // Envoyer l'email via Nodemailer
    let emailSent = false
    let emailError: string | null = null
    let emailErrorDetails: any = null
    try {
      await sendContactEmail(
        validatedData.name,
        validatedData.email,
        validatedData.subject || `Message de ${validatedData.name}`,
        validatedData.message
      )
      emailSent = true
      console.log('[API Contact] ✅ Email envoyé avec succès')
    } catch (err: any) {
      // Logger l'erreur mais ne pas faire échouer la requête
      // Le message est déjà enregistré en base
      emailError = err.message || 'Erreur inconnue'
      emailErrorDetails = {
        message: err.message,
        code: err.code,
        command: err.command,
        response: err.response,
        responseCode: err.responseCode,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      }
      console.error('[API Contact] ❌ Erreur envoi email:', emailError)
      console.error('[API Contact] Détails:', emailErrorDetails)
      // On continue même si l'email n'a pas pu être envoyé
    }

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
        : 'Votre message a été enregistré mais l\'envoi de l\'email a échoué. Nous vous contacterons bientôt.',
      data: {
        id: contactMessage.id,
        emailSent,
        ...(emailError && { 
          emailError,
          ...(process.env.NODE_ENV === 'development' && emailErrorDetails && { emailErrorDetails }),
        }),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('[API Contact] Erreur:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.',
      },
      { status: 500 }
    )
  }
}

