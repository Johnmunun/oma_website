/**
 * @file app/api/admin/users/[id]/route.ts
 * @description API routes pour gérer un utilisateur spécifique (admin)
 * GET: Récupère un utilisateur
 * PUT: Met à jour un utilisateur
 * DELETE: Supprime un utilisateur
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN uniquement
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Schéma de validation pour la mise à jour
const updateUserSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/admin/users/[id]
// Récupère un utilisateur spécifique
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

    // Seuls les ADMIN peuvent voir les détails d'un utilisateur
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        emailVerified: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('[API] Erreur GET user:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id]
// Met à jour un utilisateur
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

    // Seuls les ADMIN peuvent modifier les utilisateurs
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Valider les données
    const validatedData = updateUserSchema.parse(body)

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si l'email change et s'il existe déjà
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email.toLowerCase() },
      })

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Un utilisateur avec cet email existe déjà' },
          { status: 409 }
        )
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = { ...validatedData }

    // Hasher le mot de passe si fourni
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 10)
    }

    // Normaliser l'email si fourni
    if (validatedData.email) {
      updateData.email = validatedData.email.toLowerCase()
    }

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        emailVerified: true,
      },
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'user.update',
        target: 'User',
        payload: { id: params.id, ...validatedData },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur PUT user:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id]
// Supprime un utilisateur
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

    // Seuls les ADMIN peuvent supprimer des utilisateurs
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Empêcher la suppression de son propre compte
    if (params.id === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: params.id },
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'user.delete',
        target: 'User',
        payload: { id: params.id, email: existingUser.email },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    })
  } catch (error) {
    console.error('[API] Erreur DELETE user:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}

