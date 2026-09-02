import 'server-only'

import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { OMA_STRUCTURE_ID, ROOT_ROLE_ID } from '@/lib/authz/constants'
import { hasPermissionInSet } from '@/lib/authz/permission-aliases'
import { isAuthzRecoverableError } from '@/lib/authz/schema'
import {
  requirePermission,
  isPermissionDenied,
  type PermissionSession,
} from '@/lib/authz/require-permission'

export type MessageListScope = {
  canViewAll: boolean
  structureIds: string[]
  hasAccess: boolean
}

export async function resolveMessageListScope(userId: string): Promise<MessageListScope> {
  const denied: MessageListScope = { canViewAll: false, structureIds: [], hasAccess: false }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isRoot: true, isActive: true, role: true },
    })

    if (!user?.isActive) return denied
    if (user.isRoot) return { canViewAll: true, structureIds: [], hasAccess: true }

    const memberships = await prisma.structureMembership.findMany({
      where: {
        userId,
        isActive: true,
        structure: { isActive: true },
      },
      include: {
        role: {
          include: {
            permissions: { include: { permission: { select: { key: true } } } },
          },
        },
      },
    })

    let canViewAll = false
    const structureIds: string[] = []

    for (const membership of memberships) {
      if (!membership.role.isActive) continue

      if (membership.role.isRoot || membership.role.id === ROOT_ROLE_ID) {
        canViewAll = true
        break
      }

      const permissions = new Set(
        membership.role.permissions.map((rp) => rp.permission.key)
      )
      if (!hasPermissionInSet(permissions, 'messages.view')) continue

      if (membership.structureId === OMA_STRUCTURE_ID) {
        canViewAll = true
        break
      }

      structureIds.push(membership.structureId)
    }

    if (canViewAll) {
      return { canViewAll: true, structureIds: [], hasAccess: true }
    }

    if (structureIds.length > 0) {
      return {
        canViewAll: false,
        structureIds: [...new Set(structureIds)],
        hasAccess: true,
      }
    }

    if (user.role === 'ADMIN' || user.role === 'EDITOR' || user.role === 'VIEWER') {
      return { canViewAll: true, structureIds: [], hasAccess: true }
    }

    return denied
  } catch (error) {
    if (isAuthzRecoverableError(error)) return denied
    throw error
  }
}

export function buildMessageWhere(
  scope: MessageListScope,
  options?: {
    isRead?: boolean
    isHidden?: boolean
    structureId?: string | null
  }
): Prisma.ContactMessageWhereInput {
  const where: Prisma.ContactMessageWhereInput = {}

  if (typeof options?.isRead === 'boolean') where.isRead = options.isRead
  where.isHidden = options?.isHidden ?? false

  if (options && options.structureId !== undefined) {
    where.structureId = options.structureId
    return where
  }

  if (scope.canViewAll) {
    return where
  }

  where.structureId = { in: scope.structureIds }
  return where
}

export async function requireMessagesListAccess(
  userId: string
): Promise<MessageListScope | NextResponse> {
  const scope = await resolveMessageListScope(userId)
  if (!scope.hasAccess) {
    return NextResponse.json(
      { success: false, error: 'Accès refusé — permission messages.view requise' },
      { status: 403 }
    )
  }
  return scope
}

export async function requireMessageMutationAccess(
  messageId: string,
  permission: 'messages.update' | 'messages.delete'
): Promise<
  | { ok: true; session: PermissionSession; message: { id: string; structureId: string | null } }
  | { ok: false; response: NextResponse }
> {
  const message = await prisma.contactMessage.findUnique({
    where: { id: messageId },
    select: { id: true, structureId: true },
  })

  if (!message) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Message introuvable' },
        { status: 404 }
      ),
    }
  }

  const permissionStructureId = message.structureId ?? OMA_STRUCTURE_ID
  const session = await requirePermission(permission, {
    structureId: permissionStructureId,
  })
  if (isPermissionDenied(session)) {
    return { ok: false, response: session }
  }

  const scope = await resolveMessageListScope(session.user.id)
  if (!scope.hasAccess) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 }),
    }
  }

  if (!scope.canViewAll) {
    if (!message.structureId || !scope.structureIds.includes(message.structureId)) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: 'Accès refusé à ce message' },
          { status: 403 }
        ),
      }
    }
  }

  return { ok: true, session, message }
}
