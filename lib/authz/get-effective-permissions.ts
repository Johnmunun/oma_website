import 'server-only'

import { prisma } from '@/lib/prisma'
import { OMA_STRUCTURE_ID, ROOT_ROLE_ID } from './constants'
import { isAuthzRecoverableError } from './schema'

export type EffectivePermissionsResult = {
  permissions: Set<string>
  isRoot: boolean
  structureIds: string[]
}

type MembershipWithRole = Array<{
  structureId: string
  role: {
    isActive: boolean
    isRoot?: boolean
    id: string
    permissions: Array<{ permission: { key: string } }>
  }
}>

async function loadActiveMemberships(userId: string): Promise<MembershipWithRole> {
  try {
    return await prisma.structureMembership.findMany({
      where: {
        userId,
        isActive: true,
        structure: { isActive: true },
      },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: { select: { key: true } } },
            },
          },
        },
      },
    })
  } catch (membershipError) {
    if (!isAuthzRecoverableError(membershipError)) throw membershipError
    return prisma.structureMembership.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: { select: { key: true } } },
            },
          },
        },
      },
    })
  }
}

function collectPermissionsFromMemberships(
  memberships: MembershipWithRole,
  options?: { structureId?: string }
): EffectivePermissionsResult {
  const permissions = new Set<string>()
  const structureIds = new Set<string>()

  for (const membership of memberships) {
    if (options?.structureId && membership.structureId !== options.structureId) continue
    if (!membership.role.isActive) continue

    const role = membership.role as { isRoot?: boolean; id: string }
    if (role.isRoot || role.id === ROOT_ROLE_ID) {
      return {
        permissions: new Set(['*']),
        isRoot: true,
        structureIds: options?.structureId ? [options.structureId] : ['*'],
      }
    }

    structureIds.add(membership.structureId)
    for (const rp of membership.role.permissions) {
      permissions.add(rp.permission.key)
    }
  }

  return {
    permissions,
    isRoot: false,
    structureIds: [...structureIds],
  }
}

/** Union des permissions sur toutes les structures actives de l'utilisateur */
export async function getAggregatedEffectivePermissions(
  userId: string
): Promise<EffectivePermissionsResult> {
  const empty: EffectivePermissionsResult = {
    permissions: new Set(),
    isRoot: false,
    structureIds: [],
  }

  try {
    let userIsRoot = false
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isRoot: true, isActive: true },
      })
      if (!user?.isActive) return empty
      userIsRoot = Boolean(user.isRoot)
    } catch (userError) {
      if (!isAuthzRecoverableError(userError)) throw userError
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isActive: true, role: true },
      })
      if (!user?.isActive) return empty
      userIsRoot = user.role === 'ADMIN'
    }

    if (userIsRoot) {
      return { permissions: new Set(['*']), isRoot: true, structureIds: ['*'] }
    }

    const memberships = await loadActiveMemberships(userId)
    return collectPermissionsFromMemberships(memberships)
  } catch (error) {
    if (isAuthzRecoverableError(error)) return empty
    throw error
  }
}

export async function getEffectivePermissions(
  userId: string,
  structureId?: string | null
): Promise<EffectivePermissionsResult> {
  const targetStructureId = structureId ?? OMA_STRUCTURE_ID
  const empty: EffectivePermissionsResult = {
    permissions: new Set(),
    isRoot: false,
    structureIds: [],
  }

  try {
    let userIsRoot = false
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isRoot: true, isActive: true },
      })
      if (!user?.isActive) return empty
      userIsRoot = Boolean(user.isRoot)
    } catch (userError) {
      if (!isAuthzRecoverableError(userError)) throw userError
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isActive: true, role: true },
      })
      if (!user?.isActive) return empty
      userIsRoot = user.role === 'ADMIN'
    }

    if (userIsRoot) {
      return { permissions: new Set(['*']), isRoot: true, structureIds: ['*'] }
    }

    const memberships = await loadActiveMemberships(userId)
    return collectPermissionsFromMemberships(memberships, {
      structureId: targetStructureId,
    })
  } catch (error) {
    if (isAuthzRecoverableError(error)) return empty
    throw error
  }
}
