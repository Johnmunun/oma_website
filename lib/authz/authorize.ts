import 'server-only'

import type { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getEffectivePermissions } from './get-effective-permissions'
import { legacyRoleHasPermission } from './legacy'
import { hasPermissionInSet } from './permission-aliases'
import { isAuthzRecoverableError } from './schema'
import type { AuthorizeParams, AuthorizeResult } from './types'

type UserAuthRow = {
  isActive: boolean
  role: UserRole
  isRoot?: boolean
}

async function loadUserForAuth(userId: string): Promise<UserAuthRow | null> {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true, role: true, isRoot: true },
    })
  } catch (error) {
    if (!isAuthzRecoverableError(error)) throw error
    console.warn('[authz] Client Prisma obsolète — requête User sans isRoot')
    return prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true, role: true },
    })
  }
}

function authorizeLegacy(
  user: { role: UserRole },
  permission: string,
  legacyRole?: string | null
): AuthorizeResult {
  const role = (legacyRole ?? user.role) as UserRole
  if (legacyRoleHasPermission(role, permission)) {
    return { allowed: true, source: 'legacy' }
  }
  return { allowed: false, reason: 'Permission refusée (legacy)' }
}

export async function authorize(params: AuthorizeParams): Promise<AuthorizeResult> {
  const { userId, permission, structureId, legacyRole } = params

  try {
    const user = await loadUserForAuth(userId)

    if (!user || !user.isActive) {
      return { allowed: false, reason: 'Utilisateur inactif ou introuvable' }
    }

    if (user.isRoot) {
      return { allowed: true, source: 'root' }
    }

    let effective: Awaited<ReturnType<typeof getEffectivePermissions>>
    try {
      effective = await getEffectivePermissions(userId, structureId)
    } catch (membershipError) {
      if (isAuthzRecoverableError(membershipError)) {
        console.warn('[authz] RBAC indisponible — fallback legacy')
        return authorizeLegacy(user, permission, legacyRole)
      }
      throw membershipError
    }

    if (effective.isRoot) {
      return { allowed: true, source: 'root' }
    }

    if (effective.permissions.size > 0) {
      if (hasPermissionInSet(effective.permissions, permission)) {
        return { allowed: true, source: 'membership' }
      }
      return { allowed: false, reason: 'Permission manquante sur la structure' }
    }

    return authorizeLegacy(user, permission, legacyRole)
  } catch (error) {
    if (isAuthzRecoverableError(error)) {
      const role = legacyRole as UserRole | undefined
      if (role && legacyRoleHasPermission(role, permission)) {
        return { allowed: true, source: 'legacy' }
      }
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true, isActive: true },
        })
        if (user?.isActive) {
          return authorizeLegacy(user, permission, legacyRole)
        }
      } catch {
        // ignore
      }
    }

    console.error('[authz] authorize error:', error)
    return { allowed: false, reason: 'Erreur interne d\'autorisation' }
  }
}

export async function can(
  userId: string,
  permission: string,
  options?: { structureId?: string | null; legacyRole?: string | null }
): Promise<boolean> {
  const result = await authorize({
    userId,
    permission,
    structureId: options?.structureId,
    legacyRole: options?.legacyRole,
  })
  return result.allowed
}
