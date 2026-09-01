/**
 * @file app/api/admin/roles/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'
import { assertCanAssignPermissions } from '@/lib/authz/escalation-guard'
import { ROOT_ROLE_ID } from '@/lib/authz/constants'
import { resolveRoleIsRoot } from '@/lib/authz/role-queries'
import { isPrismaClientOutdatedError } from '@/lib/authz/schema'

const updateRoleSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  structureId: z.string().uuid().optional().nullable(),
  permissionKeys: z.array(z.string().min(1)).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('roles.view')
    if (isPermissionDenied(session)) return session

    const { id } = await params
    let role
    try {
      role = await prisma.role.findUnique({
        where: { id },
        include: {
          structure: { select: { id: true, name: true, slug: true } },
          permissions: { include: { permission: true } },
        },
      })
    } catch (error) {
      if (!isPrismaClientOutdatedError(error)) throw error
      role = await prisma.role.findUnique({
        where: { id },
        include: { permissions: { include: { permission: true } } },
      })
    }

    if (!role) {
      return NextResponse.json({ success: false, error: 'Rôle introuvable' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: role })
  } catch (error) {
    console.error('[API] Erreur GET role:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du rôle' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('roles.update')
    if (isPermissionDenied(session)) return session

    const { id } = await params
    const existing = await prisma.role.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Rôle introuvable' }, { status: 404 })
    }

    if (resolveRoleIsRoot(existing)) {
      return NextResponse.json(
        { success: false, error: 'Le rôle ROOT ne peut pas être modifié' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = updateRoleSchema.parse(body)

    if (data.permissionKeys) {
      const escalation = await assertCanAssignPermissions(
        session,
        data.permissionKeys,
        data.structureId ?? ('structureId' in existing ? existing.structureId : null)
      )
      if (!escalation.ok) {
        return NextResponse.json(
          { success: false, error: escalation.reason },
          { status: 403 }
        )
      }
    }

    await prisma.$transaction(async (tx) => {
      if (data.permissionKeys) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } })
        const permissions = await tx.permission.findMany({
          where: { key: { in: data.permissionKeys } },
        })
        await tx.rolePermission.createMany({
          data: permissions.map((p) => ({ roleId: id, permissionId: p.id })),
        })
      }

      const updateData: Record<string, unknown> = {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      }
      if (data.structureId !== undefined) {
        updateData.structureId = data.structureId
      }

      try {
        await tx.role.update({ where: { id }, data: updateData })
      } catch (updateError) {
        if (!isPrismaClientOutdatedError(updateError)) throw updateError
        const { structureId: _s, ...legacyData } = updateData
        await tx.role.update({ where: { id }, data: legacyData })
      }
    })

    const role = await prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'role.update',
        target: 'Role',
        payload: { id, ...data },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Rôle mis à jour',
      data: role,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API] Erreur PUT role:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du rôle' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('roles.delete')
    if (isPermissionDenied(session)) return session

    const { id } = await params

    if (id === ROOT_ROLE_ID) {
      return NextResponse.json(
        { success: false, error: 'Le rôle ROOT ne peut pas être supprimé' },
        { status: 403 }
      )
    }

    const role = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { memberships: true } } },
    })

    if (!role) {
      return NextResponse.json({ success: false, error: 'Rôle introuvable' }, { status: 404 })
    }

    if (resolveRoleIsRoot(role)) {
      return NextResponse.json(
        { success: false, error: 'Le rôle ROOT ne peut pas être supprimé' },
        { status: 403 }
      )
    }

    if (role._count.memberships > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ce rôle est encore attribué à des utilisateurs. Désactivez-le ou réassignez les membres.',
        },
        { status: 409 }
      )
    }

    await prisma.role.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'role.delete',
        target: 'Role',
        payload: { id, name: role.name },
      },
    })

    return NextResponse.json({ success: true, message: 'Rôle supprimé' })
  } catch (error) {
    console.error('[API] Erreur DELETE role:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du rôle' },
      { status: 500 }
    )
  }
}
