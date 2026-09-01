/**
 * @file app/api/admin/roles/route.ts
 * @description CRUD rôles dynamiques (ERP)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'
import { assertCanAssignPermissions } from '@/lib/authz/escalation-guard'
import { listRolesForAdmin } from '@/lib/authz/role-queries'
import { isPrismaClientOutdatedError } from '@/lib/authz/schema'

const createRoleSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional().nullable(),
  structureId: z.string().uuid().optional().nullable(),
  permissionKeys: z.array(z.string().min(1)).default([]),
  isActive: z.boolean().default(true),
})

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('roles.view')
    if (isPermissionDenied(session)) return session

    const { searchParams } = new URL(request.url)
    const structureId = searchParams.get('structureId')

    const roles = await listRolesForAdmin(prisma, structureId)

    return NextResponse.json({
      success: true,
      data: roles,
    })
  } catch (error) {
    console.error('[API] Erreur GET roles:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des rôles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission('roles.create')
    if (isPermissionDenied(session)) return session

    const body = await request.json()
    const data = createRoleSchema.parse(body)

    const escalation = await assertCanAssignPermissions(
      session,
      data.permissionKeys,
      data.structureId
    )
    if (!escalation.ok) {
      return NextResponse.json(
        { success: false, error: escalation.reason },
        { status: 403 }
      )
    }

    let slug = slugify(data.name)
    const existing = await prisma.role.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const permissions = await prisma.permission.findMany({
      where: { key: { in: data.permissionKeys } },
    })

    const permissionCreates = {
      create: permissions.map((p) => ({ permissionId: p.id })),
    }

    let role
    try {
      role = await prisma.role.create({
        data: {
          name: data.name,
          slug,
          description: data.description ?? null,
          structureId: data.structureId ?? null,
          isActive: data.isActive,
          isSystem: false,
          isRoot: false,
          permissions: permissionCreates,
        },
        include: {
          permissions: { include: { permission: { select: { key: true } } } },
        },
      })
    } catch (createError) {
      if (!isPrismaClientOutdatedError(createError)) throw createError
      role = await prisma.role.create({
        data: {
          name: data.name,
          slug,
          description: data.description ?? null,
          isActive: data.isActive,
          isSystem: false,
          permissions: permissionCreates,
        },
        include: {
          permissions: { include: { permission: { select: { key: true } } } },
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'role.create',
        target: 'Role',
        payload: { id: role.id, name: role.name, permissionKeys: data.permissionKeys },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Rôle créé avec succès',
      data: role,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur POST roles:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du rôle' },
      { status: 500 }
    )
  }
}
