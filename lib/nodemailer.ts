/**
 * @file lib/nodemailer.ts
 * @description Configuration Nodemailer pour l'envoi d'emails via Gmail
 * Les paramètres SMTP sont chargés dynamiquement depuis la base de données (SiteSetting)
 */

import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

// Cache pour les paramètres SMTP (évite de requêter la DB à chaque envoi)
let smtpConfigCache: {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
} | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Charge les paramètres SMTP depuis la base de données
 * Utilise un cache pour éviter les requêtes répétées
 */
async function getSMTPConfig() {
  const now = Date.now()
  
  // Retourner le cache si valide
  if (smtpConfigCache && (now - cacheTimestamp) < CACHE_TTL) {
    return smtpConfigCache
  }

  try {
    // Charger les paramètres SMTP depuis SiteSetting
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass'],
        },
      },
    })

    const settingsMap: Record<string, string> = {}
    settings.forEach((setting: { key: string; value: string }) => {
      settingsMap[setting.key] = setting.value
    })

    // Valeurs par défaut depuis .env si non définies en DB
    const config = {
      host: settingsMap.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(settingsMap.smtp_port || process.env.SMTP_PORT || '587'),
      secure: settingsMap.smtp_secure === 'true' || process.env.SMTP_SECURE === 'true',
      user: settingsMap.smtp_user || process.env.SMTP_USER || '',
      pass: settingsMap.smtp_pass || process.env.SMTP_PASS || '',
    }

    // Mettre en cache
    smtpConfigCache = config
    cacheTimestamp = now

    return config
  } catch (error) {
    console.error('[Nodemailer] Erreur chargement config SMTP:', error)
    // Retourner les valeurs par défaut depuis .env
    return {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    }
  }
}

/**
 * Crée un transporteur Nodemailer avec la configuration dynamique
 */
async function createTransporter() {
  const config = await getSMTPConfig()
  
  console.log('[Nodemailer] Création transporteur avec config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.user,
    hasPass: !!config.pass,
  })
  
  if (!config.user || !config.pass) {
    const missing = []
    if (!config.user) missing.push('SMTP_USER')
    if (!config.pass) missing.push('SMTP_PASS')
    throw new Error(`Configuration SMTP incomplète. Paramètres manquants: ${missing.join(', ')}. Veuillez les configurer dans /admin/settings`)
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      // Options supplémentaires pour Gmail
      tls: {
        rejectUnauthorized: false, // Pour les certificats auto-signés (développement)
      },
    })
    
    console.log('[Nodemailer] Transporteur créé avec succès')
    return transporter
  } catch (error: any) {
    console.error('[Nodemailer] Erreur création transporteur:', error)
    throw new Error(`Erreur lors de la création du transporteur SMTP: ${error.message}`)
  }
}

/**
 * Invalide le cache des paramètres SMTP
 * À appeler après une mise à jour des paramètres
 */
export function invalidateSMTPCache() {
  smtpConfigCache = null
  cacheTimestamp = 0
}

// Note: getSMTPConfig est une fonction interne, non exportée
// Utiliser verifySMTPConnection() pour tester la connexion

/**
 * Récupère l'email de contact depuis la table Contact
 */
async function getContactEmail(): Promise<string> {
  try {
    const contact = await prisma.contact.findFirst({
      orderBy: { updatedAt: 'desc' },
    })

    if (contact?.email) {
      return contact.email
    }

    // Fallback vers .env ou SMTP_USER
    return process.env.CONTACT_EMAIL || process.env.SMTP_USER || ''
  } catch (error) {
    console.error('[Nodemailer] Erreur récupération email contact:', error)
    return process.env.CONTACT_EMAIL || process.env.SMTP_USER || ''
  }
}

/**
 * Envoyer un email de contact
 * @param name - Nom de l'expéditeur
 * @param email - Email de l'expéditeur
 * @param subject - Sujet du message
 * @param message - Contenu du message
 * @returns Promise avec le résultat de l'envoi
 */
export async function sendContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string
) {
  try {
    console.log('[Nodemailer] Début envoi email...')
    
    // Récupérer l'email de contact depuis la base de données
    const contactEmail = await getContactEmail()
    console.log('[Nodemailer] Email de contact:', contactEmail)

    if (!contactEmail) {
      throw new Error('Email de contact non configuré. Veuillez configurer l\'email dans les paramètres de contact.')
    }

    // Récupérer la config pour obtenir SMTP_USER
    const config = await getSMTPConfig()
    console.log('[Nodemailer] Config SMTP:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user,
      pass: config.pass ? '***' : 'NON CONFIGURÉ',
    })

    if (!config.user || !config.pass) {
      throw new Error('Configuration SMTP incomplète. Veuillez configurer SMTP_USER et SMTP_PASS dans les paramètres admin.')
    }

    // Créer le transporteur avec la config dynamique
    const transporter = await createTransporter()
    console.log('[Nodemailer] Transporteur créé')

    const mailOptions = {
      from: `"${name}" <${config.user}>`,
      replyTo: email,
      to: contactEmail,
      subject: subject || `Nouveau message de contact de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
            Nouveau message de contact
          </h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Nom:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${subject ? `<p><strong>Sujet:</strong> ${subject}</p>` : ''}
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Message:</h3>
            <div style="background: #fff; padding: 15px; border-left: 4px solid #D4AF37; white-space: pre-wrap;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>Ce message a été envoyé depuis le formulaire de contact du site Réseau OMA.</p>
            <p>Pour répondre, utilisez l'adresse email: <a href="mailto:${email}">${email}</a></p>
          </div>
        </div>
      `,
      text: `
Nouveau message de contact

Nom: ${name}
Email: ${email}
${subject ? `Sujet: ${subject}` : ''}

Message:
${message}

---
Ce message a été envoyé depuis le formulaire de contact du site Réseau OMA.
      `,
    }

    console.log('[Nodemailer] Envoi email...', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    })
    
    const info = await transporter.sendMail(mailOptions)
    console.log('[Nodemailer] Email envoyé avec succès:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('[Nodemailer] Erreur envoi email:', error)
    console.error('[Nodemailer] Détails erreur:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    })
    throw new Error(`Erreur lors de l'envoi de l'email: ${error.message}`)
  }
}

/**
 * Vérifier la connexion SMTP
 */
export async function verifySMTPConnection() {
  try {
    const transporter = await createTransporter()
    await transporter.verify()
    return { success: true, message: 'Connexion SMTP réussie' }
  } catch (error: any) {
    console.error('[Nodemailer] Erreur vérification SMTP:', error)
    return { success: false, message: error.message }
  }
}

