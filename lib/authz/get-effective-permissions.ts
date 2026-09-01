import 'server-only'

import { prisma } from '@/lib/prisma'
import { OMA_STRUCTURE_ID, ROOT_ROLE_ID } from './constants'
import { isAuthzRecoverableError } from './schema'

export type EffectivePermissionsResult = {
  permissions: Set<string>
  isRoot: boolean
  structureIds: string[]
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

    let memberships: Awaited<ReturnType<typeof prisma.structureMembership.findMany>>
    try {
      memberships = await prisma.structureMembership.findMany({
        where: {
          userId,
          isActive: true,
          structureId: targetStructureId,
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
      memberships = await prisma.structureMembership.findMany({
        where: {
          userId,
          isActive: true,
          structureId: targetStructureId,
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

    const permissions = new Set<string>()
    let isRoot = false

    for (const m of memberships) {
      if (!m.role.isActive) continue
      const role = m.role as { isRoot?: boolean; id: string }
      if (role.isRoot || role.id === ROOT_ROLE_ID) {
        isRoot = true
        break
      }
      for (const rp of m.role.permissions) {
        permissions.add(rp.permission.key)
      }
    }

    if (isRoot) {
      return { permissions: new Set(['*']), isRoot: true, structureIds: [targetStructureId] }
    }

    return {
      permissions,
      isRoot: false,
      structureIds: [targetStructureId],
    }
  } catch (error) {
    if (isAuthzRecoverableError(error)) return empty
    throw error
  }
}
