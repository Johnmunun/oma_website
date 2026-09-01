/**
 * @file app/api/admin/memberships/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission, isPermissionDenied } from '@/lib/authz/require-permission'
import { ROOT_ROLE_ID } from '@/lib/authz/constants'
import { resolveRoleIsRoot } from '@/lib/authz/role-queries'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('users.assign-roles')
    if (isPermissionDenied(session)) return session

    const { id } = await params

    const membership = await prisma.structureMembership.findUnique({
      where: { id },
      include: { role: true },
    })

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Attribution introuvable' },
        { status: 404 }
      )
    }

    if (membership.roleId === ROOT_ROLE_ID || resolveRoleIsRoot(membership.role)) {
      const rootCount = await prisma.structureMembership.count({
        where: {
          roleId: ROOT_ROLE_ID,
          isActive: true,
          id: { not: id },
        },
      })
      if (rootCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Impossible de retirer le dernier rôle ROOT' },
          { status: 403 }
        )
      }
    }

    await prisma.structureMembership.update({
      where: { id },
      data: { isActive: false },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'membership.revoke',
        target: 'StructureMembership',
        payload: { id, userId: membership.userId, roleId: membership.roleId },
      },
    })

    return NextResponse.json({ success: true, message: 'Rôle retiré' })
  } catch (error) {
    console.error('[API] Erreur DELETE membership:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du retrait du rôle' },
      { status: 500 }
    )
  }
}
