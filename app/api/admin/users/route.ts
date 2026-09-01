/**
 * @file app/api/admin/users/route.ts
 * @description API routes pour gérer les utilisateurs (admin)
 * GET: Récupère tous les utilisateurs
 * POST: Crée un nouvel utilisateur
 * PROTÉGÉ : Requiert session NextAuth avec rôle ADMIN uniquement
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'
import { assertCanAssignRole } from '@/lib/authz/escalation-guard'
import { resolveRoleIsRoot } from '@/lib/authz/role-queries'
import { isPrismaClientOutdatedError } from '@/lib/authz/schema'

// Schéma de validation pour créer un utilisateur
const createUserSchema = z
  .object({
    name: z.string().min(1, 'Le nom est requis').max(200, 'Le nom est trop long'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).default('VIEWER').optional(),
    roleId: z.string().uuid().optional(),
    structureId: z.string().uuid().optional(),
    isActive: z.boolean().default(true).optional(),
  })
  .refine(
    (data) => {
      const hasRbac = Boolean(data.roleId && data.structureId)
      const hasPartial = Boolean(data.roleId || data.structureId)
      return !hasPartial || hasRbac
    },
    { message: 'La structure et le rôle RBAC doivent être fournis ensemble' }
  )

// GET /api/admin/users
// Récupère tous les utilisateurs
export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('users.view')
    if (isPermissionDenied(session)) return session

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

    // Récupérer tous les utilisateurs avec leurs rôles RBAC
    let users
    try {
      users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isRoot: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          image: true,
          emailVerified: true,
          memberships: {
            where: { isActive: true },
            select: {
              id: true,
              role: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  isRoot: true,
                },
              },
              structure: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      })
    } catch (queryError) {
      if (!isPrismaClientOutdatedError(queryError)) throw queryError
      users = await prisma.user.findMany({
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
          memberships: {
            where: { isActive: true },
            select: {
              id: true,
              role: {
                select: { id: true, name: true, slug: true },
              },
              structure: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isRoot: 'isRoot' in user ? Boolean(user.isRoot) : user.role === 'ADMIN',
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        image: user.image,
        emailVerified: user.emailVerified,
        rbacRoles: user.memberships.map((m) => ({
          membershipId: m.id,
          roleId: m.role.id,
          roleName: m.role.name,
          roleSlug: m.role.slug,
          isRoot: resolveRoleIsRoot(m.role),
          structureId: m.structure.id,
          structureName: m.structure.name,
        })),
      })),
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
    const session = await requirePermission('users.manage')
    if (isPermissionDenied(session)) return session

    const body = await request.json()

    // Valider les données
    const validatedData = createUserSchema.parse(body)

    if (validatedData.roleId && validatedData.structureId) {
      const escalation = await assertCanAssignRole(
        session,
        validatedData.roleId,
        validatedData.structureId
      )
      if (!escalation.ok) {
        return NextResponse.json(
          { success: false, error: escalation.reason },
          { status: 403 }
        )
      }
    }

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

    // Créer l'utilisateur (+ attribution RBAC si fournie)
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email.toLowerCase(),
          password: hashedPassword,
          role: validatedData.role ?? 'VIEWER',
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

      if (validatedData.roleId && validatedData.structureId) {
        await tx.structureMembership.upsert({
          where: {
            userId_structureId_roleId: {
              userId: created.id,
              structureId: validatedData.structureId,
              roleId: validatedData.roleId,
            },
          },
          update: { isActive: true },
          create: {
            userId: created.id,
            structureId: validatedData.structureId,
            roleId: validatedData.roleId,
            isActive: true,
          },
        })
      }

      return created
    })

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'user.create',
        target: 'User',
        payload: {
          id: user.id,
          email: user.email,
          role: user.role,
          roleId: validatedData.roleId,
          structureId: validatedData.structureId,
        },
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

