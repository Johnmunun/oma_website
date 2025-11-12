/**
 * @file app/api/admin/partners/route.ts
 * @description API routes pour gérer les partenaires (admin)
 * GET: Récupère tous les partenaires
 * POST: Crée un nouveau partenaire
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour créer un partenaire
const createPartnerSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(200, 'Le nom est trop long'),
  logoUrl: z.string().url('URL du logo invalide').nullable().optional(),
  url: z.string().url('URL invalide').nullable().optional(),
  order: z.number().int().min(0).default(0),
})

// GET /api/admin/partners
// Récupère tous les partenaires
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (ADMIN ou EDITOR)
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Récupérer tous les partenaires (ordonnés par order)
    const partners = await prisma.partner.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: partners,
    })
  } catch (error) {
    console.error('[API] Erreur GET partners:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des partenaires' },
      { status: 500 }
    )
  }
}

// POST /api/admin/partners
// Crée un nouveau partenaire
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

    // Vérifier les permissions (ADMIN ou EDITOR)
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Valider les données
    const validatedData = createPartnerSchema.parse(body)

    // Créer le partenaire
    const partner = await prisma.partner.create({
      data: {
        name: validatedData.name,
        logoUrl: validatedData.logoUrl || null,
        url: validatedData.url || null,
        order: validatedData.order,
      },
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'partner.create',
        target: 'Partner',
        payload: { id: partner.id, name: partner.name },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Partenaire créé avec succès',
      data: partner,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur POST partners:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du partenaire' },
      { status: 500 }
    )
  }
}








