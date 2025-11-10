/**
 * @file app/api/admin/contact/route.ts
 * @description API routes pour gérer les contacts du site
 * GET: Récupère les contacts
 * PUT: Met à jour les contacts
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour les contacts
// Validation permissive : accepte null, chaînes vides, ou valeurs valides
const urlOrEmpty = z.union([
  z.string().url(),
  z.string().length(0),
  z.null(),
  z.undefined(),
]).transform((val) => {
  if (!val || val === '') return null
  return val.trim()
}).optional().nullable()

const contactSchema = z.object({
  email: z.union([
    z.string().email(),
    z.string().length(0),
    z.null(),
    z.undefined(),
  ]).transform((val) => {
    if (!val || val === '') return null
    return val.trim()
  }).optional().nullable(),
  telephones: z.union([
    z.array(z.string()),
    z.null(),
    z.undefined(),
  ]).transform((val) => {
    if (!val || !Array.isArray(val) || val.length === 0) return null
    const filtered = val.filter((t) => t && typeof t === 'string' && t.trim())
    return filtered.length > 0 ? filtered.map((t) => t.trim()) : null
  }).optional().nullable(),
  facebook: urlOrEmpty,
  instagram: urlOrEmpty,
  youtube: urlOrEmpty,
  twitter: urlOrEmpty,
  linkedin: urlOrEmpty,
})

// GET /api/admin/contact
// Récupère les contacts
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

    // Vérifier les permissions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Récupérer les contacts
    let contact = await prisma.contact.findFirst({
      orderBy: { updatedAt: 'desc' },
    })

    // Si aucun contact n'existe, retourner des valeurs par défaut
    if (!contact) {
      return NextResponse.json({
        success: true,
        data: {
          email: null,
          telephones: [],
          facebook: null,
          instagram: null,
          youtube: null,
          twitter: null,
          linkedin: null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: contact,
    })
  } catch (error) {
    console.error('[API] Erreur GET contact:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des contacts' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/contact
// Met à jour les contacts
export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (seuls ADMIN peuvent modifier)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Seuls les administrateurs peuvent modifier les contacts.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Valider et nettoyer les données
    const validatedData = contactSchema.parse(body)

    // Préparer les données finales pour la base de données
    const cleanedData: any = {}
    if (validatedData.email) cleanedData.email = validatedData.email.trim()
    if (validatedData.telephones && Array.isArray(validatedData.telephones) && validatedData.telephones.length > 0) {
      cleanedData.telephones = validatedData.telephones.map((t: string) => t.trim()).filter((t: string) => t)
    }
    if (validatedData.facebook) cleanedData.facebook = validatedData.facebook.trim()
    if (validatedData.instagram) cleanedData.instagram = validatedData.instagram.trim()
    if (validatedData.youtube) cleanedData.youtube = validatedData.youtube.trim()
    if (validatedData.twitter) cleanedData.twitter = validatedData.twitter.trim()
    if (validatedData.linkedin) cleanedData.linkedin = validatedData.linkedin.trim()

    // Mettre à jour ou créer les contacts
    let contact = await prisma.contact.findFirst({
      orderBy: { updatedAt: 'desc' },
    })

    if (contact) {
      contact = await prisma.contact.update({
        where: { id: contact.id },
        data: cleanedData,
      })
    } else {
      contact = await prisma.contact.create({
        data: cleanedData,
      })
    }

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'contact.update',
        target: 'Contact',
        payload: cleanedData,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Contacts mis à jour avec succès',
      data: contact,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur PUT contact:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

