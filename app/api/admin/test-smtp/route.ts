/**
 * @file app/api/admin/test-smtp/route.ts
 * @description Endpoint de test pour vérifier la configuration SMTP
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { verifySMTPConnection, sendContactEmail } from '@/lib/nodemailer'
import { prisma } from '@/lib/prisma'

// GET /api/admin/test-smtp
// Teste la connexion SMTP et affiche la configuration
export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (ADMIN uniquement)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Récupérer la configuration SMTP depuis la base de données
    const smtpSettings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass'],
        },
      },
    })

    const smtpMap: Record<string, string> = {}
    smtpSettings.forEach((s: { key: string; value: string }) => {
      smtpMap[s.key] = s.value
    })

    const config = {
      host: smtpMap.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: smtpMap.smtp_port || process.env.SMTP_PORT || '587',
      secure: smtpMap.smtp_secure === 'true' || process.env.SMTP_SECURE === 'true',
      user: smtpMap.smtp_user || process.env.SMTP_USER || '',
      pass: smtpMap.smtp_pass || process.env.SMTP_PASS || '',
    }
    
    // Récupérer l'email de contact
    const contact = await prisma.contact.findFirst({
      orderBy: { updatedAt: 'desc' },
    })

    // Tester la connexion SMTP
    const connectionTest = await verifySMTPConnection()

    return NextResponse.json({
      success: true,
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user,
        pass: config.pass ? '***' : 'NON CONFIGURÉ',
      },
      contactEmail: contact?.email || 'NON CONFIGURÉ',
      connectionTest,
    })
  } catch (error: any) {
    console.error('[API Test SMTP] Erreur:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors du test SMTP' },
      { status: 500 }
    )
  }
}

// POST /api/admin/test-smtp
// Envoie un email de test
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (ADMIN uniquement)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const testEmail = body.email || session.user.email

    if (!testEmail) {
      return NextResponse.json(
        { success: false, error: 'Email de test requis' },
        { status: 400 }
      )
    }

    // Envoyer un email de test
    await sendContactEmail(
      'Test SMTP',
      testEmail,
      'Test de configuration SMTP',
      'Ceci est un email de test pour vérifier que la configuration SMTP fonctionne correctement.'
    )

    return NextResponse.json({
      success: true,
      message: `Email de test envoyé à ${testEmail}`,
    })
  } catch (error: any) {
    console.error('[API Test SMTP] Erreur envoi test:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erreur lors de l\'envoi de l\'email de test',
        details: error.code || error.response || error,
      },
      { status: 500 }
    )
  }
}

