/**
 * @file app/api/admin/users/route.ts
 * @description API routes pour gérer les utilisateurs (admin)
 * GET: Récupère tous les utilisateurs
 * POST: Crée un nouvel utilisateur
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN uniquement
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Schéma de validation pour créer un utilisateur
const createUserSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(200, 'Le nom est trop long'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).default('EDITOR'),
  isActive: z.boolean().default(true).optional(),
})

// GET /api/admin/users
// Récupère tous les utilisateurs
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

    // Seuls les ADMIN peuvent voir la liste des utilisateurs
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Seuls les administrateurs peuvent voir les utilisateurs.' },
        { status: 403 }
      )
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')

    // Construire les filtres
    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (role && role !== 'all') {
      where.role = role
    }

    // Récupérer tous les utilisateurs (sans le mot de passe)
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error('[API] Erreur GET users:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users
// Crée un nouvel utilisateur
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

    // Seuls les ADMIN peuvent créer des utilisateurs
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Seuls les administrateurs peuvent créer des utilisateurs.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Valider les données
    const validatedData = createUserSchema.parse(body)

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Un utilisateur avec cet email existe déjà' },
        { status: 409 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        password: hashedPassword,
        role: validatedData.role,
        isActive: validatedData.isActive ?? true,
      },
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
        action: 'user.create',
        target: 'User',
        payload: { id: user.id, email: user.email, role: user.role },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API] Erreur POST users:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
}

