/**
 * @file app/api/admin/team/route.ts
 * @description API routes pour gérer les membres de l'équipe
 * GET: Récupère tous les membres
 * POST: Crée un nouveau membre
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN ou EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour un membre d'équipe
const teamMemberSchema = z.object({
  name: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  bio: z.string().max(250).optional().nullable(), // Limité à 250 caractères
  photoUrl: z.string().url().optional().nullable(),
  xUrl: z.string().url().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  facebookUrl: z.string().url().optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  order: z.number().int().default(0),
})

// GET /api/admin/team
// Récupère tous les membres de l'équipe
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

    // Récupérer tous les membres triés par ordre
    const members = await prisma.teamMember.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: members,
    })
  } catch (error) {
    console.error('[API] Erreur GET team:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des membres' },
      { status: 500 }
    )
  }
}

// POST /api/admin/team
// Crée un nouveau membre de l'équipe
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

    // Vérifier les permissions (seuls ADMIN et EDITOR peuvent créer)
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Valider les données
    const validatedData = teamMemberSchema.parse(body)

    // Créer le membre
    const member = await prisma.teamMember.create({
      data: validatedData,
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'team.create',
        target: 'TeamMember',
        payload: validatedData,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Membre créé avec succès',
      data: member,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur POST team:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du membre' },
      { status: 500 }
    )
  }
}

