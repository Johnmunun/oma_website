/**
 * @file app/api/admin/team/[id]/route.ts
 * @description API routes pour gérer un membre de l'équipe spécifique
 * GET: Récupère un membre
 * PUT: Met à jour un membre
 * DELETE: Supprime un membre
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour la mise à jour
const updateTeamMemberSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  role: z.string().min(1).max(200).optional(),
  bio: z.string().max(250).optional().nullable(), // Limité à 250 caractères
  photoUrl: z.string().url().optional().nullable(),
  xUrl: z.string().url().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  facebookUrl: z.string().url().optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  order: z.number().int().optional(),
})

// GET /api/admin/team/[id]
// Récupère un membre spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Vérifier les permissions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const member = await prisma.teamMember.findUnique({
      where: { id: params.id },
    })

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: member,
    })
  } catch (error) {
    console.error('[API] Erreur GET team member:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du membre' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/team/[id]
// Met à jour un membre
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Vérifier les permissions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Valider les données
    const validatedData = updateTeamMemberSchema.parse(body)

    // Vérifier que le membre existe
    const existingMember = await prisma.teamMember.findUnique({
      where: { id: params.id },
    })

    if (!existingMember) {
      return NextResponse.json(
        { success: false, error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le membre
    const member = await prisma.teamMember.update({
      where: { id: params.id },
      data: validatedData,
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'team.update',
        target: 'TeamMember',
        payload: validatedData,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Membre mis à jour avec succès',
      data: member,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur PUT team member:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du membre' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/team/[id]
// Supprime un membre
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Vérifier les permissions (seuls ADMIN peuvent supprimer)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Seuls les administrateurs peuvent supprimer.' },
        { status: 403 }
      )
    }

    // Vérifier que le membre existe
    const existingMember = await prisma.teamMember.findUnique({
      where: { id: params.id },
    })

    if (!existingMember) {
      return NextResponse.json(
        { success: false, error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le membre
    await prisma.teamMember.delete({
      where: { id: params.id },
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'team.delete',
        target: 'TeamMember',
        payload: { id: params.id },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Membre supprimé avec succès',
    })
  } catch (error) {
    console.error('[API] Erreur DELETE team member:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du membre' },
      { status: 500 }
    )
  }
}

