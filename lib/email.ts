/**
 * @file lib/email.ts
 * @description Configuration et utilitaires pour l'envoi d'emails avec Nodemailer
 */

import nodemailer from 'nodemailer'
import { getMainSiteOrigin } from '@/lib/site-origin'

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Vérifier la configuration email
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('[Email] Configuration SMTP manquante')
      return false
    }
    await transporter.verify()
    return true
  } catch (error) {
    console.error('[Email] Erreur vérification config:', error)
    return false
  }
}

// Interface pour les options d'email
interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Fonction générique pour envoyer un email
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    // Vérifier la configuration
    const isConfigured = await verifyEmailConfig()
    if (!isConfigured) {
      console.warn('[Email] Configuration SMTP manquante, email non envoyé')
      return false
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@reseau-oma.com'

    await transporter.sendMail({
      from: `"Réseau OMA" <${from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Version texte sans HTML
    })

    console.log(`[Email] Email envoyé avec succès à ${options.to}`)
    return true
  } catch (error) {
    console.error('[Email] Erreur envoi email:', error)
    return false
  }
}

// Template d'email de confirmation d'inscription
export function generateRegistrationConfirmationEmail(data: {
  fullName: string
  eventTitle: string
  eventDate: string | null
  eventLocation: string | null
  eventDescription: string | null
  registrationId: string
  eventSlug?: string
}): string {
  const siteUrl = getMainSiteOrigin()
  const supportEmail = process.env.SUPPORT_EMAIL || 'contact@reseau-oma.com'

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation d'inscription</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Réseau OMA</h1>
              <p style="margin: 10px 0 0; color: #ffffff; opacity: 0.9; font-size: 16px;">Confirmation d'inscription</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>${data.fullName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Nous avons le plaisir de vous confirmer votre inscription à l'événement :
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 10px; color: #333333; font-size: 22px; font-weight: 600;">
                  ${data.eventTitle}
                </h2>
                ${data.eventDate ? `
                <p style="margin: 8px 0; color: #666666; font-size: 14px;">
                  📅 <strong>Date :</strong> ${data.eventDate}
                </p>
                ` : ''}
                ${data.eventLocation ? `
                <p style="margin: 8px 0; color: #666666; font-size: 14px;">
                  📍 <strong>Lieu :</strong> ${data.eventLocation}
                </p>
                ` : ''}
              </div>
              
              ${data.eventDescription ? `
              <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                ${data.eventDescription}
              </p>
              ` : ''}
              
              <div style="background-color: #e8f5e9; border: 1px solid #4caf50; border-radius: 4px; padding: 15px; margin: 30px 0;">
                <p style="margin: 0; color: #2e7d32; font-size: 14px; font-weight: 600;">
                  ✅ Votre inscription a été enregistrée avec succès !
                </p>
                <p style="margin: 10px 0 0; color: #2e7d32; font-size: 12px;">
                  Numéro de confirmation : <strong>${data.registrationId.substring(0, 8).toUpperCase()}</strong>
                </p>
              </div>
              
              <p style="margin: 30px 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Nous vous remercions de votre intérêt et nous avons hâte de vous accueillir !
              </p>
              
              <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Si vous avez des questions ou besoin d'informations complémentaires, n'hésitez pas à nous contacter.
              </p>
              
              ${data.eventSlug ? `
              <div style="background-color: #e8f4f8; border: 1px solid #b3d9e6; border-radius: 4px; padding: 15px; margin: 30px 0;">
                <p style="margin: 0; color: #0c5460; font-size: 13px; line-height: 1.6;">
                  📧 <strong>Rappels automatiques :</strong> Vous recevrez des rappels quotidiens 5 jours avant l'événement. 
                  <a href="${siteUrl}/events/${data.eventSlug}/reminders?registration=${data.registrationId}" style="color: #667eea; text-decoration: underline; margin-left: 4px;">
                    Gérer les rappels
                  </a>
                </p>
              </div>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                <strong>Réseau OMA</strong><br>
                Art oratoire, Communication, Management et Formation
              </p>
              <p style="margin: 10px 0 0; color: #999999; font-size: 11px;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
                Pour toute question, contactez-nous à <a href="mailto:${supportEmail}" style="color: #667eea; text-decoration: none;">${supportEmail}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// Fonction pour envoyer l'email de confirmation d'inscription
export async function sendRegistrationConfirmationEmail(data: {
  email: string
  fullName: string
  eventTitle: string
  eventDate: string | null
  eventLocation: string | null
  eventDescription: string | null
  registrationId: string
  eventSlug?: string
}): Promise<boolean> {
  const html = generateRegistrationConfirmationEmail({
    fullName: data.fullName,
    eventTitle: data.eventTitle,
    eventDate: data.eventDate,
    eventLocation: data.eventLocation,
    eventDescription: data.eventDescription,
    registrationId: data.registrationId,
    eventSlug: data.eventSlug,
  })

  return await sendEmail({
    to: data.email,
    subject: `Confirmation d'inscription - ${data.eventTitle}`,
    html,
  })
}

// Template d'email de rappel d'événement
function generateEventReminderEmail(data: {
  fullName: string
  eventTitle: string
  eventDate: Date
  eventLocation: string | null
  eventDescription: string | null
  daysUntilEvent: number
  eventSlug: string
  registrationId: string
}): string {
  const siteUrl = getMainSiteOrigin()
  const supportEmail = process.env.SUPPORT_EMAIL || 'contact@reseau-oma.com'
  const unsubscribeUrl = `${siteUrl}/events/${data.eventSlug}/reminders?registration=${data.registrationId}&action=unsubscribe`
  const eventUrl = `${siteUrl}/events/${data.eventSlug}`

  const formattedDate = data.eventDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const daysText = data.daysUntilEvent === 1 ? 'jour' : 'jours'

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rappel - ${data.eventTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Réseau OMA</h1>
              <p style="margin: 10px 0 0; color: #ffffff; opacity: 0.9; font-size: 16px;">Rappel d'événement</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>${data.fullName}</strong>,
              </p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 18px; font-weight: 600;">
                  ⏰ Il reste <strong>${data.daysUntilEvent} ${daysText}</strong> avant l'événement !
                </p>
              </div>
              
              <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Nous vous rappelons votre inscription à :
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 10px; color: #333333; font-size: 22px; font-weight: 600;">
                  ${data.eventTitle}
                </h2>
                <p style="margin: 8px 0; color: #666666; font-size: 14px;">
                  📅 <strong>Date :</strong> ${formattedDate}
                </p>
                ${data.eventLocation ? `
                <p style="margin: 8px 0; color: #666666; font-size: 14px;">
                  📍 <strong>Lieu :</strong> ${data.eventLocation}
                </p>
                ` : ''}
              </div>
              
              ${data.eventDescription ? `
              <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                ${data.eventDescription.substring(0, 200)}${data.eventDescription.length > 200 ? '...' : ''}
              </p>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${eventUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Voir les détails de l'événement
                </a>
              </div>
              
              <p style="margin: 30px 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Nous avons hâte de vous accueillir !
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                <strong>Réseau OMA</strong><br>
                Art oratoire, Communication, Management et Formation
              </p>
              <p style="margin: 10px 0 0; color: #999999; font-size: 11px;">
                Vous recevez ce rappel car vous êtes inscrit à cet événement.<br>
                <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none;">Désactiver les rappels pour cet événement</a><br>
                Pour toute question, contactez-nous à <a href="mailto:${supportEmail}" style="color: #667eea; text-decoration: none;">${supportEmail}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// Fonction pour envoyer l'email de rappel d'événement
export async function sendEventReminderEmail(data: {
  email: string
  fullName: string
  eventTitle: string
  eventDate: Date
  eventLocation: string | null
  eventDescription: string | null
  daysUntilEvent: number
  eventSlug: string
  registrationId: string
}): Promise<boolean> {
  const html = generateEventReminderEmail({
    fullName: data.fullName,
    eventTitle: data.eventTitle,
    eventDate: data.eventDate,
    eventLocation: data.eventLocation,
    eventDescription: data.eventDescription,
    daysUntilEvent: data.daysUntilEvent,
    eventSlug: data.eventSlug,
    registrationId: data.registrationId,
  })

  return await sendEmail({
    to: data.email,
    subject: `⏰ Rappel : ${data.eventTitle} dans ${data.daysUntilEvent} jour${data.daysUntilEvent > 1 ? 's' : ''}`,
    html,
  })
}

