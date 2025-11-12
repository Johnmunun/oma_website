/**
 * @file app/api/admin/partners/[id]/route.ts
 * @description API routes pour gérer un partenaire spécifique (admin)
 * GET: Récupère un partenaire
 * PUT: Met à jour un partenaire
 * DELETE: Supprime un partenaire
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour la mise à jour
const updatePartnerSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  logoUrl: z.string().url().nullable().optional(),
  url: z.string().url().nullable().optional(),
  order: z.number().int().min(0).optional(),
})

// GET /api/admin/partners/[id]
// Récupère un partenaire spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const partner = await prisma.partner.findUnique({
      where: { id },
    })

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partenaire non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: partner,
    })
  } catch (error) {
    console.error('[API] Erreur GET partner:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du partenaire' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/partners/[id]
// Met à jour un partenaire
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()

    // Valider les données
    const validatedData = updatePartnerSchema.parse(body)

    // Vérifier que le partenaire existe
    const existingPartner = await prisma.partner.findUnique({
      where: { id },
    })

    if (!existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Partenaire non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le partenaire
    const partner = await prisma.partner.update({
      where: { id },
      data: validatedData,
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'partner.update',
        target: 'Partner',
        payload: { id, ...validatedData },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Partenaire mis à jour avec succès',
      data: partner,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur PUT partner:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du partenaire' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/partners/[id]
// Supprime un partenaire
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Vérifier que le partenaire existe
    const existingPartner = await prisma.partner.findUnique({
      where: { id },
    })

    if (!existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Partenaire non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le partenaire
    await prisma.partner.delete({
      where: { id },
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'partner.delete',
        target: 'Partner',
        payload: { id, name: existingPartner.name },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Partenaire supprimé avec succès',
    })
  } catch (error) {
    console.error('[API] Erreur DELETE partner:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du partenaire' },
      { status: 500 }
    )
  }
}








