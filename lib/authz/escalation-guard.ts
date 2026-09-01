import 'server-only'

import type { PermissionSession } from './require-permission'
import { getEffectivePermissions } from './get-effective-permissions'
import { hasPermissionInSet } from './permission-aliases'
import { prisma } from '@/lib/prisma'

/**
 * Vérifie qu'un utilisateur ne peut attribuer que des permissions qu'il possède.
 * ROOT bypass cette règle.
 */
export async function assertCanAssignPermissions(
  actor: PermissionSession,
  permissionKeys: string[],
  structureId?: string | null
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const effective = await getEffectivePermissions(actor.user.id, structureId)

  if (effective.isRoot) return { ok: true }

  for (const key of permissionKeys) {
    if (!hasPermissionInSet(effective.permissions, key)) {
      return {
        ok: false,
        reason: `Permission non autorisée pour attribution : ${key}`,
      }
    }
  }

  return { ok: true }
}

export async function assertCanAssignRole(
  actor: PermissionSession,
  roleId: string,
  structureId?: string | null
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      permissions: { include: { permission: { select: { key: true } } } },
    },
  })

  if (!role) return { ok: false, reason: 'Rôle introuvable' }
  if (role.isRoot) {
    const effective = await getEffectivePermissions(actor.user.id, structureId)
    if (!effective.isRoot) {
      return { ok: false, reason: 'Seul ROOT peut attribuer le rôle ROOT' }
    }
    return { ok: true }
  }

  const keys = role.permissions.map((rp) => rp.permission.key)
  return assertCanAssignPermissions(actor, keys, structureId)
}
